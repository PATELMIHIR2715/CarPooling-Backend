// src/routes/users.ts
// User, auth, and billing routes.
import { Router, Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Thin wrapper around node-postgres: db.query<T>(text, params?) => Promise<{ rows: T[] }>.
const db = {
  async query<T>(text: string, params?: unknown[]): Promise<{ rows: T[] }> {
    const result = await pool.query(text, params);
    return { rows: result.rows as T[] };
  },
};

async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  await pool.query(
    "INSERT INTO email_log (recipient, subject, body) VALUES ($1, $2, $3)",
    [to, subject, body]
  );
}

async function chargeCard(
  customerId: string,
  amount: number
): Promise<{ ok: boolean; id: string }> {
  const receipt = await pool.query<{ id: string }>(
    "INSERT INTO charges (customer_id, amount) VALUES ($1, $2) RETURNING id",
    [customerId, amount]
  );
  return { ok: true, id: receipt.rows[0].id };
}

const router = Router();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable must be set");
}
const JWT_SECRET = process.env.JWT_SECRET;

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  password_hash: string;
  stripe_customer_id: string;
}

interface LineItem {
  price: number;
  qty: number;
}

interface AuthPayload {
  id: number;
  role: string;
}

// Verifies the bearer token in the Authorization header, returning the
// decoded payload or null if missing/invalid.
function getAuthUser(req: Request): AuthPayload | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

const USER_CACHE_MAX_SIZE = 500;
const USER_CACHE_TTL_MS = 60_000;

// Bounded, TTL-expiring cache of recently fetched users, keyed by id.
class UserCache {
  private entries = new Map<string, { user: User; expiresAt: number }>();

  get(id: string): User | undefined {
    const entry = this.entries.get(id);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(id);
      return undefined;
    }
    return entry.user;
  }

  set(id: string, user: User): void {
    this.entries.delete(id);
    if (this.entries.size >= USER_CACHE_MAX_SIZE) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey !== undefined) this.entries.delete(oldestKey);
    }
    this.entries.set(id, { user, expiresAt: Date.now() + USER_CACHE_TTL_MS });
  }

  delete(id: string): void {
    this.entries.delete(id);
  }
}

const userCache = new UserCache();

// ---------------------------------------------------------------------------
// GET /users/search?name=...
// Find users by (partial) name.
// ---------------------------------------------------------------------------
router.get("/search", async (req: Request, res: Response) => {
  const name = req.query.name as string;
  const result = await db.query<User>(
    "SELECT id, email, name, role FROM users WHERE name LIKE '%' || $1 || '%'",
    [name]
  );
  res.json(result.rows);
});

// ---------------------------------------------------------------------------
// POST /users/login
// Verify credentials, issue a JWT.
// ---------------------------------------------------------------------------
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await db.query<User>("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (valid) {
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log(`User ${email} logged in`);
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// ---------------------------------------------------------------------------
// POST /users/reset-token
// Generate a password-reset token and email it.
// ---------------------------------------------------------------------------
router.post("/reset-token", async (req: Request, res: Response) => {
  const { email } = req.body;
  // Short-lived numeric reset code.
  const code = crypto.randomInt(100000, 1000000);

  await db.query("UPDATE users SET reset_code = $1 WHERE email = $2", [
    code,
    email,
  ]);
  try {
    await sendEmail(email, "Your reset code", `Your code is ${code}`);
  } catch (err) {
    console.error(`Failed to send reset code email to ${email}`, err);
  }

  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// GET /users/:id
// Fetch a single user, using the in-memory cache.
// ---------------------------------------------------------------------------
router.get("/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (authUser.role !== "admin" && String(authUser.id) !== id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const cached = userCache.get(id);
  if (cached) {
    return res.json(cached);
  }

  const result = await db.query<User>(
    "SELECT id, email, name, role FROM users WHERE id = $1",
    [id]
  );
  const user = result.rows[0];
  userCache.set(id, user);
  res.json(user);
});

// ---------------------------------------------------------------------------
// POST /users/:id/charge
// Charge a user's saved card for a list of line items.
// ---------------------------------------------------------------------------
router.post("/:id/charge", async (req: Request, res: Response) => {
  const id = req.params.id;
  const items: LineItem[] = req.body.items;

  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (authUser.role !== "admin" && String(authUser.id) !== id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const result = await db.query<User>("SELECT * FROM users WHERE id = $1", [
    id,
  ]);
  const user = result.rows[0];

  // Sum the order total.
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].qty;
  }

  // Charge the card and record the payment.
  const charge = await chargeCard(user.stripe_customer_id, total);
  if (!charge.ok) {
    return res.status(502).json({ error: "Charge failed" });
  }
  await db.query("INSERT INTO payments (user_id, amount) VALUES ($1, $2)", [
    id,
    total,
  ]);

  res.json({ charged: total });
});

// ---------------------------------------------------------------------------
// GET /users/:id/orders-enriched
// Return the user's orders, each enriched with product details.
// ---------------------------------------------------------------------------
router.get("/:id/orders-enriched", async (req: Request, res: Response) => {
  const id = req.params.id;

  const orders = await db.query<any>("SELECT * FROM orders WHERE user_id = $1", [
    id,
  ]);

  const productIds = [...new Set(orders.rows.map((order) => order.product_id))];
  const products = await db.query<any>(
    "SELECT * FROM products WHERE id = ANY($1)",
    [productIds]
  );
  const productsById = new Map(products.rows.map((product) => [product.id, product]));

  const enriched = orders.rows.map((order) => ({
    ...order,
    product: productsById.get(order.product_id),
  }));

  res.json(enriched);
});

// ---------------------------------------------------------------------------
// DELETE /users/:id
// Delete a user. Admins only.
// ---------------------------------------------------------------------------
router.delete("/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const decoded = getAuthUser(req);
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (decoded.role === "admin") {
    await db.query("DELETE FROM users WHERE id = $1", [id]);
    userCache.delete(id);
    res.json({ deleted: true });
  } else {
    res.status(403).json({ error: "Forbidden" });
  }
});

export default router;

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

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production");
}
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-please-change";

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

// In-memory cache of recently fetched users, keyed by id.
const userCache: Record<string, User> = {};

// Verify the caller's JWT and, unless they're an admin, require it to match
// the :id route param. Sends a response and returns null when unauthorized.
function authorizeForUser(
  req: Request,
  res: Response,
  targetId: string
): { id: number; role: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  let decoded: { id: number; role: string };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  if (decoded.role !== "admin" && String(decoded.id) !== targetId) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }

  return decoded;
}

// ---------------------------------------------------------------------------
// GET /users/search?name=...
// Find users by (partial) name.
// ---------------------------------------------------------------------------
router.get("/search", async (req: Request, res: Response) => {
  const name = typeof req.query.name === "string" ? req.query.name : "";
  // Escape LIKE wildcards in the untrusted input so they aren't interpreted as patterns.
  const escapedName = name.replace(/[\\%_]/g, "\\$&");
  const result = await db.query<User>(
    "SELECT id, email, name, role FROM users WHERE name LIKE $1",
    [`%${escapedName}%`]
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

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (passwordMatches) {
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    console.log(`User ${email} logged in successfully`);
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
    return res.status(500).json({ error: "Failed to send reset email" });
  }

  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// GET /users/:id
// Fetch a single user, using the in-memory cache.
// ---------------------------------------------------------------------------
router.get("/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);

  if (!authorizeForUser(req, res, id)) {
    return;
  }

  if (userCache[id]) {
    return res.json(userCache[id]);
  }

  const result = await db.query<User>(
    "SELECT id, email, name, role FROM users WHERE id = $1",
    [id]
  );
  const user = result.rows[0];
  userCache[id] = user;
  res.json(user);
});

// ---------------------------------------------------------------------------
// POST /users/:id/charge
// Charge a user's saved card for a list of line items.
// ---------------------------------------------------------------------------
router.post("/:id/charge", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const items: LineItem[] = req.body.items;

  if (!authorizeForUser(req, res, id)) {
    return;
  }

  const result = await db.query<User>("SELECT * FROM users WHERE id = $1", [
    id,
  ]);
  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

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
  const id = String(req.params.id);

  if (!authorizeForUser(req, res, id)) {
    return;
  }

  const orders = await db.query<any>("SELECT * FROM orders WHERE user_id = $1", [
    id,
  ]);

  const productIds = [...new Set(orders.rows.map((order) => order.product_id))];
  const products = productIds.length
    ? await db.query<any>("SELECT * FROM products WHERE id = ANY($1)", [
        productIds,
      ])
    : { rows: [] };
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
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  let decoded: { id: number; role: string };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (decoded.role === "admin") {
    await db.query("DELETE FROM users WHERE id = $1", [id]);
    delete userCache[id];
    res.json({ deleted: true });
  } else {
    res.status(403).json({ error: "Forbidden" });
  }
});

export default router;

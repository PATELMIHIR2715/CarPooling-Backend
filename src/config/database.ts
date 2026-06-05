import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import env from "./env.js";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
  ssl: false,
});

const prisma = new PrismaClient({ adapter });

export default prisma;

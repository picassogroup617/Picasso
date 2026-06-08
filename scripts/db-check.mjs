/**
 * Verifies the database is reachable using DATABASE_URL from `.env.local`.
 *
 * Usage:  npm run db:check
 *
 * Prints only success/failure — never echoes the connection string.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = resolve(__dirname, "..", ".env.local");

if (!existsSync(envFile)) {
  console.error("ERROR: .env.local not found. Create it from .env.example and fill values.");
  process.exit(1);
}

// Tiny .env parser (avoids adding `dotenv` just for one script)
for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/i);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2];
  }
}

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is empty in .env.local.");
  process.exit(1);
}

let PrismaClient;
let PrismaPg;
try {
  ({ PrismaClient } = await import("@prisma/client"));
  ({ PrismaPg } = await import("@prisma/adapter-pg"));
} catch {
  console.error(
    'ERROR: @prisma/client or @prisma/adapter-pg not found. Run "npx prisma generate" first.',
  );
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  const rows = await prisma.$queryRaw`SELECT 1 AS ok`;
  if (rows?.[0]?.ok === 1) {
    console.log("OK: Database connection succeeded.");
  } else {
    console.log("OK: Query executed but unexpected result:", rows);
  }
  process.exit(0);
} catch (err) {
  console.error("FAIL: Could not connect to the database.");
  console.error(`Reason: ${err?.message ?? err}`);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}

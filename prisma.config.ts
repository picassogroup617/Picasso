/**
 * Prisma 7+ configuration.
 *
 * The CLI uses the `datasource.url` defined here for migrations / introspection.
 * For Neon (or any pgbouncer-pooled Postgres), use the DIRECT (unpooled) URL here,
 * and the POOLED URL at runtime in `src/lib/prisma.ts`.
 *
 * `.env.local` is loaded explicitly because Prisma's CLI only auto-loads `.env`,
 * while Next.js convention puts secrets in `.env.local`.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" }); // fallback, does not override

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});

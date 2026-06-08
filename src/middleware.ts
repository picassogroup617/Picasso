import NextAuth from "next-auth";
import { authConfig } from "@/infrastructure/auth/auth.config";

/**
 * Edge-safe middleware that protects /picassoadd/* routes.
 * Uses only the lightweight `authConfig` (no Prisma/bcrypt imports).
 * Redirect / authorization rules live in `authConfig.callbacks.authorized`.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    // Run middleware on everything except Next internals, static assets, and the auth API
    "/((?!_next/static|_next/image|favicon.ico|api/auth|brand/.*\\.(?:png|svg|jpg|jpeg|webp)).*)",
  ],
};

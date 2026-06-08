import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/infrastructure/auth/auth.config";
import { loginSchema } from "@/domain/schemas/auth";
import { verifyPassword } from "@/infrastructure/auth/password";
import { getContainer } from "@/lib/container";

/**
 * Full Auth.js setup (Node runtime).
 * Composes the edge-safe `authConfig` with the credentials provider,
 * which uses Prisma + bcryptjs (not edge-compatible).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { userRepository } = getContainer();
        const user = await userRepository.findByEmailWithCredentials(parsed.data.email);
        if (!user || !user.isActive) return null;

        const ok = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});

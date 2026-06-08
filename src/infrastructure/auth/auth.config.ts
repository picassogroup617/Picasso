import type { NextAuthConfig } from "next-auth";
import { Role } from "@/domain/entities/role";

/**
 * Edge-safe Auth.js configuration.
 *
 * Contains ONLY config that works on the edge runtime (used by middleware).
 * The credentials provider and Prisma adapter live in `src/auth.ts`
 * because they require the Node runtime (bcryptjs, Prisma).
 *
 * Auth.js v5 splits config this way so middleware stays fast and edge-compatible.
 */
/** Hours for which a signed-in session stays valid before re-auth is required.
 *  Kept short so a revoked / demoted account cannot keep its old role for
 *  weeks. Active sessions are refreshed on activity via `updateAge`. */
const SESSION_MAX_AGE_HOURS = 8;

export const authConfig = {
  pages: {
    signIn: "/picassoadd/login",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_HOURS * 60 * 60,
    updateAge: 60 * 60,
  },
  callbacks: {
    jwt({ token, user }) {
      // On sign-in, persist role + id on the JWT
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isAdminArea = request.nextUrl.pathname.startsWith("/picassoadd");
      const isLoginPage = request.nextUrl.pathname === "/picassoadd/login";
      const isLoggedIn = !!auth?.user;

      if (isLoginPage) {
        // If already logged in, bounce to dashboard
        if (isLoggedIn) {
          return Response.redirect(new URL("/picassoadd/dashboard", request.nextUrl));
        }
        return true;
      }

      if (isAdminArea && !isLoggedIn) {
        return false; // triggers redirect to signIn page
      }

      return true;
    },
  },
  providers: [], // populated in `src/auth.ts`
} satisfies NextAuthConfig;

import { cache } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Role } from "@/domain/entities/role";
import { getContainer } from "@/lib/container";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/**
 * Loads the current session and ensures the user is signed in.
 *
 * Re-validates the user against the database on every call so that a deleted
 * or deactivated account, or a role change, takes effect immediately rather
 * than waiting up to the JWT `maxAge`. Wrapped in React's `cache()` so calls
 * from multiple server components in the same render share one DB read.
 */
export const requireUser = cache(async (): Promise<SessionUser> => {
  const session = await auth();
  if (!session?.user) {
    redirect("/picassoadd/login");
  }

  const { userRepository } = getContainer();
  const fresh = await userRepository.findById(session.user.id);
  if (!fresh || !fresh.isActive) {
    await signOut({ redirect: false });
    redirect("/picassoadd/login?error=session-revoked");
  }

  return {
    id: fresh.id,
    name: fresh.name,
    email: fresh.email,
    role: fresh.role,
  };
});

/**
 * Loads the current session and ensures the user has one of the allowed roles.
 * Redirects to dashboard with a 403 hint if the role is wrong.
 */
export async function requireRole(allowed: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) {
    redirect("/picassoadd/dashboard?error=forbidden");
  }
  return user;
}

/** Convenience: write-capable roles only. */
export function requireWriter() {
  return requireRole([Role.ADMIN, Role.EDITOR]);
}

/** Convenience: admin only. */
export function requireAdmin() {
  return requireRole([Role.ADMIN]);
}

/**
 * Mirror of Prisma `Role` enum, used by client/edge code that cannot import
 * from `@prisma/client` (e.g. Next.js middleware running on the edge runtime).
 */
export const Role = {
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLES_ALL: Role[] = [Role.ADMIN, Role.EDITOR, Role.VIEWER];

/** Roles permitted to write content (create/update/delete). */
export const ROLES_WRITE: Role[] = [Role.ADMIN, Role.EDITOR];

/** Roles permitted to manage users. */
export const ROLES_USER_ADMIN: Role[] = [Role.ADMIN];

import type { Role } from "./role";

/** Public-facing user shape (no password hash). */
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
}

import type { User } from "../entities/user";
import type { Role } from "../entities/role";

/** Internal shape including credentials — never sent to client. */
export interface UserWithCredentials extends User {
  passwordHash: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
}

/**
 * Repository contract for User persistence.
 * Application services depend on this abstraction, not on Prisma directly.
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithCredentials(email: string): Promise<UserWithCredentials | null>;
  /** Single-query alternative to chaining findById + findByEmailWithCredentials. */
  findByIdWithCredentials(id: string): Promise<UserWithCredentials | null>;
  /** Lightweight uniqueness check (selects only the id column). */
  existsByEmail(email: string): Promise<boolean>;
  /**
   * Counts active admins, optionally excluding `excludingUserId` (typically
   * the user about to be demoted/deleted) so the caller can verify that at
   * least one admin remains without loading every user.
   */
  countActiveAdmins(excludingUserId?: string): Promise<number>;
  create(input: CreateUserInput): Promise<User>;
  list(): Promise<User[]>;
  update(id: string, data: Partial<Pick<User, "name" | "role" | "isActive">>): Promise<User>;
  setPassword(id: string, passwordHash: string): Promise<void>;
  delete(id: string): Promise<void>;
}

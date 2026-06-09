import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { User } from "@/domain/entities/user";
import { Role } from "@/domain/entities/role";
import type {
  AdminResetPasswordInput,
  ChangeOwnPasswordInput,
  CreateUserInput,
  UpdateOwnProfileInput,
  UpdateUserInput,
} from "@/domain/schemas/user";

export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

/**
 * Encapsulates user-management business rules:
 *  - email uniqueness
 *  - password hashing
 *  - safeguards so the last active admin cannot demote/deactivate themselves
 */
export class UserService {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
  ) {}

  list() {
    return this.users.list();
  }

  getById(id: string) {
    return this.users.findById(id);
  }

  async create(input: CreateUserInput): Promise<User> {
    if (await this.users.existsByEmail(input.email)) {
      throw new Error("A user with this email already exists.");
    }
    const passwordHash = await this.hasher.hash(input.password);
    return this.users.create({
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
    });
  }

  async update(id: string, currentUserId: string, input: UpdateUserInput): Promise<User> {
    const target = await this.users.findById(id);
    if (!target) throw new Error("User not found.");

    const becomingNonAdmin = target.role === Role.ADMIN && input.role !== Role.ADMIN;
    const beingDeactivated = target.isActive && !input.isActive;

    if (id === currentUserId && (becomingNonAdmin || beingDeactivated)) {
      throw new Error("You cannot remove your own admin role or deactivate yourself.");
    }

    if (becomingNonAdmin || beingDeactivated) {
      await this.ensureNotLastActiveAdmin(id);
    }

    return this.users.update(id, input);
  }

  async resetPassword(id: string, input: AdminResetPasswordInput): Promise<void> {
    const target = await this.users.findById(id);
    if (!target) throw new Error("User not found.");
    const passwordHash = await this.hasher.hash(input.newPassword);
    await this.users.setPassword(id, passwordHash);
  }

  async changeOwnPassword(id: string, input: ChangeOwnPasswordInput): Promise<void> {
    const current = await this.users.findByIdWithCredentials(id);
    if (!current) throw new Error("User not found.");

    const ok = await this.hasher.verify(input.currentPassword, current.passwordHash);
    if (!ok) throw new Error("Your current password is incorrect.");

    const passwordHash = await this.hasher.hash(input.newPassword);
    await this.users.setPassword(id, passwordHash);
  }

  async updateOwnProfile(id: string, input: UpdateOwnProfileInput): Promise<User> {
    const target = await this.users.findById(id);
    if (!target) throw new Error("User not found.");
    return this.users.update(id, { name: input.name });
  }

  async delete(id: string, currentUserId: string): Promise<void> {
    if (id === currentUserId) {
      throw new Error("You cannot delete yourself.");
    }
    const target = await this.users.findById(id);
    if (!target) return; // idempotent
    if (target.role === Role.ADMIN) {
      await this.ensureNotLastActiveAdmin(id);
    }
    await this.users.delete(id);
  }

  private async ensureNotLastActiveAdmin(excludingUserId: string) {
    const remaining = await this.users.countActiveAdmins(excludingUserId);
    if (remaining === 0) {
      throw new Error("At least one active admin must remain.");
    }
  }
}

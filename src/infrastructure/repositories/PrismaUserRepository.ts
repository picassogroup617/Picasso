import type { PrismaClient } from "@prisma/client";
import type {
  CreateUserInput,
  IUserRepository,
  UserWithCredentials,
} from "@/domain/interfaces/IUserRepository";
import type { User } from "@/domain/entities/user";
import type { Role } from "@/domain/entities/role";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  private toUser(row: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
  }): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as Role,
      isActive: row.isActive,
    };
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? this.toUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { email } });
    return row ? this.toUser(row) : null;
  }

  async findByEmailWithCredentials(email: string): Promise<UserWithCredentials | null> {
    const row = await this.db.user.findUnique({ where: { email } });
    if (!row) return null;
    return { ...this.toUser(row), passwordHash: row.passwordHash };
  }

  async create(input: CreateUserInput): Promise<User> {
    const row = await this.db.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
        role: input.role,
      },
    });
    return this.toUser(row);
  }

  async list(): Promise<User[]> {
    const rows = await this.db.user.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((r) => this.toUser(r));
  }

  async update(
    id: string,
    data: Partial<Pick<User, "name" | "role" | "isActive">>,
  ): Promise<User> {
    const row = await this.db.user.update({ where: { id }, data });
    return this.toUser(row);
  }

  async setPassword(id: string, passwordHash: string): Promise<void> {
    await this.db.user.update({ where: { id }, data: { passwordHash } });
  }

  async delete(id: string): Promise<void> {
    await this.db.user.delete({ where: { id } });
  }
}

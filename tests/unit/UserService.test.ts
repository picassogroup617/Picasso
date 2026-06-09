import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService, type IPasswordHasher } from "@/application/services/UserService";
import type {
  IUserRepository,
  UserWithCredentials,
} from "@/domain/interfaces/IUserRepository";
import type { User } from "@/domain/entities/user";
import { Role } from "@/domain/entities/role";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    email: "user@example.com",
    name: "User",
    role: Role.VIEWER,
    isActive: true,
    ...overrides,
  };
}

function makeRepo(): IUserRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByEmailWithCredentials: vi.fn(),
    findByIdWithCredentials: vi.fn(),
    existsByEmail: vi.fn().mockResolvedValue(false),
    countActiveAdmins: vi.fn().mockResolvedValue(1),
    create: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    setPassword: vi.fn(),
    delete: vi.fn(),
  };
}

function makeHasher(): IPasswordHasher {
  return {
    hash: vi.fn(async (p: string) => `hashed:${p}`),
    verify: vi.fn(async (p: string, h: string) => h === `hashed:${p}`),
  };
}

let repo: IUserRepository;
let hasher: IPasswordHasher;
let service: UserService;

beforeEach(() => {
  repo = makeRepo();
  hasher = makeHasher();
  service = new UserService(repo, hasher);
});

describe("UserService.create", () => {
  it("rejects when the email is already taken", async () => {
    (repo.existsByEmail as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    await expect(
      service.create({
        email: "user@example.com",
        name: "X",
        password: "secret123",
        role: Role.EDITOR,
      }),
    ).rejects.toThrow(/already exists/i);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("hashes the password before persisting", async () => {
    (repo.existsByEmail as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    (repo.create as ReturnType<typeof vi.fn>).mockImplementation(async (d) =>
      makeUser({ id: "new", email: d.email, name: d.name, role: d.role }),
    );

    await service.create({
      email: "new@example.com",
      name: "New",
      password: "secret123",
      role: Role.EDITOR,
    });

    expect(hasher.hash).toHaveBeenCalledWith("secret123");
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: "hashed:secret123" }),
    );
  });
});

describe("UserService.update", () => {
  it("prevents users from removing their own admin role", async () => {
    const me = makeUser({ id: "u1", role: Role.ADMIN });
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(me);
    await expect(
      service.update("u1", "u1", { name: me.name, role: Role.EDITOR, isActive: true }),
    ).rejects.toThrow(/cannot remove your own admin role/i);
  });

  it("prevents users from deactivating themselves", async () => {
    const me = makeUser({ id: "u1", role: Role.ADMIN });
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(me);
    await expect(
      service.update("u1", "u1", { name: me.name, role: Role.ADMIN, isActive: false }),
    ).rejects.toThrow(/deactivate yourself/i);
  });

  it("blocks demoting the last active admin", async () => {
    const target = makeUser({ id: "a1", role: Role.ADMIN });
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(target);
    (repo.countActiveAdmins as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    await expect(
      service.update("a1", "other", { name: "T", role: Role.EDITOR, isActive: true }),
    ).rejects.toThrow(/at least one active admin/i);
    expect(repo.countActiveAdmins).toHaveBeenCalledWith("a1");
  });

  it("allows demoting an admin when another active admin remains", async () => {
    const target = makeUser({ id: "a1", role: Role.ADMIN });
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(target);
    (repo.countActiveAdmins as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    (repo.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeUser({ id: "a1", role: Role.EDITOR }),
    );
    await expect(
      service.update("a1", "other", { name: "T", role: Role.EDITOR, isActive: true }),
    ).resolves.toMatchObject({ role: Role.EDITOR });
  });
});

describe("UserService.delete", () => {
  it("refuses to delete the current user", async () => {
    await expect(service.delete("u1", "u1")).rejects.toThrow(/cannot delete yourself/i);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("is idempotent for unknown ids", async () => {
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.delete("missing", "me")).resolves.toBeUndefined();
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("blocks deleting the last active admin", async () => {
    const target = makeUser({ id: "a1", role: Role.ADMIN });
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(target);
    (repo.countActiveAdmins as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    await expect(service.delete("a1", "other")).rejects.toThrow(
      /at least one active admin/i,
    );
    expect(repo.delete).not.toHaveBeenCalled();
  });
});

describe("UserService.changeOwnPassword", () => {
  it("rejects when the current password does not verify", async () => {
    const u = makeUser({ id: "u1" });
    const creds: UserWithCredentials = { ...u, passwordHash: "hashed:correct" };
    (repo.findByIdWithCredentials as ReturnType<typeof vi.fn>).mockResolvedValue(creds);

    await expect(
      service.changeOwnPassword("u1", { currentPassword: "wrong", newPassword: "newpass12" }),
    ).rejects.toThrow(/current password is incorrect/i);
    expect(repo.setPassword).not.toHaveBeenCalled();
  });

  it("stores a hash of the new password when the current one verifies", async () => {
    const u = makeUser({ id: "u1" });
    const creds: UserWithCredentials = { ...u, passwordHash: "hashed:correct" };
    (repo.findByIdWithCredentials as ReturnType<typeof vi.fn>).mockResolvedValue(creds);

    await service.changeOwnPassword("u1", {
      currentPassword: "correct",
      newPassword: "brandnew12",
    });
    expect(repo.setPassword).toHaveBeenCalledWith("u1", "hashed:brandnew12");
  });
});

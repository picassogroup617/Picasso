import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryService } from "@/application/services/CategoryService";
import type { ICategoryRepository } from "@/domain/interfaces/ICategoryRepository";
import type { IImageStorage } from "@/domain/interfaces/IImageStorage";
import type { IImageUsage } from "@/domain/interfaces/IImageUsage";
import type { Category } from "@/domain/entities/category";
import type { CategoryInput } from "@/domain/schemas/category";

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: "c1",
    slug: "widgets",
    name: "Widgets",
    shortDescription: "Things",
    imageUrl: "https://cdn/img.jpg",
    imagePublicId: "folder/widgets",
    order: 0,
    isPublished: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

function makeInput(overrides: Partial<CategoryInput> = {}): CategoryInput {
  return {
    name: "Widgets",
    shortDescription: "Things",
    imageUrl: "https://cdn/img.jpg",
    imagePublicId: "folder/widgets",
    order: 0,
    isPublished: true,
    ...overrides,
  } as CategoryInput;
}

function makeRepo(): ICategoryRepository {
  return {
    list: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    existsById: vi.fn().mockResolvedValue(true),
    findSlugsStartingWith: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countProducts: vi.fn(),
  };
}

function makeImages(): IImageStorage {
  return { delete: vi.fn().mockResolvedValue(undefined) };
}

function makeImageUsage(refCount = 0): IImageUsage {
  return {
    countReferences: vi.fn().mockResolvedValue(refCount),
    countReferencesMany: vi
      .fn()
      .mockImplementation(
        async (ids: readonly string[]) =>
          new Map(ids.map((id) => [id, refCount])),
      ),
  };
}

let repo: ICategoryRepository;
let images: IImageStorage;
let imageUsage: IImageUsage;
let service: CategoryService;

beforeEach(() => {
  repo = makeRepo();
  images = makeImages();
  imageUsage = makeImageUsage(0);
  service = new CategoryService(repo, images, imageUsage);
});

describe("CategoryService read paths", () => {
  it("findBySlug returns null when the repository has no match", async () => {
    (repo.findBySlug as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.findBySlug("ghost")).resolves.toBeNull();
  });

  it("list forwards publishedOnly and limit filters to the repository", async () => {
    (repo.list as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await service.list({ publishedOnly: true, limit: 6 });
    expect(repo.list).toHaveBeenCalledWith({ publishedOnly: true, limit: 6 });
  });

  it("list with no filters degrades to an empty array without throwing", async () => {
    (repo.list as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await expect(service.list()).resolves.toEqual([]);
    expect(repo.list).toHaveBeenCalledWith(undefined);
  });
});

describe("CategoryService.create", () => {
  it("auto-generates a slug from the name when none is supplied", async () => {
    (repo.findBySlug as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (repo.create as ReturnType<typeof vi.fn>).mockImplementation(async (d) =>
      makeCategory({ slug: d.slug }),
    );

    await service.create(makeInput({ name: "Hand Tools" }));

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "hand-tools" }),
    );
  });

  it("appends a numeric suffix when the slug collides", async () => {
    (repo.findSlugsStartingWith as ReturnType<typeof vi.fn>).mockResolvedValue([
      "widgets",
      "widgets-2",
    ]);
    (repo.create as ReturnType<typeof vi.fn>).mockImplementation(async (d) =>
      makeCategory({ slug: d.slug }),
    );

    await service.create(makeInput({ name: "Widgets" }));

    expect(repo.findSlugsStartingWith).toHaveBeenCalledWith("widgets");
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "widgets-3" }),
    );
  });
});

describe("CategoryService.update", () => {
  it("keeps the existing slug when the name slugifies to the same value", async () => {
    const existing = makeCategory({ slug: "widgets" });
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existing);
    (repo.update as ReturnType<typeof vi.fn>).mockImplementation(async (_id, d) =>
      makeCategory({ ...existing, ...d }),
    );

    await service.update("c1", makeInput({ name: "Widgets" }));

    expect(repo.findSlugsStartingWith).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledWith(
      "c1",
      expect.objectContaining({ slug: "widgets" }),
    );
  });

  it("deletes the previous image when the publicId changes", async () => {
    const existing = makeCategory({ imagePublicId: "old/id" });
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existing);
    (repo.update as ReturnType<typeof vi.fn>).mockImplementation(async (_id, d) =>
      makeCategory({ ...existing, ...d }),
    );

    await service.update(
      "c1",
      makeInput({ imageUrl: "https://cdn/new.jpg", imagePublicId: "new/id" }),
    );

    expect(images.delete).toHaveBeenCalledWith("old/id");
  });

  it("does not delete the image when the publicId is unchanged", async () => {
    const existing = makeCategory({ imagePublicId: "same/id" });
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existing);
    (repo.update as ReturnType<typeof vi.fn>).mockImplementation(async (_id, d) =>
      makeCategory({ ...existing, ...d }),
    );

    await service.update("c1", makeInput({ imagePublicId: "same/id" }));
    expect(images.delete).not.toHaveBeenCalled();
  });

  it("persists a null imageUrl when the form is submitted without an image", async () => {
    const existing = makeCategory({ imagePublicId: null, imageUrl: null });
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existing);
    (repo.update as ReturnType<typeof vi.fn>).mockImplementation(async (_id, d) =>
      makeCategory({ ...existing, ...d }),
    );

    await service.update(
      "c1",
      makeInput({ imageUrl: undefined, imagePublicId: undefined }),
    );

    expect(repo.update).toHaveBeenCalledWith(
      "c1",
      expect.objectContaining({ imageUrl: null, imagePublicId: null }),
    );
    expect(images.delete).not.toHaveBeenCalled();
  });

  it("keeps the previous image in Cloudinary when another row still references it", async () => {
    const existing = makeCategory({ imagePublicId: "shared/id" });
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existing);
    (repo.update as ReturnType<typeof vi.fn>).mockImplementation(async (_id, d) =>
      makeCategory({ ...existing, ...d }),
    );
    (imageUsage.countReferencesMany as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Map([["shared/id", 2]]),
    );

    await service.update(
      "c1",
      makeInput({ imageUrl: "https://cdn/new.jpg", imagePublicId: "new/id" }),
    );

    expect(imageUsage.countReferencesMany).toHaveBeenCalledWith(["shared/id"]);
    expect(images.delete).not.toHaveBeenCalled();
  });

  it("throws when the category does not exist", async () => {
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.update("missing", makeInput())).rejects.toThrow(/not found/i);
  });
});

describe("CategoryService.delete", () => {
  it("blocks deletion when the category has products", async () => {
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(makeCategory());
    (repo.countProducts as ReturnType<typeof vi.fn>).mockResolvedValue(3);

    await expect(service.delete("c1")).rejects.toThrow(/still has 3 products/i);
    expect(repo.delete).not.toHaveBeenCalled();
    expect(images.delete).not.toHaveBeenCalled();
  });

  it("uses singular wording when there is exactly one product", async () => {
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(makeCategory());
    (repo.countProducts as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    await expect(service.delete("c1")).rejects.toThrow(/still has 1 product\b/i);
  });

  it("deletes the record and its image when no products are attached", async () => {
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeCategory({ imagePublicId: "folder/widgets" }),
    );
    (repo.countProducts as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    await service.delete("c1");

    expect(repo.delete).toHaveBeenCalledWith("c1");
    expect(images.delete).toHaveBeenCalledWith("folder/widgets");
  });

  it("is idempotent for unknown ids", async () => {
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.delete("missing")).resolves.toBeUndefined();
    expect(repo.delete).not.toHaveBeenCalled();
  });
});

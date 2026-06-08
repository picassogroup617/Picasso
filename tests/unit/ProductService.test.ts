import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductService } from "@/application/services/ProductService";
import type { IProductRepository } from "@/domain/interfaces/IProductRepository";
import type { ICategoryRepository } from "@/domain/interfaces/ICategoryRepository";
import type { IImageStorage } from "@/domain/interfaces/IImageStorage";
import type { IImageUsage } from "@/domain/interfaces/IImageUsage";
import type { Product, ProductImage } from "@/domain/entities/product";
import type { Category } from "@/domain/entities/category";
import type { ProductInput } from "@/domain/schemas/product";

function makeImage(overrides: Partial<ProductImage> = {}): ProductImage {
  return {
    id: "img1",
    url: "https://cdn/a.jpg",
    publicId: "p/a",
    alt: null,
    order: 0,
    ...overrides,
  };
}

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    categoryId: "c1",
    slug: "widget",
    name: "Widget",
    longDescription: "desc",
    order: 0,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [makeImage()],
    ...overrides,
  };
}

function makeCategory(): Category {
  return {
    id: "c1",
    slug: "cat",
    name: "Cat",
    shortDescription: "x",
    imageUrl: "https://cdn/c.jpg",
    imagePublicId: null,
    order: 0,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeInput(overrides: Partial<ProductInput> = {}): ProductInput {
  return {
    categoryId: "c1",
    name: "Widget",
    longDescription: "desc",
    order: 0,
    isPublished: true,
    images: [{ url: "https://cdn/a.jpg", publicId: "p/a", alt: undefined }],
    ...overrides,
  } as ProductInput;
}

function makeProductRepo(): IProductRepository {
  return {
    list: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

function makeCategoryRepo(): ICategoryRepository {
  return {
    list: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
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
  return { countReferences: vi.fn().mockResolvedValue(refCount) };
}

let products: IProductRepository;
let categories: ICategoryRepository;
let images: IImageStorage;
let imageUsage: IImageUsage;
let service: ProductService;

beforeEach(() => {
  products = makeProductRepo();
  categories = makeCategoryRepo();
  images = makeImages();
  imageUsage = makeImageUsage(0);
  service = new ProductService(products, categories, images, imageUsage);
});

describe("ProductService read paths", () => {
  it("getById returns null when the repository has no match", async () => {
    (products.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.getById("ghost")).resolves.toBeNull();
  });

  it("list forwards categoryId + publishedOnly filters to the repository", async () => {
    (products.list as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await service.list({ categoryId: "c1", publishedOnly: true });
    expect(products.list).toHaveBeenCalledWith({
      categoryId: "c1",
      publishedOnly: true,
    });
  });
});

describe("ProductService.create", () => {
  it("rejects when the category does not exist", async () => {
    (categories.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.create(makeInput())).rejects.toThrow(/category no longer exists/i);
    expect(products.create).not.toHaveBeenCalled();
  });

  it("auto-generates a slug and normalises image order", async () => {
    (categories.findById as ReturnType<typeof vi.fn>).mockResolvedValue(makeCategory());
    (products.findBySlug as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (products.create as ReturnType<typeof vi.fn>).mockImplementation(async (d) =>
      makeProduct({ slug: d.slug }),
    );

    await service.create(
      makeInput({
        name: "Big Red Widget",
        images: [
          { url: "https://cdn/a.jpg", publicId: "p/a", alt: undefined },
          { url: "https://cdn/b.jpg", publicId: "p/b", alt: "B" },
        ],
      }),
    );

    expect(products.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "big-red-widget",
        images: [
          { url: "https://cdn/a.jpg", publicId: "p/a", alt: null, order: 0 },
          { url: "https://cdn/b.jpg", publicId: "p/b", alt: "B", order: 1 },
        ],
      }),
    );
  });

  it("resolves slug collisions by appending a numeric suffix", async () => {
    (categories.findById as ReturnType<typeof vi.fn>).mockResolvedValue(makeCategory());
    const findBySlug = products.findBySlug as ReturnType<typeof vi.fn>;
    findBySlug
      .mockResolvedValueOnce(makeProduct({ id: "other", slug: "widget" }))
      .mockResolvedValueOnce(null);
    (products.create as ReturnType<typeof vi.fn>).mockImplementation(async (d) =>
      makeProduct({ slug: d.slug }),
    );

    await service.create(makeInput({ name: "Widget" }));

    expect(products.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "widget-2" }),
    );
  });
});

describe("ProductService.update", () => {
  it("throws when the product does not exist", async () => {
    (products.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.update("missing", makeInput())).rejects.toThrow(/not found/i);
  });

  it("deletes only the Cloudinary assets that were removed from the gallery", async () => {
    const existing = makeProduct({
      images: [
        makeImage({ id: "i1", publicId: "p/keep" }),
        makeImage({ id: "i2", publicId: "p/drop" }),
        makeImage({ id: "i3", publicId: null }),
      ],
    });
    (products.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existing);
    (categories.findById as ReturnType<typeof vi.fn>).mockResolvedValue(makeCategory());
    (products.update as ReturnType<typeof vi.fn>).mockImplementation(async (_id, d) =>
      makeProduct({ ...existing, ...d }),
    );

    await service.update(
      "p1",
      makeInput({
        images: [
          { url: "https://cdn/keep.jpg", publicId: "p/keep", alt: undefined },
          { url: "https://cdn/new.jpg", publicId: "p/new", alt: undefined },
        ],
      }),
    );

    expect(images.delete).toHaveBeenCalledTimes(1);
    expect(images.delete).toHaveBeenCalledWith("p/drop");
  });

  it("keeps the existing slug when the name slugifies to the same value", async () => {
    const existing = makeProduct({ slug: "widget" });
    (products.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existing);
    (categories.findById as ReturnType<typeof vi.fn>).mockResolvedValue(makeCategory());
    (products.update as ReturnType<typeof vi.fn>).mockImplementation(async (_id, d) =>
      makeProduct({ ...existing, ...d }),
    );

    await service.update("p1", makeInput({ name: "Widget" }));

    expect(products.findBySlug).not.toHaveBeenCalled();
    expect(products.update).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ slug: "widget" }),
    );
  });
});

describe("ProductService.delete", () => {
  it("is idempotent for unknown ids", async () => {
    (products.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.delete("missing")).resolves.toBeUndefined();
    expect(products.delete).not.toHaveBeenCalled();
    expect(images.delete).not.toHaveBeenCalled();
  });

  it("removes all Cloudinary assets attached to the product", async () => {
    (products.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeProduct({
        images: [
          makeImage({ id: "i1", publicId: "p/a" }),
          makeImage({ id: "i2", publicId: "p/b" }),
          makeImage({ id: "i3", publicId: null }),
        ],
      }),
    );

    await service.delete("p1");

    expect(products.delete).toHaveBeenCalledWith("p1");
    expect(images.delete).toHaveBeenCalledTimes(2);
    expect(images.delete).toHaveBeenCalledWith("p/a");
    expect(images.delete).toHaveBeenCalledWith("p/b");
  });

  it("preserves Cloudinary assets that are still referenced elsewhere", async () => {
    (products.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeProduct({
        images: [
          makeImage({ id: "i1", publicId: "p/shared" }),
          makeImage({ id: "i2", publicId: "p/orphan" }),
        ],
      }),
    );
    (imageUsage.countReferences as ReturnType<typeof vi.fn>).mockImplementation(
      async (pid: string) => (pid === "p/shared" ? 1 : 0),
    );

    await service.delete("p1");

    expect(images.delete).toHaveBeenCalledTimes(1);
    expect(images.delete).toHaveBeenCalledWith("p/orphan");
    expect(images.delete).not.toHaveBeenCalledWith("p/shared");
  });

  it("does not surface a Cloudinary failure to the caller", async () => {
    (products.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeProduct({
        images: [
          makeImage({ id: "i1", publicId: "p/a" }),
          makeImage({ id: "i2", publicId: "p/b" }),
        ],
      }),
    );
    (images.delete as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error("cloudinary down"))
      .mockResolvedValueOnce(undefined);

    await expect(service.delete("p1")).resolves.toBeUndefined();
    expect(images.delete).toHaveBeenCalledTimes(2);
  });
});

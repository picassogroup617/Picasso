import type {
  IProductRepository,
  ProductImageData,
  ProductListFilters,
} from "@/domain/interfaces/IProductRepository";
import type { ICategoryRepository } from "@/domain/interfaces/ICategoryRepository";
import type { IImageStorage } from "@/domain/interfaces/IImageStorage";
import type { IImageUsage } from "@/domain/interfaces/IImageUsage";
import type { Product } from "@/domain/entities/product";
import type { ProductInput, ProductImageInput } from "@/domain/schemas/product";
import { slugify } from "@/lib/slug";
import { cleanupDetachedImages } from "./imageCleanup";

/**
 * Manages catalog products.
 * - Auto-generates a unique slug from the name when none is provided.
 * - Validates that the referenced category exists.
 * - Cleans up Cloudinary assets that are removed during update/delete.
 */
export class ProductService {
  constructor(
    private readonly repo: IProductRepository,
    private readonly categories: ICategoryRepository,
    private readonly images: IImageStorage,
    private readonly imageUsage: IImageUsage,
  ) {}

  list(filters?: ProductListFilters) {
    return this.repo.list(filters);
  }

  getById(id: string) {
    return this.repo.findById(id);
  }

  findBySlug(slug: string) {
    return this.repo.findBySlug(slug);
  }

  private async resolveUniqueSlug(
    desired: string,
    ignoreSlug?: string,
  ): Promise<string> {
    const base = slugify(desired) || "product";
    const taken = new Set(await this.repo.findSlugsStartingWith(base));
    if (ignoreSlug) taken.delete(ignoreSlug);
    if (!taken.has(base)) return base;
    for (let n = 2; ; n++) {
      const candidate = `${base}-${n}`;
      if (!taken.has(candidate)) return candidate;
    }
  }

  private normaliseImages(images: ProductImageInput[]): ProductImageData[] {
    return images.map((img, idx) => ({
      url: img.url,
      publicId: img.publicId ?? null,
      alt: img.alt ?? null,
      order: idx,
    }));
  }

  private async ensureCategoryExists(categoryId: string) {
    if (!(await this.categories.existsById(categoryId))) {
      throw new Error("Selected category no longer exists.");
    }
  }

  async create(input: ProductInput): Promise<Product> {
    await this.ensureCategoryExists(input.categoryId);
    const slug = await this.resolveUniqueSlug(input.slug ?? input.name);
    return this.repo.create({
      categoryId: input.categoryId,
      slug,
      name: input.name,
      longDescription: input.longDescription,
      order: input.order,
      isPublished: input.isPublished,
      images: this.normaliseImages(input.images),
    });
  }

  async update(id: string, input: ProductInput): Promise<Product> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Product not found.");
    await this.ensureCategoryExists(input.categoryId);

    const desiredSlug = input.slug ?? input.name;
    const slug =
      slugify(desiredSlug) === existing.slug
        ? existing.slug
        : await this.resolveUniqueSlug(desiredSlug, existing.slug);

    const nextImages = this.normaliseImages(input.images);
    const saved = await this.repo.update(id, {
      categoryId: input.categoryId,
      slug,
      name: input.name,
      longDescription: input.longDescription,
      order: input.order,
      isPublished: input.isPublished,
      images: nextImages,
    });

    const keptPublicIds = new Set(
      nextImages.map((i) => i.publicId).filter((p): p is string => Boolean(p)),
    );
    const removedPublicIds = existing.images
      .map((i) => i.publicId)
      .filter((p): p is string => Boolean(p) && !keptPublicIds.has(p as string));

    await cleanupDetachedImages(removedPublicIds, {
      images: this.images,
      imageUsage: this.imageUsage,
    });
    return saved;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) return;
    await this.repo.delete(id);

    await cleanupDetachedImages(
      existing.images.map((i) => i.publicId),
      { images: this.images, imageUsage: this.imageUsage },
    );
  }
}

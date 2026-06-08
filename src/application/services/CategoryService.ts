import type {
  CategoryListFilters,
  ICategoryRepository,
} from "@/domain/interfaces/ICategoryRepository";
import type { IImageStorage } from "@/domain/interfaces/IImageStorage";
import type { IImageUsage } from "@/domain/interfaces/IImageUsage";
import type { Category } from "@/domain/entities/category";
import type { CategoryInput } from "@/domain/schemas/category";
import { slugify } from "@/lib/slug";
import { cleanupDetachedImages } from "./imageCleanup";

/**
 * Manages product categories.
 * - Auto-generates a unique slug from the name when none is provided.
 * - Cleans up replaced/deleted Cloudinary assets.
 * - Blocks deletion when the category still has products attached.
 */
export class CategoryService {
  constructor(
    private readonly repo: ICategoryRepository,
    private readonly images: IImageStorage,
    private readonly imageUsage: IImageUsage,
  ) {}

  list(filters?: CategoryListFilters) {
    return this.repo.list(filters);
  }

  findBySlug(slug: string) {
    return this.repo.findBySlug(slug);
  }

  getById(id: string) {
    return this.repo.findById(id);
  }

  /**
   * Returns a slug that is unique across all categories. If `desired` is
   * already taken, suffixes `-2`, `-3`, ... until a free slot is found.
   * `ignoreId` lets the caller skip its own record during updates.
   */
  private async resolveUniqueSlug(
    desired: string,
    ignoreId?: string,
  ): Promise<string> {
    const base = slugify(desired) || "category";
    let candidate = base;
    let n = 2;
    // Loop bounded by name collisions; practical upper bound is tiny.
    while (true) {
      const existing = await this.repo.findBySlug(candidate);
      if (!existing || existing.id === ignoreId) return candidate;
      candidate = `${base}-${n++}`;
    }
  }

  async create(input: CategoryInput): Promise<Category> {
    const slug = await this.resolveUniqueSlug(input.slug ?? input.name);
    return this.repo.create({
      slug,
      name: input.name,
      shortDescription: input.shortDescription,
      imageUrl: input.imageUrl ?? null,
      imagePublicId: input.imagePublicId ?? null,
      order: input.order,
      isPublished: input.isPublished,
    });
  }

  async update(id: string, input: CategoryInput): Promise<Category> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Category not found.");

    const desiredSlug = input.slug ?? input.name;
    const slug =
      slugify(desiredSlug) === existing.slug
        ? existing.slug
        : await this.resolveUniqueSlug(desiredSlug, id);

    const saved = await this.repo.update(id, {
      slug,
      name: input.name,
      shortDescription: input.shortDescription,
      imageUrl: input.imageUrl ?? null,
      imagePublicId: input.imagePublicId ?? null,
      order: input.order,
      isPublished: input.isPublished,
    });

    if (
      existing.imagePublicId &&
      existing.imagePublicId !== saved.imagePublicId
    ) {
      await cleanupDetachedImages([existing.imagePublicId], {
        images: this.images,
        imageUsage: this.imageUsage,
      });
    }
    return saved;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) return;

    const productCount = await this.repo.countProducts(id);
    if (productCount > 0) {
      throw new Error(
        `Cannot delete "${existing.name}" — it still has ${productCount} product${productCount === 1 ? "" : "s"}. Move or remove them first.`,
      );
    }

    await this.repo.delete(id);
    await cleanupDetachedImages([existing.imagePublicId], {
      images: this.images,
      imageUsage: this.imageUsage,
    });
  }
}

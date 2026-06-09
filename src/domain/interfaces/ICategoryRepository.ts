import type { Category } from "@/domain/entities/category";

export interface CreateCategoryData {
  slug: string;
  name: string;
  shortDescription: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  order?: number;
  isPublished?: boolean;
}

export interface UpdateCategoryData {
  slug?: string;
  name?: string;
  shortDescription?: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  order?: number;
  isPublished?: boolean;
}

export interface CategoryListFilters {
  /** When true, only `isPublished` categories are returned. */
  publishedOnly?: boolean;
  /** Hard cap on returned rows — used by the home page preview. */
  limit?: number;
}

export interface ICategoryRepository {
  list(filters?: CategoryListFilters): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  /** Lightweight existence check used by service-layer validation. */
  existsById(id: string): Promise<boolean>;
  /**
   * Returns every slug that begins with `prefix`. Used by the slug
   * uniqueness resolver to avoid an N-step lookup loop on collisions.
   */
  findSlugsStartingWith(prefix: string): Promise<string[]>;
  create(data: CreateCategoryData): Promise<Category>;
  update(id: string, data: UpdateCategoryData): Promise<Category>;
  delete(id: string): Promise<void>;
  countProducts(id: string): Promise<number>;
}

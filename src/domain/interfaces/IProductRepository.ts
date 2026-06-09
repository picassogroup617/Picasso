import type { Product } from "@/domain/entities/product";

export interface ProductImageData {
  url: string;
  publicId?: string | null;
  alt?: string | null;
  order: number;
}

export interface CreateProductData {
  categoryId: string;
  slug: string;
  name: string;
  longDescription: string;
  order?: number;
  isPublished?: boolean;
  images: ProductImageData[];
}

export interface UpdateProductData {
  categoryId?: string;
  slug?: string;
  name?: string;
  longDescription?: string;
  order?: number;
  isPublished?: boolean;
  /** When provided, replaces the entire image gallery. */
  images?: ProductImageData[];
}

export interface ProductListFilters {
  categoryId?: string;
  /** Batched form of {@link categoryId}; matches products in any of the ids. */
  categoryIds?: readonly string[];
  /** When true, only `isPublished` products are returned. */
  publishedOnly?: boolean;
  /** Hard cap on returned rows. */
  limit?: number;
}

export interface IProductRepository {
  list(filters?: ProductListFilters): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  /**
   * Returns every slug that begins with `prefix`. Used by the slug
   * uniqueness resolver to avoid an N-step lookup loop on collisions.
   */
  findSlugsStartingWith(prefix: string): Promise<string[]>;
  create(data: CreateProductData): Promise<Product>;
  update(id: string, data: UpdateProductData): Promise<Product>;
  delete(id: string): Promise<void>;
}

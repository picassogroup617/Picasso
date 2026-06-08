export interface ProductImage {
  id: string;
  url: string;
  publicId: string | null;
  alt: string | null;
  order: number;
}

/** Product entity, including its ordered image gallery. */
export interface Product {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  longDescription: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: ProductImage[];
}

/** Product category — top-level grouping in the public catalog. */
export interface Category {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

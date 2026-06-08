import type { PrismaClient } from "@prisma/client";
import type {
  CreateProductData,
  IProductRepository,
  ProductListFilters,
  UpdateProductData,
} from "@/domain/interfaces/IProductRepository";
import type { Product, ProductImage } from "@/domain/entities/product";

type ProductRow = {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  longDescription: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: {
    id: string;
    url: string;
    publicId: string | null;
    alt: string | null;
    order: number;
  }[];
};

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly db: PrismaClient) {}

  private toEntity(row: ProductRow): Product {
    const images: ProductImage[] = row.images
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((i) => ({
        id: i.id,
        url: i.url,
        publicId: i.publicId,
        alt: i.alt,
        order: i.order,
      }));
    return {
      id: row.id,
      categoryId: row.categoryId,
      slug: row.slug,
      name: row.name,
      longDescription: row.longDescription,
      order: row.order,
      isPublished: row.isPublished,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      images,
    };
  }

  async list(filters?: ProductListFilters): Promise<Product[]> {
    const where: { categoryId?: string; isPublished?: boolean } = {};
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.publishedOnly) where.isPublished = true;
    const rows = await this.db.product.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      take: filters?.limit,
      include: { images: true },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.db.product.findUnique({
      where: { id },
      include: { images: true },
    });
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const row = await this.db.product.findUnique({
      where: { slug },
      include: { images: true },
    });
    return row ? this.toEntity(row) : null;
  }

  async create(data: CreateProductData): Promise<Product> {
    const row = await this.db.product.create({
      data: {
        categoryId: data.categoryId,
        slug: data.slug,
        name: data.name,
        longDescription: data.longDescription,
        order: data.order ?? 0,
        isPublished: data.isPublished ?? true,
        images: {
          create: data.images.map((i) => ({
            url: i.url,
            publicId: i.publicId ?? null,
            alt: i.alt ?? null,
            order: i.order,
          })),
        },
      },
      include: { images: true },
    });
    return this.toEntity(row);
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    const row = await this.db.$transaction(async (tx) => {
      if (data.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }
      return tx.product.update({
        where: { id },
        data: {
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.longDescription !== undefined && {
            longDescription: data.longDescription,
          }),
          ...(data.order !== undefined && { order: data.order }),
          ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
          ...(data.images && {
            images: {
              create: data.images.map((i) => ({
                url: i.url,
                publicId: i.publicId ?? null,
                alt: i.alt ?? null,
                order: i.order,
              })),
            },
          }),
        },
        include: { images: true },
      });
    });
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.product.delete({ where: { id } });
  }
}

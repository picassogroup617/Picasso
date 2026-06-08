import type { PrismaClient } from "@prisma/client";
import type {
  CategoryListFilters,
  CreateCategoryData,
  ICategoryRepository,
  UpdateCategoryData,
} from "@/domain/interfaces/ICategoryRepository";
import type { Category } from "@/domain/entities/category";

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly db: PrismaClient) {}

  private toEntity(row: {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    imageUrl: string;
    imagePublicId: string | null;
    order: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Category {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      shortDescription: row.shortDescription,
      imageUrl: row.imageUrl,
      imagePublicId: row.imagePublicId,
      order: row.order,
      isPublished: row.isPublished,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async list(filters?: CategoryListFilters): Promise<Category[]> {
    const rows = await this.db.category.findMany({
      where: filters?.publishedOnly ? { isPublished: true } : undefined,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      take: filters?.limit,
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.db.category.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const row = await this.db.category.findUnique({ where: { slug } });
    return row ? this.toEntity(row) : null;
  }

  async create(data: CreateCategoryData): Promise<Category> {
    const row = await this.db.category.create({
      data: {
        slug: data.slug,
        name: data.name,
        shortDescription: data.shortDescription,
        imageUrl: data.imageUrl,
        imagePublicId: data.imagePublicId ?? null,
        order: data.order ?? 0,
        isPublished: data.isPublished ?? true,
      },
    });
    return this.toEntity(row);
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const row = await this.db.category.update({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.shortDescription !== undefined && {
          shortDescription: data.shortDescription,
        }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.imagePublicId !== undefined && {
          imagePublicId: data.imagePublicId,
        }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      },
    });
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.category.delete({ where: { id } });
  }

  async countProducts(id: string): Promise<number> {
    return this.db.product.count({ where: { categoryId: id } });
  }
}

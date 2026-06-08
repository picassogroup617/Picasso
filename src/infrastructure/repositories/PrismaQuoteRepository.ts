import type { PrismaClient } from "@prisma/client";
import type {
  CreateQuoteData,
  IQuoteRepository,
  QuoteListFilters,
} from "@/domain/interfaces/IQuoteRepository";
import type { Quote } from "@/domain/entities/quote";
import { QuoteStatus, QUOTE_STATUSES } from "@/domain/entities/quoteStatus";

type QuoteRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string | null;
  productId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  product: { id: string; name: string; slug: string } | null;
};

export class PrismaQuoteRepository implements IQuoteRepository {
  constructor(private readonly db: PrismaClient) {}

  private toEntity(row: QuoteRow): Quote {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      message: row.message,
      productId: row.productId,
      product: row.product
        ? { id: row.product.id, name: row.product.name, slug: row.product.slug }
        : null,
      status: row.status as QuoteStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async list(filters?: QuoteListFilters): Promise<Quote[]> {
    const rows = await this.db.quote.findMany({
      where: filters?.status ? { status: filters.status } : undefined,
      orderBy: { createdAt: "desc" },
      take: filters?.limit,
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findById(id: string): Promise<Quote | null> {
    const row = await this.db.quote.findUnique({
      where: { id },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
    return row ? this.toEntity(row) : null;
  }

  async create(data: CreateQuoteData): Promise<Quote> {
    const row = await this.db.quote.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: data.message ?? null,
        productId: data.productId ?? null,
      },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
    return this.toEntity(row);
  }

  async updateStatus(id: string, status: QuoteStatus): Promise<Quote> {
    const row = await this.db.quote.update({
      where: { id },
      data: { status },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.quote.delete({ where: { id } });
  }

  async countsByStatus(): Promise<Record<QuoteStatus, number>> {
    const grouped = await this.db.quote.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const result: Record<QuoteStatus, number> = {
      [QuoteStatus.NEW]: 0,
      [QuoteStatus.CONTACTED]: 0,
      [QuoteStatus.CLOSED]: 0,
    };
    for (const row of grouped) {
      const status = row.status as QuoteStatus;
      if (QUOTE_STATUSES.includes(status)) {
        result[status] = row._count._all;
      }
    }
    return result;
  }
}

import type {
  IQuoteRepository,
  QuoteListFilters,
} from "@/domain/interfaces/IQuoteRepository";
import type { IProductRepository } from "@/domain/interfaces/IProductRepository";
import type { INotificationService } from "@/domain/interfaces/INotificationService";
import type { Quote } from "@/domain/entities/quote";
import type { QuoteStatus } from "@/domain/entities/quoteStatus";
import type { CreateQuoteInput } from "@/domain/schemas/quote";

/**
 * Read/manage quote requests submitted via the public site.
 * Public submission flows through `create()`, which silently drops a stale
 * `productId` rather than failing — the customer's enquiry must never be lost.
 * After persistence a best-effort notification is dispatched; delivery
 * failures are isolated so they never surface to the caller.
 */
export class QuoteService {
  constructor(
    private readonly repo: IQuoteRepository,
    private readonly products: IProductRepository,
    private readonly notifications: INotificationService,
  ) {}

  list(filters?: QuoteListFilters) {
    return this.repo.list(filters);
  }

  getById(id: string) {
    return this.repo.findById(id);
  }

  countsByStatus() {
    return this.repo.countsByStatus();
  }

  async create(input: CreateQuoteInput): Promise<Quote> {
    let productId: string | null = null;
    if (input.productId) {
      const product = await this.products.findById(input.productId);
      if (product && product.isPublished) {
        productId = product.id;
      }
    }
    const quote = await this.repo.create({
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message ?? null,
      productId,
    });

    try {
      await this.notifications.notifyNewQuote(quote);
    } catch (err) {
      console.error("[QuoteService] notification dispatch threw:", err);
    }

    return quote;
  }

  async updateStatus(id: string, status: QuoteStatus): Promise<Quote> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Quote not found.");
    if (existing.status === status) return existing;
    return this.repo.updateStatus(id, status);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) return;
    await this.repo.delete(id);
  }
}

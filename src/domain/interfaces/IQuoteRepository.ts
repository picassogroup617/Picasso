import type { Quote } from "@/domain/entities/quote";
import type { QuoteStatus } from "@/domain/entities/quoteStatus";

export interface QuoteListFilters {
  status?: QuoteStatus;
  /** Limit results — useful for dashboard "recent quotes" widgets. */
  limit?: number;
}

export interface CreateQuoteData {
  name: string;
  phone: string;
  email: string;
  message?: string | null;
  productId?: string | null;
}

export interface IQuoteRepository {
  list(filters?: QuoteListFilters): Promise<Quote[]>;
  findById(id: string): Promise<Quote | null>;
  create(data: CreateQuoteData): Promise<Quote>;
  updateStatus(id: string, status: QuoteStatus): Promise<Quote>;
  delete(id: string): Promise<void>;
  /** Returns the count of quotes per status (zero for unrepresented values). */
  countsByStatus(): Promise<Record<QuoteStatus, number>>;
}

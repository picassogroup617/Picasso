import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuoteService } from "@/application/services/QuoteService";
import type { IQuoteRepository } from "@/domain/interfaces/IQuoteRepository";
import type { IProductRepository } from "@/domain/interfaces/IProductRepository";
import type { INotificationService } from "@/domain/interfaces/INotificationService";
import type { Quote } from "@/domain/entities/quote";
import type { Product } from "@/domain/entities/product";
import { QuoteStatus } from "@/domain/entities/quoteStatus";

function makeQuote(overrides: Partial<Quote> = {}): Quote {
  return {
    id: "q1",
    name: "Jane",
    phone: "+1",
    email: "jane@example.com",
    message: null,
    productId: null,
    product: null,
    status: QuoteStatus.NEW,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    categoryId: "c1",
    slug: "widget",
    name: "Widget",
    longDescription: "desc",
    order: 0,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [],
    ...overrides,
  };
}

function makeRepo(): IQuoteRepository {
  return {
    list: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
    countsByStatus: vi.fn(),
  };
}

function makeProductRepo(): IProductRepository {
  return {
    list: vi.fn(),
    findById: vi.fn(),
    findBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

function makeNotifier(): INotificationService {
  return { notifyNewQuote: vi.fn().mockResolvedValue(undefined) };
}

let repo: IQuoteRepository;
let products: IProductRepository;
let notifier: INotificationService;
let service: QuoteService;

beforeEach(() => {
  repo = makeRepo();
  products = makeProductRepo();
  notifier = makeNotifier();
  service = new QuoteService(repo, products, notifier);
});

describe("QuoteService.updateStatus", () => {
  it("throws when the quote does not exist", async () => {
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.updateStatus("missing", QuoteStatus.CONTACTED)).rejects.toThrow(
      /not found/i,
    );
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("short-circuits without hitting the repo when the status is unchanged", async () => {
    const existing = makeQuote({ status: QuoteStatus.CONTACTED });
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existing);

    const result = await service.updateStatus("q1", QuoteStatus.CONTACTED);

    expect(result).toBe(existing);
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("delegates to the repository when the status changes", async () => {
    const existing = makeQuote({ status: QuoteStatus.NEW });
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(existing);
    (repo.updateStatus as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeQuote({ status: QuoteStatus.CLOSED }),
    );

    const result = await service.updateStatus("q1", QuoteStatus.CLOSED);

    expect(repo.updateStatus).toHaveBeenCalledWith("q1", QuoteStatus.CLOSED);
    expect(result.status).toBe(QuoteStatus.CLOSED);
  });
});

describe("QuoteService.create", () => {
  it("persists the submission with productId=null when no product is referenced", async () => {
    (repo.create as ReturnType<typeof vi.fn>).mockImplementation(async (d) =>
      makeQuote({ name: d.name, productId: d.productId }),
    );

    await service.create({
      name: "Jane",
      phone: "+1 555",
      email: "jane@example.com",
      message: undefined,
      productId: undefined,
    });

    expect(products.findById).not.toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ productId: null, message: null }),
    );
  });

  it("keeps the productId when the product exists and is published", async () => {
    (products.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeProduct({ id: "p1", isPublished: true }),
    );
    (repo.create as ReturnType<typeof vi.fn>).mockImplementation(async (d) =>
      makeQuote({ productId: d.productId }),
    );

    await service.create({
      name: "Jane",
      phone: "+1",
      email: "jane@example.com",
      message: "hi",
      productId: "p1",
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ productId: "p1", message: "hi" }),
    );
  });

  it("drops a stale productId when the product is missing or unpublished", async () => {
    (products.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeProduct({ id: "p1", isPublished: false }),
    );
    (repo.create as ReturnType<typeof vi.fn>).mockImplementation(async (d) =>
      makeQuote({ productId: d.productId }),
    );

    await service.create({
      name: "Jane",
      phone: "+1",
      email: "jane@example.com",
      message: undefined,
      productId: "p1",
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ productId: null }),
    );
  });

  it("dispatches a notification with the persisted quote", async () => {
    const saved = makeQuote({ id: "q-saved", name: "Jane" });
    (repo.create as ReturnType<typeof vi.fn>).mockResolvedValue(saved);

    await service.create({
      name: "Jane",
      phone: "+1",
      email: "jane@example.com",
      message: undefined,
      productId: undefined,
    });

    expect(notifier.notifyNewQuote).toHaveBeenCalledTimes(1);
    expect(notifier.notifyNewQuote).toHaveBeenCalledWith(saved);
  });

  it("still returns the saved quote when the notifier throws", async () => {
    const saved = makeQuote({ id: "q-saved" });
    (repo.create as ReturnType<typeof vi.fn>).mockResolvedValue(saved);
    (notifier.notifyNewQuote as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("smtp down"),
    );

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await service.create({
      name: "Jane",
      phone: "+1",
      email: "jane@example.com",
      message: undefined,
      productId: undefined,
    });
    errorSpy.mockRestore();

    expect(result).toBe(saved);
  });
});

describe("QuoteService.delete", () => {
  it("is idempotent for unknown ids", async () => {
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.delete("missing")).resolves.toBeUndefined();
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("delegates to the repository when the quote exists", async () => {
    (repo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(makeQuote());
    await service.delete("q1");
    expect(repo.delete).toHaveBeenCalledWith("q1");
  });
});

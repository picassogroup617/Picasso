import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NoopNotificationService } from "@/infrastructure/notifications/NoopNotificationService";
import { createNotificationService } from "@/infrastructure/notifications/createNotificationService";
import { NodemailerNotificationService } from "@/infrastructure/notifications/NodemailerNotificationService";
import type { Quote } from "@/domain/entities/quote";
import { QuoteStatus } from "@/domain/entities/quoteStatus";

const ORIGINAL_ENV = { ...process.env };

function makeQuote(): Quote {
  return {
    id: "q1",
    name: "Jane",
    phone: "+1",
    email: "jane@example.com",
    message: "hi",
    productId: null,
    product: null,
    status: QuoteStatus.NEW,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
});

describe("createNotificationService", () => {
  it("returns the no-op notifier when SMTP env keys are missing", () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_FROM;
    delete process.env.QUOTE_NOTIFY_TO;
    expect(createNotificationService()).toBeInstanceOf(NoopNotificationService);
  });

  it("returns the no-op notifier when only some keys are set", () => {
    process.env.SMTP_HOST = "smtp.example.com";
    delete process.env.SMTP_FROM;
    delete process.env.QUOTE_NOTIFY_TO;
    expect(createNotificationService()).toBeInstanceOf(NoopNotificationService);
  });

  it("returns the Nodemailer notifier when all required keys are present", () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_FROM = "no-reply@example.com";
    process.env.QUOTE_NOTIFY_TO = "admin@example.com";
    expect(createNotificationService()).toBeInstanceOf(
      NodemailerNotificationService,
    );
  });
});

describe("NoopNotificationService", () => {
  it("resolves without throwing and logs at most once", async () => {
    const svc = new NoopNotificationService();
    await expect(svc.notifyNewQuote(makeQuote())).resolves.toBeUndefined();
    await svc.notifyNewQuote(makeQuote());
    expect(console.info).toHaveBeenCalledTimes(1);
  });
});

describe("NodemailerNotificationService", () => {
  it("swallows transporter errors so the caller never sees them", async () => {
    const svc = new NodemailerNotificationService({
      host: "smtp.invalid",
      port: 587,
      from: "no-reply@example.com",
      notifyTo: "admin@example.com",
      adminBaseUrl: "https://example.com",
      siteName: "Picasso",
    });
    // Force the transporter to throw by stubbing sendMail.
    const stub = { sendMail: vi.fn().mockRejectedValue(new Error("boom")) };
    (svc as unknown as { transporter: typeof stub }).transporter = stub;

    await expect(svc.notifyNewQuote(makeQuote())).resolves.toBeUndefined();
    expect(stub.sendMail).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalled();
  });
});

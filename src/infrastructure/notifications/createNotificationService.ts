import type { INotificationService } from "@/domain/interfaces/INotificationService";
import { NodemailerNotificationService } from "./NodemailerNotificationService";
import { NoopNotificationService } from "./NoopNotificationService";

/**
 * Returns the SMTP-backed notifier when the minimum required env keys are
 * present, otherwise a no-op. This keeps local/dev environments working
 * without forcing every developer to configure SMTP.
 */
export function createNotificationService(): INotificationService {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  const notifyTo = process.env.QUOTE_NOTIFY_TO;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Picasso";
  const adminBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!host || !from || !notifyTo || !Number.isFinite(port)) {
    return new NoopNotificationService();
  }

  return new NodemailerNotificationService({
    host,
    port,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from,
    notifyTo,
    adminBaseUrl,
    siteName,
  });
}

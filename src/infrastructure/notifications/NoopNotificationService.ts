import type { INotificationService } from "@/domain/interfaces/INotificationService";

/**
 * No-op notifier used when SMTP credentials are absent, in tests, or as a
 * defensive fallback. Logs once so the omission is visible during dev.
 */
export class NoopNotificationService implements INotificationService {
  private warned = false;

  async notifyNewQuote(): Promise<void> {
    if (!this.warned) {
      console.info(
        "[notifications] SMTP not configured — new-quote notifications are disabled.",
      );
      this.warned = true;
    }
  }
}

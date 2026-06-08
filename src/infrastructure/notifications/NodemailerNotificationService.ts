import nodemailer, { type Transporter } from "nodemailer";
import type { INotificationService } from "@/domain/interfaces/INotificationService";
import type { Quote } from "@/domain/entities/quote";

interface SmtpConfig {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
  notifyTo: string;
  adminBaseUrl: string;
  siteName: string;
}

/**
 * SMTP-backed notifier. Builds a transporter on first use; delivery failures
 * are logged but never thrown so the public quote pipeline never breaks.
 */
export class NodemailerNotificationService implements INotificationService {
  private transporter: Transporter | null = null;

  constructor(private readonly config: SmtpConfig) {}

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter;
    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.port === 465,
      auth:
        this.config.user && this.config.pass
          ? { user: this.config.user, pass: this.config.pass }
          : undefined,
    });
    return this.transporter;
  }

  async notifyNewQuote(quote: Quote): Promise<void> {
    const subject = quote.product
      ? `New quote request — ${quote.product.name}`
      : `New quote request from ${quote.name}`;

    const adminLink = `${this.config.adminBaseUrl.replace(/\/$/, "")}/picassoadd/quotes/${quote.id}`;
    const text = [
      `Name:     ${quote.name}`,
      `Phone:    ${quote.phone}`,
      `Email:    ${quote.email}`,
      quote.product ? `Product:  ${quote.product.name} (${quote.product.slug})` : null,
      quote.message ? `\nMessage:\n${quote.message}` : null,
      `\nReview: ${adminLink}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await this.getTransporter().sendMail({
        from: this.config.from,
        to: this.config.notifyTo,
        replyTo: `${quote.name} <${quote.email}>`,
        subject,
        text,
      });
    } catch (err) {
      console.error("[notifications] failed to send new-quote email:", err);
    }
  }
}

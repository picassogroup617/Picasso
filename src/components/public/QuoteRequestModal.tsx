"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, X } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { submitQuoteAction } from "@/app/(public)/actions";
import {
  HONEYPOT_FIELD,
  INITIAL_QUOTE_STATE,
  type QuoteFormState,
} from "@/app/(public)/quote-form";
import {
  useWhatsappContacts,
  type WhatsappContact,
} from "./WhatsappContactsProvider";

interface QuoteRequestModalProps {
  open: boolean;
  onClose: () => void;
  productId?: string;
  productName?: string;
}

const QUOTE_FIELD_LABELS: Record<string, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
  message: "Message",
  _form: "Form",
};

export function QuoteRequestModal({
  open,
  onClose,
  productId,
  productName,
}: QuoteRequestModalProps) {
  const [state, action, pending] = useActionState<QuoteFormState, FormData>(
    submitQuoteAction,
    INITIAL_QUOTE_STATE,
  );
  const titleId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const whatsappContacts = useWhatsappContacts();

  // Portal target must come from the browser; render nothing until mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state.ok && formRef.current) formRef.current.reset();
  }, [state.ok]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      ).filter((el) => !el.hasAttribute("aria-hidden"));

    // Defer to next tick so the dialog is mounted before we move focus.
    const initial = setTimeout(() => {
      const focusables = getFocusable();
      (focusables[0] ?? dialogRef.current)?.focus();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = getFocusable();
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(initial);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const overlay = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-gray-900/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={dialogRef}
        className="my-auto w-full max-w-md rounded-2xl bg-brand-white p-6 shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="font-display text-xl font-semibold text-brand-gray-900">
              Get a quote
            </h2>
            {productName && (
              <p className="mt-1 text-xs text-brand-gray-500">For: {productName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-brand-gray-500 transition hover:bg-brand-gray-100 hover:text-brand-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {whatsappContacts.length > 0 && !state.ok && (
          <WhatsappPicker contacts={whatsappContacts} productName={productName} />
        )}

        {state.ok ? (
          <Alert tone="success" className="mt-5">
            Thanks — we&apos;ve received your enquiry and will be in touch shortly.
          </Alert>
        ) : (
          <form ref={formRef} action={action} className="mt-5 space-y-4">
            {productId && <input type="hidden" name="productId" value={productId} />}

            {/* Honeypot — kept off-screen and out of the tab order. Real users
                never see it; bots fill every input they find. The label/name
                are deliberately obscure so password managers don't autofill. */}
            <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
              <label>
                Leave this field empty
                <input
                  type="text"
                  name={HONEYPOT_FIELD}
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue=""
                />
              </label>
            </div>

            <Field label="Your name" name="name" error={state.fieldErrors?.name}>
              <Input name="name" required maxLength={120} autoComplete="name" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" name="phone" error={state.fieldErrors?.phone}>
                <Input name="phone" required maxLength={40} autoComplete="tel" />
              </Field>
              <Field label="Email" name="email" error={state.fieldErrors?.email}>
                <Input
                  type="email"
                  name="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                />
              </Field>
            </div>

            <Field label="Message (optional)" name="message" error={state.fieldErrors?.message}>
              <Textarea name="message" rows={4} maxLength={2000} />
            </Field>

            {state.error && (
              <Alert tone="error">
                <div>{state.error}</div>
                {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-sm">
                    {Object.entries(state.fieldErrors).map(([key, msg]) => (
                      <li key={key}>
                        <span className="font-medium">
                          {QUOTE_FIELD_LABELS[key] ?? key}:
                        </span>{" "}
                        {msg}
                      </li>
                    ))}
                  </ul>
                )}
              </Alert>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Sending…" : "Send request"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function WhatsappPicker({
  contacts,
  productName,
}: {
  contacts: WhatsappContact[];
  productName?: string;
}) {
  const greeting = productName
    ? `Hi, I'd like a quote for ${productName}.`
    : "Hi, I'd like a quote.";
  const text = encodeURIComponent(greeting);

  return (
    <div className="mt-5 rounded-xl border border-brand-gray-200 bg-brand-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-gray-500">
        Prefer WhatsApp?
      </p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {contacts.map((c, i) => {
          const digits = c.phone.replace(/[^0-9]/g, "");
          return (
            <li key={`${digits}-${i}`}>
              <a
                href={`https://wa.me/${digits}?text=${text}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-brand-gray-200 bg-brand-white px-3 py-1.5 text-sm text-brand-gray-700 transition hover:border-brand-gray-300 hover:text-brand-gray-900"
              >
                <MessageCircle className="h-4 w-4 text-green-600" aria-hidden />
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-brand-gray-500">{c.phone}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

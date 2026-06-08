"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";
import type { ContactPerson } from "@/domain/entities/contactPerson";
import type { ActionState } from "./actions";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

interface ContactFormProps {
  mode: "create" | "edit";
  action: Action;
  defaults?: Partial<ContactPerson>;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone1: "Phone 1",
  phone2: "Phone 2",
  phone1OnWhatsapp: "Phone 1 WhatsApp",
  phone2OnWhatsapp: "Phone 2 WhatsApp",
  order: "Display order",
  isActive: "Active",
  _form: "Form",
};

export function ContactForm({ mode, action, defaults }: ContactFormProps) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, { ok: false });
  const fe = state.fieldErrors ?? {};
  const feEntries = Object.entries(fe);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <Alert tone="error">
          <div>{state.error}</div>
          {feEntries.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-sm">
              {feEntries.map(([key, msg]) => (
                <li key={key}>
                  <span className="font-medium">{FIELD_LABELS[key] ?? key}:</span> {msg}
                </li>
              ))}
            </ul>
          )}
        </Alert>
      )}
      {state.ok && mode === "edit" && <Alert tone="success">Changes saved.</Alert>}

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Jane Doe"
          defaultValue={defaults?.name ?? ""}
          invalid={Boolean(fe.name)}
          required
          maxLength={120}
        />
        {fe.name && <p className="text-xs text-red-600">{fe.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jane@example.com"
          defaultValue={defaults?.email ?? ""}
          invalid={Boolean(fe.email)}
          maxLength={254}
        />
        {fe.email && <p className="text-xs text-red-600">{fe.email}</p>}
      </div>

      <PhoneField
        id="phone1"
        label="Phone 1"
        defaultValue={defaults?.phone1 ?? ""}
        defaultWhatsapp={defaults?.phone1OnWhatsapp ?? false}
        valueError={fe.phone1}
        required
      />

      <PhoneField
        id="phone2"
        label="Phone 2 (optional)"
        defaultValue={defaults?.phone2 ?? ""}
        defaultWhatsapp={defaults?.phone2OnWhatsapp ?? false}
        valueError={fe.phone2}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="order">Display order</Label>
          <Input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={defaults?.order ?? 0}
            invalid={Boolean(fe.order)}
          />
          {fe.order && <p className="text-xs text-red-600">{fe.order}</p>}
        </div>

        <div className="flex items-end gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={defaults?.isActive ?? true}
            className="h-4 w-4 rounded border-brand-gray-300 text-brand-yellow focus:ring-brand-yellow/40"
          />
          <Label htmlFor="isActive" className="!font-normal">
            Active
          </Label>
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton label={mode === "create" ? "Add contact" : "Save changes"} />
      </div>
    </form>
  );
}

function PhoneField({
  id,
  label,
  defaultValue,
  defaultWhatsapp,
  valueError,
  required,
}: {
  id: "phone1" | "phone2";
  label: string;
  defaultValue: string;
  defaultWhatsapp: boolean;
  valueError?: string;
  required?: boolean;
}) {
  const waId = `${id}OnWhatsapp`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <Input
          id={id}
          name={id}
          placeholder="+91 98765 43210"
          defaultValue={defaultValue}
          invalid={Boolean(valueError)}
          required={required}
          maxLength={32}
          autoComplete="tel"
        />
        <label htmlFor={waId} className="inline-flex items-center gap-2 text-sm text-brand-gray-700">
          <input
            id={waId}
            name={waId}
            type="checkbox"
            defaultChecked={defaultWhatsapp}
            className="h-4 w-4 rounded border-brand-gray-300 text-brand-yellow focus:ring-brand-yellow/40"
          />
          On WhatsApp
        </label>
      </div>
      {valueError && <p className="text-xs text-red-600">{valueError}</p>}
    </div>
  );
}

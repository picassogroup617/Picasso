"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { SocialPlatform } from "@/domain/entities/socialPlatform";
import type { SocialLink } from "@/domain/entities/socialLink";
import type { ActionState } from "./actions";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

interface SocialFormProps {
  mode: "create" | "edit";
  action: Action;
  defaults?: Partial<SocialLink>;
}

const PLATFORM_OPTIONS: { value: SocialPlatform; label: string }[] = [
  { value: SocialPlatform.LINKEDIN, label: "LinkedIn" },
  { value: SocialPlatform.INSTAGRAM, label: "Instagram" },
  { value: SocialPlatform.FACEBOOK, label: "Facebook" },
  { value: SocialPlatform.WHATSAPP, label: "WhatsApp" },
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function SocialForm({ mode, action, defaults }: SocialFormProps) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, { ok: false });
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.ok && mode === "edit" && <Alert tone="success">Changes saved.</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="platform">Platform</Label>
          <Select
            id="platform"
            name="platform"
            defaultValue={defaults?.platform ?? SocialPlatform.LINKEDIN}
            invalid={Boolean(fe.platform)}
          >
            {PLATFORM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          {fe.platform && <p className="text-xs text-red-600">{fe.platform}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="label">Label (optional)</Label>
          <Input
            id="label"
            name="label"
            placeholder="Picasso India"
            defaultValue={defaults?.label ?? ""}
            invalid={Boolean(fe.label)}
          />
          {fe.label && <p className="text-xs text-red-600">{fe.label}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          placeholder="https://…"
          defaultValue={defaults?.url ?? ""}
          invalid={Boolean(fe.url)}
          required
        />
        {fe.url && <p className="text-xs text-red-600">{fe.url}</p>}
      </div>

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
        <SubmitButton label={mode === "create" ? "Add link" : "Save changes"} />
      </div>
    </form>
  );
}

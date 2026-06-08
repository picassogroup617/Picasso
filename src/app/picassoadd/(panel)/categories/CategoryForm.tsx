"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Category } from "@/domain/entities/category";
import type { ActionState } from "./actions";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

interface CategoryFormProps {
  mode: "create" | "edit";
  action: Action;
  defaults?: Partial<Category>;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function CategoryForm({ mode, action, defaults }: CategoryFormProps) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, { ok: false });
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.ok && mode === "edit" && <Alert tone="success">Changes saved.</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={defaults?.name ?? ""}
            invalid={Boolean(fe.name)}
            required
          />
          {fe.name && <p className="text-xs text-red-600">{fe.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (optional)</Label>
          <Input
            id="slug"
            name="slug"
            placeholder="auto-generated from name"
            defaultValue={defaults?.slug ?? ""}
            invalid={Boolean(fe.slug)}
          />
          {fe.slug && <p className="text-xs text-red-600">{fe.slug}</p>}
          <p className="text-xs text-brand-gray-500">
            Lowercase, dashes, no spaces. Leave blank to auto-generate.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="shortDescription">Short description</Label>
        <Textarea
          id="shortDescription"
          name="shortDescription"
          rows={3}
          defaultValue={defaults?.shortDescription ?? ""}
          invalid={Boolean(fe.shortDescription)}
          required
        />
        {fe.shortDescription && (
          <p className="text-xs text-red-600">{fe.shortDescription}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Image</Label>
        <ImageUploader
          folder="categories"
          urlInputName="imageUrl"
          publicIdInputName="imagePublicId"
          defaultUrl={defaults?.imageUrl ?? ""}
          defaultPublicId={defaults?.imagePublicId ?? ""}
        />
        {fe.imageUrl && <p className="text-xs text-red-600">{fe.imageUrl}</p>}
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
            id="isPublished"
            name="isPublished"
            type="checkbox"
            defaultChecked={defaults?.isPublished ?? true}
            className="h-4 w-4 rounded border-brand-gray-300 text-brand-yellow focus:ring-brand-yellow/40"
          />
          <Label htmlFor="isPublished" className="!font-normal">
            Published
          </Label>
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton label={mode === "create" ? "Create category" : "Save changes"} />
      </div>
    </form>
  );
}

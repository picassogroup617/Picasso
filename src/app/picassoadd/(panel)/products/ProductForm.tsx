"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import {
  MultiImageUploader,
  type UploadedImage,
} from "@/components/admin/MultiImageUploader";
import type { Product } from "@/domain/entities/product";
import type { ActionState } from "./actions";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  mode: "create" | "edit";
  action: Action;
  categories: CategoryOption[];
  defaults?: Partial<Product>;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function ProductForm({
  mode,
  action,
  categories,
  defaults,
}: ProductFormProps) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, { ok: false });
  const fe = state.fieldErrors ?? {};

  const defaultImages: UploadedImage[] =
    defaults?.images?.map((i) => ({
      url: i.url,
      publicId: i.publicId ?? "",
      alt: i.alt ?? "",
    })) ?? [];

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
          <Label htmlFor="categoryId">Category</Label>
          <Select
            id="categoryId"
            name="categoryId"
            defaultValue={defaults?.categoryId ?? ""}
            invalid={Boolean(fe.categoryId)}
            required
          >
            <option value="" disabled>
              Select a category…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          {fe.categoryId && <p className="text-xs text-red-600">{fe.categoryId}</p>}
        </div>
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
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="longDescription">Description</Label>
        <Textarea
          id="longDescription"
          name="longDescription"
          rows={8}
          defaultValue={defaults?.longDescription ?? ""}
          invalid={Boolean(fe.longDescription)}
          required
        />
        {fe.longDescription && (
          <p className="text-xs text-red-600">{fe.longDescription}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Images</Label>
        <MultiImageUploader
          folder="products"
          inputName="images"
          defaultImages={defaultImages}
        />
        {fe.images && <p className="text-xs text-red-600">{fe.images}</p>}
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
        <SubmitButton label={mode === "create" ? "Create product" : "Save changes"} />
      </div>
    </form>
  );
}

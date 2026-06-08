"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { ActionState } from "./actions";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

interface SiteContentFormProps {
  action: Action;
  sectionKey: string;
  hasImage: boolean;
  readOnly: boolean;
  defaults: {
    title: string;
    description: string;
    imageUrl: string;
    imagePublicId: string;
  };
}

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  imageUrl: "Image",
  imagePublicId: "Image",
  _form: "Form",
};

export function SiteContentForm({
  action,
  sectionKey,
  hasImage,
  readOnly,
  defaults,
}: SiteContentFormProps) {
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
      {state.ok && <Alert tone="success">Changes saved.</Alert>}

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaults.title}
          invalid={Boolean(fe.title)}
          disabled={readOnly}
          required
        />
        {fe.title && <p className="text-xs text-red-600">{fe.title}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={defaults.description}
          invalid={Boolean(fe.description)}
          disabled={readOnly}
          required
        />
        {fe.description && <p className="text-xs text-red-600">{fe.description}</p>}
      </div>

      {hasImage && (
        <div className="space-y-1.5">
          <Label>Image</Label>
          <ImageUploader
            folder={`site-content/${sectionKey}`}
            urlInputName="imageUrl"
            publicIdInputName="imagePublicId"
            defaultUrl={defaults.imageUrl}
            defaultPublicId={defaults.imagePublicId}
            disabled={readOnly}
          />
          {fe.imageUrl && <p className="text-xs text-red-600">{fe.imageUrl}</p>}
        </div>
      )}

      {!readOnly && (
        <div className="pt-2">
          <SaveButton disabled={false} />
        </div>
      )}
    </form>
  );
}

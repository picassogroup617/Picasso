"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

export interface UploadedImage {
  url: string;
  publicId: string;
  alt: string;
}

interface MultiImageUploaderProps {
  /** Subfolder under the configured Cloudinary root (e.g. "products"). */
  folder?: string;
  /** Hidden input name carrying the JSON-serialised array of images. */
  inputName: string;
  /** Initial gallery for edit mode. */
  defaultImages?: UploadedImage[];
  /** Max file size per image in MB. Default 5. */
  maxSizeMB?: number;
  /** Max number of images. Default 20. */
  maxImages?: number;
}

interface SignedParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  resourceType: "image";
  allowedFormats: string;
}

export function MultiImageUploader({
  folder,
  inputName,
  defaultImages,
  maxSizeMB = 5,
  maxImages = 20,
}: MultiImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>(defaultImages ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function getSignature(): Promise<SignedParams> {
    const res = await fetch("/api/uploads/cloudinary/signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `Signature request failed (${res.status})`);
    }
    return res.json() as Promise<SignedParams>;
  }

  async function uploadOne(file: File): Promise<UploadedImage> {
    const sig = await getSignature();
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("folder", sig.folder);
    form.append("allowed_formats", sig.allowedFormats);
    form.append("signature", sig.signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`,
      { method: "POST", body: form },
    );
    const data = (await res.json().catch(() => ({}))) as {
      secure_url?: string;
      public_id?: string;
      error?: { message?: string };
    };
    if (!res.ok || !data.secure_url || !data.public_id) {
      throw new Error(data.error?.message ?? `Upload failed (${res.status})`);
    }
    return { url: data.secure_url, publicId: data.public_id, alt: "" };
  }

  async function handleFiles(files: FileList) {
    setError(null);
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setError(`At most ${maxImages} images.`);
      return;
    }
    const chosen = Array.from(files).slice(0, remaining);
    for (const f of chosen) {
      if (!f.type.startsWith("image/")) {
        setError(`"${f.name}" is not an image.`);
        return;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`"${f.name}" exceeds ${maxSizeMB} MB.`);
        return;
      }
    }

    setUploading(true);
    try {
      const uploaded: UploadedImage[] = [];
      for (const f of chosen) {
        uploaded.push(await uploadOne(f));
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeAt(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = prev.slice();
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function setAlt(idx: number, alt: string) {
    setImages((prev) => prev.map((img, i) => (i === idx ? { ...img, alt } : img)));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={inputName} value={JSON.stringify(images)} />

      {images.length === 0 && (
        <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-brand-gray-200 text-sm text-brand-gray-500">
          No images yet
        </div>
      )}

      {images.length > 0 && (
        <ul className="space-y-2">
          {images.map((img, idx) => (
            <li
              key={img.publicId || img.url}
              className="flex items-center gap-3 rounded-md border border-brand-gray-200 bg-brand-white p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || `Image ${idx + 1}`}
                className="h-16 w-16 shrink-0 rounded border border-brand-gray-200 object-cover"
              />
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="Alt text (optional)"
                  value={img.alt}
                  onChange={(e) => setAlt(idx, e.target.value)}
                />
                <p className="text-xs text-brand-gray-500">Position {idx + 1}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  aria-label="Move up"
                >
                  <ArrowLeft className="h-4 w-4 rotate-90" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={idx === images.length - 1}
                  onClick={() => move(idx, 1)}
                  aria-label="Move down"
                >
                  <ArrowRight className="h-4 w-4 rotate-90" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAt(idx)}
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              void handleFiles(e.target.files);
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={uploading || images.length >= maxImages}
          onClick={() => fileRef.current?.click()}
        >
          <Plus className="h-4 w-4" />
          {uploading ? "Uploading…" : "Add images"}
        </Button>
        <span className="text-xs text-brand-gray-500">
          PNG / JPG / WebP, ≤ {maxSizeMB} MB each. Up to {maxImages} images.
        </span>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}

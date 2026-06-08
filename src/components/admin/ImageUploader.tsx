"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface ImageUploaderProps {
  /** Subfolder under the configured Cloudinary root (e.g. "categories"). */
  folder?: string;
  /** Hidden input names that carry the value into the surrounding form. */
  urlInputName: string;
  publicIdInputName: string;
  /** Initial values for edit mode. */
  defaultUrl?: string | null;
  defaultPublicId?: string | null;
  /** Max file size in MB. Default 5. */
  maxSizeMB?: number;
  /** Disables the picker (read-only mode). */
  disabled?: boolean;
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

export function ImageUploader({
  folder,
  urlInputName,
  publicIdInputName,
  defaultUrl,
  defaultPublicId,
  maxSizeMB = 5,
  disabled,
}: ImageUploaderProps) {
  const [url, setUrl] = useState<string>(defaultUrl ?? "");
  const [publicId, setPublicId] = useState<string>(defaultPublicId ?? "");
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

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be ${maxSizeMB} MB or smaller.`);
      return;
    }

    setUploading(true);
    try {
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
      setUrl(data.secure_url);
      setPublicId(data.public_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clear() {
    setUrl("");
    setPublicId("");
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={urlInputName} value={url} />
      <input type="hidden" name={publicIdInputName} value={publicId} />

      {url ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Preview"
            className="h-40 w-40 rounded-md border border-brand-gray-200 object-cover"
          />
          {!disabled && (
            <button
              type="button"
              onClick={clear}
              className="absolute -right-2 -top-2 rounded-full bg-brand-white p-1 text-brand-gray-700 shadow-soft hover:bg-brand-gray-50"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex h-40 w-40 items-center justify-center rounded-md border border-dashed border-brand-gray-200 text-xs text-brand-gray-500">
          No image
        </div>
      )}

      {!disabled && (
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : url ? "Replace image" : "Upload image"}
          </Button>
          <span className="text-xs text-brand-gray-500">PNG / JPG / WebP, ≤ {maxSizeMB} MB</span>
        </div>
      )}

      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}

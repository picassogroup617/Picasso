"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/domain/entities/product";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const AUTO_SCROLL_MS = 5000;

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (images.length < 2 || lightboxOpen) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % images.length);
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(timer);
  }, [images.length, lightboxOpen]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-brand-gray-200 bg-brand-gray-50 text-sm text-brand-gray-500">
        No image available
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="relative aspect-square w-full overflow-hidden rounded-xl border border-brand-gray-200 bg-brand-gray-50 [cursor:zoom-in] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray-300 focus-visible:ring-offset-2"
        onClick={() => setLightboxOpen(true)}
        aria-label={`Open full image of ${productName}`}
      >
        <Image
          src={current.url}
          alt={current.alt ?? productName}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </button>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`Show image ${idx + 1}`}
              aria-current={idx === active}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border bg-brand-gray-50 transition",
                idx === active
                  ? "border-brand-gray-650 ring-2 ring-brand-gray-550/40"
                  : "border-brand-gray-200 hover:border-brand-gray-400",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${productName} ${idx + 1}`}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <ImageLightbox
        image={current}
        productName={productName}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}

function ImageLightbox({
  image,
  productName,
  open,
  onClose,
}: {
  image: ProductImage;
  productName: string;
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(MIN_ZOOM);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setZoom(MIN_ZOOM);
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, image.id, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-brand-gray-900/95 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Full image of ${productName}`}
      onClick={onClose}
    >
      <div
        className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-brand-white/10 bg-brand-gray-900/70 px-3 py-2 shadow-elevated backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-brand-white">
            {image.alt ?? productName}
          </p>
          <p className="text-xs text-brand-white/60">Click outside image to close</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full border border-brand-white/10 bg-brand-white/10 text-brand-white transition hover:bg-brand-white/20"
          aria-label="Close image popup"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="min-h-0 flex-1 overflow-auto rounded-3xl border border-brand-white/10 bg-brand-gray-900/60 p-4 shadow-elevated backdrop-blur-sm sm:p-6"
        onClick={onClose}
      >
        <div
          className="relative mx-auto aspect-square flex-none overflow-hidden rounded-2xl bg-brand-white/5 shadow-elevated"
          style={{ width: `min(${zoom * 90}vw, ${zoom * 75}vh)` }}
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={image.url}
            alt={image.alt ?? productName}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div
        className="mt-3 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 rounded-full border border-brand-white/10 bg-brand-gray-900/80 p-1.5 shadow-elevated backdrop-blur">
          <button
            type="button"
            onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))}
            disabled={zoom <= MIN_ZOOM}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-white/10 text-brand-white transition hover:bg-brand-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom out"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="min-w-16 rounded-full bg-brand-white px-3 py-2 text-center text-xs font-semibold text-brand-gray-900 shadow-soft">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}
            disabled={zoom >= MAX_ZOOM}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-white/10 text-brand-white transition hover:bg-brand-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom in"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

"use client";

import Image from "next/image";
import { useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/domain/entities/product";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

/** Magnification factor applied while the cursor is over the main image. */
const HOVER_ZOOM = 2;

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-brand-gray-200 bg-brand-gray-50 text-sm text-brand-gray-500">
        No image available
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  // Track cursor inside the image and translate to a 0-100 % transform-origin
  // so the spot the user hovers stays anchored under the cursor while zoomed.
  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-xl border border-brand-gray-200 bg-brand-gray-50 [cursor:zoom-in]"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={handleMove}
      >
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out motion-reduce:transition-none"
          style={{
            transform: hovering ? `scale(${HOVER_ZOOM})` : "scale(1)",
            transformOrigin: `${origin.x}% ${origin.y}%`,
          }}
        >
          <Image
            src={current.url}
            alt={current.alt ?? productName}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

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
                  ? "border-brand-yellow ring-2 ring-brand-yellow/40"
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
    </div>
  );
}

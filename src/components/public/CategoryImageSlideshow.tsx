"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export interface SlideImage {
  url: string;
  alt: string;
}

interface CategoryImageSlideshowProps {
  images: SlideImage[];
  /** Shown when the category has no product images yet. */
  fallbackUrl: string;
  fallbackAlt: string;
  /** Delay between slides, in ms. Defaults to 2000. */
  intervalMs?: number;
}

/**
 * Cycles through a list of product images for a category card, fading between
 * each one. Stops at the single frame when only one image is supplied and
 * falls back to a static image when the list is empty.
 */
export function CategoryImageSlideshow({
  images,
  fallbackUrl,
  fallbackAlt,
  intervalMs = 2000,
}: CategoryImageSlideshowProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  if (images.length === 0) {
    return (
      <Image
        src={fallbackUrl}
        alt={fallbackAlt}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition motion-safe:group-hover:scale-[1.02]"
      />
    );
  }

  return (
    <>
      {images.map((img, i) => {
        const active = i === index;
        const isFirst = i === 0;
        return (
          <Image
            key={`${i}-${img.url}`}
            src={img.url}
            alt={img.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            // Cross-fade + slow Ken Burns zoom on the active frame so the
            // transition reads as motion rather than a hard cut.
            className={
              "object-cover transition-all duration-[1200ms] ease-out " +
              (active ? "scale-[1.06] opacity-100" : "scale-100 opacity-0")
            }
            // Only the first frame is needed before the JS-driven rotation
            // starts; the rest can wait so we don't preload the whole gallery
            // on every category card.
            priority={isFirst}
            loading={isFirst ? undefined : "lazy"}
            fetchPriority={isFirst ? "high" : "low"}
          />
        );
      })}
    </>
  );
}

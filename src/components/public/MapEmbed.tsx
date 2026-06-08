import { MapPin } from "lucide-react";
import { isAllowedMapEmbedUrl } from "@/lib/map-embed";

interface MapEmbedProps {
  /**
   * Embed URL (Google Maps `src=`). When omitted, falls back to
   * `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL`. Silently renders nothing if neither
   * source yields an allow-listed Google Maps URL.
   */
  url?: string | null;
  /** Heading shown above the map. Falls back to "Find us". */
  title?: string | null;
  /** Optional caption (e.g. the address) shown under the heading. */
  caption?: string | null;
  className?: string;
}

/**
 * Renders the office location as a Google Maps iframe. The URL is resolved
 * from the explicit `url` prop (admin-editable SiteContent) and falls back
 * to the `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` env var. Either way the URL
 * must match the allow-list in `@/lib/map-embed`.
 */
export function MapEmbed({ url, title, caption, className }: MapEmbedProps) {
  const resolved = url ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ?? "";
  if (!isAllowedMapEmbedUrl(resolved)) return null;

  const heading = title?.trim() || "Find us";

  return (
    <section className={className} aria-label={heading}>
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-brand-gray-500" aria-hidden />
        <h3 className="text-xs font-medium uppercase tracking-wide text-brand-gray-500">
          {heading}
        </h3>
      </div>
      {caption && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-brand-gray-700">
          {caption}
        </p>
      )}
      <div className="mt-3 overflow-hidden rounded-xl border border-brand-gray-200 bg-brand-white">
        <iframe
          src={resolved}
          title={heading}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="block h-64 w-full border-0"
        />
      </div>
    </section>
  );
}

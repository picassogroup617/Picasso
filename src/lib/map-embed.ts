/**
 * Allowed iframe sources for the Google Maps embed. We restrict to the
 * official `/maps/embed` paths on `google.com` so a misconfigured value
 * (env var or admin-supplied) can never be used to load arbitrary
 * third-party content — or even general `maps.google.com` pages that
 * Google may serve with relaxed CSP.
 */
export const MAP_EMBED_ALLOWED_PREFIXES = [
  "https://www.google.com/maps/embed?",
  "https://www.google.com/maps/embed/v1/",
] as const;

export function isAllowedMapEmbedUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return MAP_EMBED_ALLOWED_PREFIXES.some((p) => url.startsWith(p));
}

/**
 * Accepts either a bare embed URL or a full `<iframe …>` snippet pasted from
 * Google Maps → Share → Embed a map, and returns just the `src` URL. Returns
 * the trimmed input unchanged when no `src=` attribute is found.
 */
export function extractMapEmbedUrl(input: string | null | undefined): string {
  if (!input) return "";
  const trimmed = input.trim();
  const match = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  return (match?.[1] ?? trimmed).trim();
}

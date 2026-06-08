/**
 * Generates a URL-safe slug from arbitrary text.
 * - Lowercases, strips diacritics
 * - Replaces non-alphanumerics with single dashes
 * - Trims leading/trailing dashes
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Centralized, typed access to environment variables.
 * Throws early if a required variable is missing at runtime.
 */
function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(value: string | undefined, fallback: string): string {
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  site: {
    url: optional(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"),
    name: optional(process.env.NEXT_PUBLIC_SITE_NAME, "Picasso"),
    tagline: optional(process.env.NEXT_PUBLIC_BRAND_TAGLINE, "Crafting Excellence"),
  },
  db: {
    get url() {
      return required("DATABASE_URL", process.env.DATABASE_URL);
    },
  },
  auth: {
    get secret() {
      return required("AUTH_SECRET", process.env.AUTH_SECRET);
    },
  },
} as const;

import { ImageResponse } from "next/og";
import { getContainer } from "@/lib/container";

export const alt = "Picasso — Crafting Excellence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Picasso";
const FALLBACK_TAGLINE =
  process.env.NEXT_PUBLIC_BRAND_TAGLINE ?? "Crafting Excellence";

/**
 * Open Graph image for the home page. Pulls the hero copy from SiteContent so
 * link previews always match what the page actually shows; falls back to the
 * branded defaults if the row is missing or the DB call fails.
 */
export default async function OgHome() {
  let title = SITE_NAME;
  let tagline = FALLBACK_TAGLINE;
  try {
    const hero = await getContainer().siteContentService.getByKey("hero");
    if (hero) {
      title = hero.title;
      tagline = hero.description;
    }
  } catch {
    /* keep branded fallback */
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #FFFDF2 0%, #FFFFFF 60%, #FACC15 180%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "9999px",
              background: "#FACC15",
            }}
          />
          <div
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "#0F172A",
              letterSpacing: "-0.01em",
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "84px",
              fontWeight: 700,
              color: "#0F172A",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: "900px",
            }}
          >
            {title.slice(0, 80)}
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: 400,
              color: "#475569",
              lineHeight: 1.3,
              maxWidth: "900px",
            }}
          >
            {tagline.slice(0, 140)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#94A3B8",
            fontSize: "22px",
          }}
        >
          <div>Catalogue · Quote on request</div>
          <div
            style={{
              padding: "10px 22px",
              borderRadius: "9999px",
              background: "#FACC15",
              color: "#0F172A",
              fontWeight: 600,
            }}
          >
            Explore
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

import { ImageResponse } from "next/og";
import { getContainer } from "@/lib/container";

export const alt = "Category";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Picasso";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Open Graph image for `/categories/[slug]`. Uses the category hero image as
 * the background with a dark scrim and overlays the category name + tagline.
 * Falls back to a branded card when the category is missing/unpublished or
 * the DB call fails.
 */
export default async function OgCategory({ params }: Props) {
  const { slug } = await params;
  let name = SITE_NAME;
  let description = "Browse our catalogue";
  let imageUrl: string | null = null;

  try {
    const category = await getContainer().categoryService.findBySlug(slug);
    if (category && category.isPublished) {
      name = category.name;
      description = category.shortDescription;
      imageUrl = category.imageUrl;
    }
  } catch {
    /* keep fallback */
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0F172A",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.85) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "80px",
            color: "#FFFFFF",
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
            <div style={{ fontSize: "26px", fontWeight: 600 }}>{SITE_NAME}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                fontSize: "32px",
                color: "#FACC15",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Category
            </div>
            <div
              style={{
                fontSize: "96px",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                maxWidth: "1000px",
              }}
            >
              {name.slice(0, 60)}
            </div>
            <div
              style={{
                fontSize: "30px",
                color: "#E2E8F0",
                lineHeight: 1.35,
                maxWidth: "1000px",
              }}
            >
              {description.slice(0, 160)}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

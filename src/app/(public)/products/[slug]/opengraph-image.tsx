import { ImageResponse } from "next/og";
import { getPublishedProductBySlug } from "@/lib/public-cache";

export const alt = "Product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Picasso";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Open Graph image for `/products/[slug]`. Two-column layout: the product's
 * first image on the left, name + truncated description + brand line on the
 * right. Falls back to a branded card when the product is missing or has no
 * gallery image.
 */
export default async function OgProduct({ params }: Props) {
  const { slug } = await params;
  let name = SITE_NAME;
  let description = "Request a quote";
  let imageUrl: string | null = null;

  try {
    const product = await getPublishedProductBySlug(slug);
    if (product && product.isPublished) {
      name = product.name;
      description = product.longDescription;
      imageUrl = product.images[0]?.url ?? null;
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
          background: "#FFFFFF",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "50%",
            height: "100%",
            background: "#F1F5F9",
            position: "relative",
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              width={600}
              height={630}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                color: "#94A3B8",
                fontSize: "28px",
              }}
            >
              No image
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "50%",
            padding: "64px",
            background:
              "linear-gradient(180deg, #FFFFFF 0%, #FFFDF2 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "9999px",
                background: "#FACC15",
              }}
            />
            <div style={{ fontSize: "24px", fontWeight: 600, color: "#0F172A" }}>
              {SITE_NAME}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                fontSize: "22px",
                color: "#A16207",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Product
            </div>
            <div
              style={{
                fontSize: "62px",
                fontWeight: 700,
                color: "#0F172A",
                letterSpacing: "-0.02em",
                lineHeight: 1.08,
              }}
            >
              {name.slice(0, 70)}
            </div>
            <div
              style={{
                fontSize: "24px",
                color: "#475569",
                lineHeight: 1.4,
              }}
            >
              {description.slice(0, 180)}
            </div>
          </div>

          <div
            style={{
              padding: "12px 22px",
              borderRadius: "9999px",
              background: "#FACC15",
              color: "#0F172A",
              fontWeight: 600,
              fontSize: "22px",
              alignSelf: "flex-start",
            }}
          >
            Get a quote
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

"use client";

import { useEffect } from "react";

/**
 * Top-level error boundary for the entire app. Activated only when the root
 * layout itself throws, so it must render its own <html>/<body>. Tailwind is
 * unavailable here in some failure modes — styles are inlined to guarantee a
 * readable fallback.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("GlobalError:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAFAFA",
          color: "#18181B",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            background: "#FFFFFF",
            border: "1px solid #E4E4E7",
            borderRadius: 12,
            padding: 40,
            textAlign: "center",
            boxShadow: "0 1px 3px 0 rgba(0,0,0,0.06)",
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Something went wrong
          </h1>
          <p style={{ marginTop: 8, color: "#71717A", fontSize: 14 }}>
            An unexpected error occurred. Please try again.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: 12,
                color: "#A1A1AA",
                fontSize: 12,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              Ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              height: 40,
              padding: "0 20px",
              borderRadius: 6,
              border: 0,
              background: "#FACC15",
              color: "#18181B",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

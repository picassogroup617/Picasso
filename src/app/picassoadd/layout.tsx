import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function PicassoaddLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Intentionally minimal: each nested route group (login, panel) owns its own canvas.
  return <>{children}</>;
}

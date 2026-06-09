import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Variable serif with `opsz` (optical size) + `SOFT` axes — handles the hero
// at large sizes and section headings at smaller sizes with the same family.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Picasso";
const tagline = process.env.NEXT_PUBLIC_BRAND_TAGLINE ?? "Crafting Excellence";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — ${tagline}`,
    template: `%s | ${siteName}`,
  },
  description: `${siteName}. ${tagline}.`,
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} — ${tagline}`,
    description: `${siteName}. ${tagline}.`,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — ${tagline}`,
    description: `${siteName}. ${tagline}.`,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#18181B" },
  ],
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-brand-white font-sans text-brand-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}

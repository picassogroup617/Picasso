"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuoteRequestButton } from "./QuoteRequestButton";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-gray-200 bg-brand-white/90 backdrop-blur">
      <div className="container-page flex h-24 items-center justify-between gap-4">
        <Link
          href="/"
          aria-label={siteName}
          className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
        >
          <Image
            src="/brand/logo.png"
            alt={siteName}
            width={320}
            height={80}
            priority
            className="h-20 w-auto"
          />
          <span className="sr-only">{siteName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition",
                  active
                    ? "font-medium text-brand-gray-900"
                    : "text-brand-gray-700 hover:bg-brand-gray-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <QuoteRequestButton size="sm">Get a quote</QuoteRequestButton>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-brand-gray-700 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-brand-gray-200 bg-brand-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2">
              <QuoteRequestButton size="sm" className="w-full">
                Get a quote
              </QuoteRequestButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

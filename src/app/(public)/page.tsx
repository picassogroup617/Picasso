import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { QuoteRequestButton } from "@/components/public/QuoteRequestButton";
import { CategoryImageSlideshow } from "@/components/public/CategoryImageSlideshow";
import { HeroBackground } from "@/components/public/HeroBackground";
import {
  getCategorySlides,
  getPublishedCategories,
  getSiteContent,
} from "@/lib/public-cache";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Picasso";
const FALLBACK_TAGLINE =
  process.env.NEXT_PUBLIC_BRAND_TAGLINE ?? "Crafting Excellence";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const hero = await getSiteContent("hero").catch(() => null);
  const title = hero?.title ?? `${SITE_NAME} — ${FALLBACK_TAGLINE}`;
  const description = hero?.description ?? `${SITE_NAME}. ${FALLBACK_TAGLINE}.`;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function HomePage() {
  const [hero, story, vision, categories] = await Promise.all([
    getSiteContent("hero"),
    getSiteContent("our_story"),
    getSiteContent("our_vision"),
    getPublishedCategories(6),
  ]);

  const slidesByCategory = await getCategorySlides(categories.map((c) => c.id));

  const heroTitle = hero?.title ?? SITE_NAME;
  const heroTagline = hero?.description ?? FALLBACK_TAGLINE;

  return (
    <>
      <section className="relative overflow-hidden border-b border-brand-gray-200 bg-gradient-to-b from-brand-yellow-soft/40 to-brand-white">
        <HeroBackground />
        <div className="container-page relative z-10 py-8 sm:py-12">
          <div className="mx-auto max-w-4xl text-center">
            <Image
              src="/brand/logo.png"
              alt={SITE_NAME}
              width={480}
              height={120}
              priority
              className="mx-auto h-28 w-auto sm:h-36"
            />
            <h1 className="mt-3 line-clamp-2 text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight text-brand-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
              {heroTitle}
            </h1>
            <hr className="mx-auto mt-4 max-w-2xl border-t border-brand-gray-300" />
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-brand-gray-700 sm:text-lg">
              {heroTagline}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <QuoteRequestButton size="lg">Get a quote</QuoteRequestButton>
              <Link
                href="/categories"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-brand-gray-200 bg-brand-white px-5 text-sm font-medium text-brand-gray-700 transition hover:bg-brand-gray-50"
              >
                Explore products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {(story || vision) && (
        <section className="container-page py-20">
          <div className="flex flex-col gap-16 sm:gap-24">
            {story && <StoryBlock content={story} />}
            {vision && <StoryBlock content={vision} reverse />}
          </div>
        </section>
      )}

      <section className="border-t border-brand-gray-200 bg-brand-gray-50 py-20">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-brand-gray-500">
                Catalog
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Explore our categories
              </h2>
            </div>
            <Link
              href="/categories"
              className="hidden items-center gap-1 text-sm font-medium text-brand-gray-700 hover:text-brand-gray-900 sm:inline-flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {categories.length === 0 ? (
            <p className="mt-8 text-sm text-brand-gray-500">
              Categories will appear here once published.
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className="group block overflow-hidden rounded-xl border border-brand-gray-200 bg-brand-white transition hover:border-brand-yellow hover:shadow-soft"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-brand-gray-100">
                    <CategoryImageSlideshow
                      images={slidesByCategory.get(c.id) ?? []}
                      fallbackUrl={c.imageUrl}
                      fallbackAlt={c.name}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-medium text-brand-gray-900">
                      {c.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-brand-gray-500">
                      {c.shortDescription}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function StoryBlock({
  content,
  reverse,
}: {
  content: { title: string; description: string; imageUrl: string | null };
  reverse?: boolean;
}) {
  const hasImage = !!content.imageUrl;
  return (
    <article
      className={
        hasImage
          ? "grid items-center gap-8 sm:gap-12 lg:grid-cols-2"
          : "mx-auto max-w-3xl text-center"
      }
    >
      {hasImage && (
        <div
          className={`relative aspect-[4/3] overflow-hidden rounded-xl bg-brand-gray-100 ${
            reverse ? "lg:order-2" : ""
          }`}
        >
          <Image
            src={content.imageUrl!}
            alt={content.title}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div>
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {content.title}
        </h2>
        <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-brand-gray-700 sm:text-lg">
          {content.description}
        </p>
      </div>
    </article>
  );
}

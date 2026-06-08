import type { SVGProps } from "react";

/**
 * Decorative animated backdrop for the home-hero. Three slow-morphing
 * gradient "auroras" in brand colours, plus a few drifting umbrella
 * silhouettes that nod to the product line. All animations are gated by
 * `motion-safe:` so reduced-motion users get a static gradient instead.
 *
 * The component is purely visual: positioned absolutely, ignores pointer
 * events, hidden from assistive tech.
 */
export function HeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Soft yellow aurora — top-left */}
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-yellow/50 blur-3xl motion-safe:animate-blob-a sm:h-96 sm:w-96" />
      {/* Logo-blue aurora — top-right */}
      <div className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#1E40AF]/30 blur-3xl motion-safe:animate-blob-b sm:h-[28rem] sm:w-[28rem]" />
      {/* Warm yellow aurora — bottom-centre */}
      <div className="absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-yellow-soft/80 blur-3xl motion-safe:animate-blob-c sm:h-96 sm:w-96" />

      {/* Floating brand silhouettes — umbrella, canopy, flag mix */}
      <UmbrellaIcon className="absolute left-[6%] top-[18%] h-10 w-10 text-brand-yellow/60 motion-safe:animate-float-slow" />
      <CanopyIcon className="absolute right-[8%] top-[28%] h-12 w-12 text-[#1E40AF]/45 motion-safe:animate-float-slower" />
      <FlagIcon className="absolute bottom-[12%] left-[14%] h-9 w-9 rotate-6 text-brand-yellow/50 motion-safe:animate-float-slower" />
      <UmbrellaIcon className="absolute bottom-[18%] right-[12%] h-9 w-9 -rotate-6 text-[#1E40AF]/40 motion-safe:animate-float-slow" />

      {/* Slow horizontal drift — a tiny dot trail for extra motion */}
      <div className="absolute top-[55%] left-0 h-1.5 w-1.5 rounded-full bg-brand-yellow/60 blur-[1px] motion-safe:animate-drift-x" />
    </div>
  );
}

/** Minimal umbrella glyph; inherits text colour via `currentColor`. */
function UmbrellaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2c-5.52 0-10 4.48-10 10h8V10a2 2 0 1 1 4 0v2h8c0-5.52-4.48-10-10-10Z" />
      <path d="M11 13v6a2 2 0 1 1-4 0h-2a4 4 0 0 0 8 0v-6h-2Z" />
    </svg>
  );
}

/** Peaked canopy / gazebo-tent silhouette. */
function CanopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2 2 10h2v10h3v-7h10v7h3V10h2L12 2Z" />
    </svg>
  );
}

/** Flag-on-pole silhouette. */
function FlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4 2h2v20H4z" />
      <path d="M6 3h12l-3 4 3 4H6z" />
    </svg>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  size?: "card" | "detail" | "hero";
  className?: string;
  priority?: boolean;
}

export function ImagePlaceholder({
  src,
  alt,
  size = "card",
  className = "",
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Avoid min-height + aspect-ratio together: on narrow screens min-h
  // expands width past the parent (e.g. 280px height ⇒ ~448px width).
  const heights = {
    card: "aspect-[4/3]",
    detail: "aspect-[16/10] w-full max-w-full",
    hero: "aspect-[21/9] w-full max-w-full",
  };

  const sizesAttr =
    size === "detail"
      ? "(max-width: 896px) 100vw, 896px"
      : size === "hero"
        ? "100vw"
        : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  const showImage = !failed && Boolean(src);

  return (
    <div
      className={`relative box-border w-full max-w-full overflow-hidden rounded-lg border border-border bg-[#0a0e14] ${heights[size]} ${className}`}
      role="img"
      aria-label={alt}
    >
      {/* Base dark wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121820] via-[#0d1117] to-[#080b10]" />

      {/* Animated mist */}
      <div className="mist-animate absolute inset-0 bg-[radial-gradient(ellipse_at_30%_80%,rgba(139,148,158,0.12),transparent_55%)]" />
      <div
        className="mist-animate absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(201,162,39,0.06),transparent_50%)]"
        style={{ animationDelay: "2.5s" }}
      />

      {/* Silhouette fallback */}
      <div className="absolute inset-0 flex items-end justify-center pb-[8%]">
        <GiantSilhouette className="h-[75%] w-auto max-w-[55%] text-text-muted opacity-[0.18]" />
      </div>

      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.55)]" />

      {showImage && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizesAttr}
          priority={priority}
          className={`object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent" />
    </div>
  );
}

function GiantSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 200"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <ellipse cx="60" cy="28" rx="16" ry="18" />
      <path d="M40 42c-8 4-18 18-22 40-3 16-2 36 2 52l12-6c-2-12-2-28 0-40 4-18 12-28 18-32v-14z" />
      <path d="M80 42c8 4 18 18 22 40 3 16 2 36-2 52l-12-6c2-12 2-28 0-40-4-18-12-28-18-32v-14z" />
      <path d="M42 48h36c8 20 10 50 8 80-1 18-4 40-6 58h-12l-2-50c0-4-2-6-6-6s-6 2-6 6l-2 50H40c-2-18-5-40-6-58-2-30 0-60 8-80z" />
      <path d="M48 186c-2 4-6 10-8 14h16l-2-14h-6z" />
      <path d="M72 186c2 4 6 10 8 14H64l2-14h6z" />
    </svg>
  );
}

"use client";

import dynamic from "next/dynamic";
import type { GiantCardData } from "@/lib/giants";

const GiantsMap = dynamic(
  () => import("./GiantsMap").then((m) => m.GiantsMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(70vh,640px)] w-full items-center justify-center rounded-lg border border-border bg-surface text-sm text-text-muted">
        Unrolling the dark map…
      </div>
    ),
  }
);

export function GiantsMapLoader({
  giants,
  focusSlug,
  emphasizeFocus = true,
  selectedLineMotifs = [],
  motifNames = {},
}: {
  giants: GiantCardData[];
  focusSlug?: string | null;
  emphasizeFocus?: boolean;
  selectedLineMotifs?: string[];
  motifNames?: Record<string, string>;
}) {
  return (
    <GiantsMap
      giants={giants}
      focusSlug={focusSlug}
      emphasizeFocus={emphasizeFocus}
      selectedLineMotifs={selectedLineMotifs}
      motifNames={motifNames}
    />
  );
}

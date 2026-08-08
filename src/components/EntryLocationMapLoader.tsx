"use client";

import dynamic from "next/dynamic";

const EntryLocationMap = dynamic(
  () =>
    import("./EntryLocationMap").then((m) => m.EntryLocationMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-40 w-full animate-pulse rounded-md border border-border bg-[#0d1117]"
        aria-hidden
      />
    ),
  }
);

export function EntryLocationMapLoader({
  coordinates,
  name,
}: {
  coordinates: [number, number];
  name: string;
}) {
  return <EntryLocationMap coordinates={coordinates} name={name} />;
}

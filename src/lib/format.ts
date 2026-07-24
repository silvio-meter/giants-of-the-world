/**
 * Data-free helpers and types.
 *
 * Client components must import from here rather than from `@/lib/giants` —
 * that module imports the whole catalog JSON, and a value import of it drags
 * ~40 KB of data into the browser bundle.
 */

import type { Giant, GiantType } from "./types";

/** Client-safe catalog shape (no fullDescription / mysteryNote). */
export type GiantCardData = Omit<Giant, "fullDescription" | "mysteryNote">;

export function formatType(type: GiantType): string {
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

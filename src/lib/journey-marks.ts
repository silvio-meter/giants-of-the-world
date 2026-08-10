/**
 * My Journey marks — three private toggles per giant entry.
 *
 * Free: sessionStorage only (lost when the tab closes).
 * Paid: synced via /api/marks to the signed-in account.
 */

export const JOURNEY_MARK_TYPES = [
  "unsettled",
  "another-version",
  "keep-a-rule",
] as const;

export type JourneyMarkType = (typeof JOURNEY_MARK_TYPES)[number];

export const JOURNEY_MARK_META: Record<
  JourneyMarkType,
  { label: string; helper: string }
> = {
  unsettled: {
    label: "This unsettled me",
    helper: "Something here still has weight.",
  },
  "another-version": {
    label: "I was taught another version",
    helper: "The story I received does not match what is here.",
  },
  "keep-a-rule": {
    label: "I still keep a rule from this",
    helper: "A prohibition or obligation that survived.",
  },
};

export const JOURNEY_NOTE_MAX = 280;

/** One entry's mark state. */
export interface EntryMarks {
  slug: string;
  marks: JourneyMarkType[];
  /** Paid only; free clients never send notes to the server. */
  note: string;
  updatedAt: string;
}

export function isJourneyMarkType(value: unknown): value is JourneyMarkType {
  return (
    typeof value === "string" &&
    (JOURNEY_MARK_TYPES as readonly string[]).includes(value)
  );
}

export function normalizeMarks(raw: unknown): JourneyMarkType[] {
  if (!Array.isArray(raw)) return [];
  const out: JourneyMarkType[] = [];
  for (const item of raw) {
    if (isJourneyMarkType(item) && !out.includes(item)) out.push(item);
  }
  return out;
}

export function clampNote(note: unknown): string {
  if (typeof note !== "string") return "";
  return note.trim().slice(0, JOURNEY_NOTE_MAX);
}

const SESSION_KEY = "gotw:journey-marks:v1";

type SessionStore = Record<string, EntryMarks>;

function readSession(): SessionStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SessionStore;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeSession(store: SessionStore) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(store));
  } catch {
    // Quota or private mode — marks simply do not persist this session.
  }
}

export function getSessionMarks(slug: string): EntryMarks | null {
  const row = readSession()[slug];
  if (!row) return null;
  return {
    slug,
    marks: normalizeMarks(row.marks),
    note: clampNote(row.note),
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date().toISOString(),
  };
}

export function setSessionMarks(entry: EntryMarks): void {
  const store = readSession();
  if (entry.marks.length === 0 && !entry.note) {
    delete store[entry.slug];
  } else {
    store[entry.slug] = {
      slug: entry.slug,
      marks: normalizeMarks(entry.marks),
      note: clampNote(entry.note),
      updatedAt: entry.updatedAt || new Date().toISOString(),
    };
  }
  writeSession(store);
}

export function listSessionMarks(): EntryMarks[] {
  return Object.values(readSession()).filter(
    (row) => row.marks?.length > 0 || Boolean(row.note)
  );
}

export async function fetchSyncedMarks(): Promise<EntryMarks[]> {
  try {
    const res = await fetch("/api/marks", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { entries?: EntryMarks[] };
    return data.entries ?? [];
  } catch {
    return [];
  }
}

export async function fetchSyncedMarksForSlug(
  slug: string
): Promise<EntryMarks | null> {
  try {
    const res = await fetch(`/api/marks?slug=${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { entry?: EntryMarks | null };
    return data.entry ?? null;
  } catch {
    return null;
  }
}

export async function saveSyncedMarks(
  entry: Omit<EntryMarks, "updatedAt"> & { updatedAt?: string }
): Promise<{ ok: boolean; error?: string; entry?: EntryMarks }> {
  try {
    const res = await fetch("/api/marks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: entry.slug,
        marks: entry.marks,
        note: entry.note,
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      return { ok: false, error: data?.error ?? "Could not save." };
    }
    const data = (await res.json()) as { entry?: EntryMarks };
    return { ok: true, entry: data.entry };
  } catch {
    return { ok: false, error: "Network error" };
  }
}

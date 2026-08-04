"use client";

import { useState } from "react";
import { createRoot } from "react-dom/client";
import { track } from "@/lib/track";
import { usePlan } from "./PlanProvider";
import { PremiumLock } from "./PremiumLock";
import { MyJourneyCard, type JourneyStop } from "./MyJourneyCard";

/**
 * Exports a shareable image of a signed-in user's saved giants. Mirrors
 * CompareExportButton's shape: html2canvas is dynamically imported inside
 * the click handler, never at module scope, so it stays out of every
 * route's eager chunk list.
 */
export function MyJourneyButton() {
  const { isPaid, ready, userId } = usePlan();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!ready) return null;

  if (!userId || !isPaid) {
    return (
      <PremiumLock
        label="Unlock My Journey: a shareable map of your saved giants"
        className="max-w-sm"
      />
    );
  }

  async function download() {
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/journey");
      if (!res.ok) throw new Error("fetch failed");
      const { stops } = (await res.json()) as { stops: JourneyStop[] };

      if (stops.length === 0) {
        setError("Save a giant with a known location first.");
        return;
      }

      const host = document.createElement("div");
      host.style.position = "fixed";
      host.style.left = "-9999px";
      host.style.top = "0";
      document.body.appendChild(host);
      const root = createRoot(host);

      try {
        const { default: html2canvas } = await import("html2canvas");

        await new Promise<void>((resolve) => {
          root.render(<MyJourneyCard stops={stops} />);
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });

        const canvas = await html2canvas(host.firstElementChild as HTMLElement, {
          scale: 4,
          backgroundColor: "#0d1117",
          useCORS: true,
        });

        const link = document.createElement("a");
        link.download = "giants-codex-my-journey.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        track("My Journey downloaded", { stopCount: stops.length });
      } finally {
        root.unmount();
        host.remove();
      }
    } catch (err) {
      console.error("journey export", err);
      setError("Could not generate the image. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={() => void download()}
        disabled={busy}
        className="rounded border border-border px-4 py-2 text-sm text-text-muted transition hover:border-accent-gold/40 hover:text-accent-gold disabled:opacity-60"
      >
        {busy ? "Preparing image…" : "Download My Journey"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { track } from "@/lib/track";
import { CompareExportCard, type ExportGiant } from "./CompareExportCard";

interface Props {
  a: ExportGiant;
  b: ExportGiant;
}

/**
 * html2canvas is ~200 KB and only ever needed if someone clicks this button,
 * so it is imported here — inside the click handler, not at module scope —
 * rather than at the top of the file. Confirmed by the bundle guard tests
 * that it never reaches the shared chunks.
 */
export function CompareExportButton({ a, b }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  async function download() {
    setBusy(true);
    setError("");

    // Rendered off-screen (not display:none — html2canvas cannot rasterize
    // that) at a fixed size, independent of the visible page's responsive
    // layout, then torn down once the image is captured.
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "-9999px";
    host.style.top = "0";
    document.body.appendChild(host);
    const root = createRoot(host);

    try {
      const { default: html2canvas } = await import("html2canvas");

      await new Promise<void>((resolve) => {
        root.render(<CompareExportCard a={a} b={b} />);
        // Let the DOM (and the two <img> tags) actually paint before capture.
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      const canvas = await html2canvas(host.firstElementChild as HTMLElement, {
        scale: 4,
        backgroundColor: "#0d1117",
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `giants-codex-${a.name}-vs-${b.name}.png`
        .toLowerCase()
        .replace(/\s+/g, "-");
      link.href = canvas.toDataURL("image/png");
      link.click();
      track("Compare image downloaded");
    } catch (err) {
      console.error("compare export", err);
      setError("Could not generate the image. Try again.");
    } finally {
      root.unmount();
      host.remove();
      setBusy(false);
    }
  }

  return (
    <div ref={containerRef}>
      <button
        type="button"
        onClick={() => void download()}
        disabled={busy}
        className="rounded border border-border px-4 py-2 text-sm text-text-muted transition hover:border-accent-gold/40 hover:text-accent-gold disabled:opacity-60"
      >
        {busy ? "Preparing image…" : "Download as image"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

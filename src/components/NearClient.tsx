"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import Link from "next/link";
import { FavouriteButton } from "./FavouriteButton";
import {
  DEFAULT_RADIUS,
  RADII,
  countWord,
  formatKm,
  rankByDistance,
  type NearPoint,
} from "@/lib/near";

const NearMap = dynamic(() => import("./NearMap").then((m) => m.NearMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(55vh,460px)] w-full items-center justify-center rounded-lg border border-border bg-surface text-sm text-text-muted">
      Unrolling the dark map…
    </div>
  ),
});

/**
 * Everything here runs on the device. The position is never sent anywhere,
 * never written to the URL, and never stored, which is the whole reason the
 * distances are computed in the browser rather than on the server.
 *
 * `unlocked` arrives from the server, decided by the plan, never from a query
 * string, so the full list cannot be reached by typing an address by hand.
 */
export function NearClient({
  points,
  unlocked,
}: {
  points: NearPoint[];
  unlocked: boolean;
}) {
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState<number>(DEFAULT_RADIUS);
  const [asked, setAsked] = useState(false);
  const [declined, setDeclined] = useState(false);

  const ranked = useMemo(
    () => (origin ? rankByDistance(origin, points) : []),
    [origin, points]
  );
  const within = useMemo(
    () => ranked.filter((r) => r.km <= radius),
    [ranked, radius]
  );
  const inRange = useMemo(() => new Set(within.map((r) => r.slug)), [within]);
  const nearest = ranked[0];

  function locate() {
    setAsked(true);
    if (!("geolocation" in navigator)) {
      setDeclined(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setOrigin([pos.coords.latitude, pos.coords.longitude]),
      // A refusal is a choice, not a fault, so it gets no error styling.
      () => setDeclined(true),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  function exportList() {
    const lines = [
      "distance_km,name,culture,real_site,url",
      ...within.map((r) =>
        [
          r.km.toFixed(1),
          `"${r.name.replace(/"/g, '""')}"`,
          `"${r.culture.replace(/"/g, '""')}"`,
          r.realSite ? "yes" : "no",
          `https://www.giantscodex.com/giants/${r.slug}`,
        ].join(",")
      ),
    ];
    const url = URL.createObjectURL(
      new Blob([lines.join("\n")], { type: "text/csv" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `giants-within-${radius}km.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={locate}
            className="rounded border border-accent-gold/40 px-3 py-1.5 text-sm text-accent-gold hover:bg-accent-gold/10"
          >
            Use my location
          </button>
          <span className="text-sm text-text-muted">
            {origin
              ? "Or click the map to move the point."
              : "Or click anywhere on the map to set a point."}
          </span>
        </div>

        {asked && declined && !origin && (
          <p className="mt-3 text-sm text-text-muted">
            No location then. Click the map instead and it works the same way.
            Nothing you pick is sent anywhere.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] tracking-wider text-text-muted uppercase">
            Within
          </span>
          {RADII.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadius(r)}
              className={`rounded-full border px-3 py-1 text-xs ${
                radius === r
                  ? "border-accent-gold/60 bg-accent-gold/10 text-accent-gold"
                  : "border-border text-text-muted hover:text-text-primary"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      <NearMap
        points={points}
        origin={origin}
        inRange={inRange}
        onPick={setOrigin}
      />

      {!origin ? (
        <p className="text-sm text-text-muted">
          Set a point and the catalogue sorts itself around it.
        </p>
      ) : within.length === 0 ? (
        /* An empty radius is a fact about geography, not a failure. */
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-text-primary">
            Nothing within {radius} km. The catalogue is thin outside Europe and
            the Mediterranean, and that is a fact about who wrote things down,
            not about who told stories.
          </p>
          {nearest && (
            <p className="mt-3 text-sm text-text-muted">
              The nearest is{" "}
              <Link
                href={`/giants/${nearest.slug}`}
                className="text-accent-gold hover:underline"
              >
                {nearest.name}
              </Link>{" "}
              at {formatKm(nearest.km)}.{" "}
              {RADII.filter((r) => r > radius && r >= nearest.km).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className="text-accent-gold hover:underline"
                >
                  Widen to {r} km
                </button>
              ))}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-5">
          {/* The count is free. The count is what earns the click. */}
          <p className="font-[family-name:var(--font-cinzel)] text-xl text-accent-gold">
            {countWord(within.length)} giant{within.length === 1 ? "" : "s"}{" "}
            within {radius} km of you.
          </p>
          <p className="mt-2 text-sm text-text-muted">
            Nearest:{" "}
            <Link
              href={`/giants/${within[0].slug}`}
              className="text-accent-gold hover:underline"
            >
              {within[0].name}
            </Link>
            , {formatKm(within[0].km)}.
          </p>

          {unlocked ? (
            <>
              <ul className="mt-5 divide-y divide-border">
                {within.map((r) => (
                  <li
                    key={r.slug}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2"
                  >
                    <span className="w-20 font-mono text-xs text-text-muted">
                      {formatKm(r.km)}
                    </span>
                    <Link
                      href={`/giants/${r.slug}`}
                      className="text-sm text-accent-gold hover:underline"
                    >
                      {r.name}
                    </Link>
                    <span className="text-xs text-text-muted">{r.culture}</span>
                    {r.realSite && (
                      <span
                        className="rounded-full border border-accent-gold/40 px-1.5 py-px text-[9px] tracking-wider text-accent-gold uppercase"
                        title="A real place attached to this tradition"
                      >
                        Site
                      </span>
                    )}
                    <span className="ml-auto">
                      <FavouriteButton
                        slug={r.slug}
                        name={r.name}
                        variant="card"
                      />
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={exportList}
                className="mt-4 rounded border border-accent-gold/40 px-3 py-1.5 text-sm text-accent-gold hover:bg-accent-gold/10"
              >
                Export as CSV
              </button>
            </>
          ) : (
            <div className="mt-5 rounded border border-border p-4">
              <p className="text-sm text-text-primary">
                The rest of the list, with distances, which of them are real
                places you can stand on, and an export.
              </p>
              <Link
                href="/pricing"
                className="mt-3 inline-block text-sm text-accent-gold hover:underline"
              >
                View pricing →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

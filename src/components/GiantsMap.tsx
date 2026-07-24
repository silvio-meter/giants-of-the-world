"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { GiantCardData } from "@/lib/giants";

function makeIcon(focused: boolean) {
  if (focused) {
    return L.divIcon({
      className: "giant-marker giant-marker-focus",
      html: `<div style="
        width:22px;height:22px;border-radius:50%;
        background:radial-gradient(circle at 35% 30%,#fff6c8,#f0d060 40%,#c9a227 70%,#6b5512);
        border:2.5px solid #e6edf3;
        box-shadow:0 0 0 4px rgba(201,162,39,0.35),0 0 22px rgba(201,162,39,0.85),0 2px 8px rgba(0,0,0,0.6);
      "></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -12],
    });
  }
  return L.divIcon({
    className: "giant-marker",
    html: `<div style="
      width:12px;height:12px;border-radius:50%;
      background:radial-gradient(circle at 35% 35%,#e6c65a,#c9a227 55%,#6b5512);
      border:1.5px solid #8b949e;
      box-shadow:0 0 8px rgba(201,162,39,0.4),0 2px 6px rgba(0,0,0,0.5);
      opacity:0.85;
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -8],
  });
}

function FitOrFocus({
  points,
  focus,
}: {
  points: [number, number][];
  focus: [number, number] | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.setView(focus, 5, { animate: true });
      return;
    }
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 4);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
  }, [map, points, focus]);
  return null;
}

interface Props {
  giants: GiantCardData[];
  focusSlug?: string | null;
  emphasizeFocus?: boolean;
}

export function GiantsMap({
  giants,
  focusSlug = null,
  emphasizeFocus = true,
}: Props) {
  const located = useMemo(
    () => giants.filter((g) => g.coordinates !== null),
    [giants]
  );

  const focusGiant = useMemo(
    () =>
      focusSlug ? located.find((g) => g.slug === focusSlug) ?? null : null,
    [located, focusSlug]
  );

  const points = useMemo(
    () => located.map((g) => g.coordinates as [number, number]),
    [located]
  );

  const focusPoint = focusGiant?.coordinates ?? null;

  return (
    <div className="w-full max-w-full overflow-hidden rounded-lg border border-border">
      {focusGiant && (
        <p className="border-b border-border bg-surface px-3 py-2 text-xs text-text-muted sm:px-4">
          Focusing{" "}
          <span className="font-[family-name:var(--font-cinzel)] text-accent-gold">
            {focusGiant.name}
          </span>
          <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full bg-accent-gold align-middle shadow-[0_0_8px_rgba(201,162,39,0.9)]" />
        </p>
      )}
      <div
        className={`w-full ${
          focusGiant ? "h-[min(65vh,600px)]" : "h-[min(70vh,640px)]"
        }`}
      >
        <MapContainer
          center={focusPoint ?? [20, 10]}
          zoom={focusPoint ? 5 : 2}
          minZoom={2}
          maxZoom={10}
          scrollWheelZoom
          className="h-full w-full"
          worldCopyJump
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FitOrFocus points={points} focus={focusPoint} />
          {located.map((g) => {
            const focused = Boolean(focusSlug && g.slug === focusSlug);
            const dimmed = Boolean(emphasizeFocus && focusSlug && !focused);
            return (
              <Marker
                key={g.id}
                position={g.coordinates as [number, number]}
                icon={makeIcon(focused)}
                opacity={dimmed ? 0.4 : 1}
                zIndexOffset={focused ? 1000 : 0}
                eventHandlers={
                  focused
                    ? {
                        add: (e) => {
                          window.setTimeout(() => e.target.openPopup(), 450);
                        },
                      }
                    : undefined
                }
              >
                <Popup>
                  <div className="min-w-[140px]">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: focused ? "#c9a227" : "#e6edf3" }}
                    >
                      {g.name}
                      {focused ? " · focused" : ""}
                    </p>
                    <p className="text-xs" style={{ color: "#8b949e" }}>
                      {g.culture} · {g.region}
                    </p>
                    <Link
                      href={`/giants/${g.slug}`}
                      className="mt-2 inline-block text-xs"
                      style={{ color: "#c9a227" }}
                    >
                      Open entry →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

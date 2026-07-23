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
import type { Giant } from "@/lib/types";

const goldIcon = L.divIcon({
  className: "giant-marker",
  html: `<div style="
    width:14px;height:14px;border-radius:50%;
    background:radial-gradient(circle at 35% 35%,#e6c65a,#c9a227 55%,#6b5512);
    border:1.5px solid #e6edf3;
    box-shadow:0 0 10px rgba(201,162,39,0.55),0 2px 6px rgba(0,0,0,0.5);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -8],
});

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 4);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
  }, [map, points]);
  return null;
}

interface Props {
  giants: Giant[];
}

export function GiantsMap({ giants }: Props) {
  const located = useMemo(
    () => giants.filter((g) => g.coordinates !== null),
    [giants]
  );

  const points = useMemo(
    () => located.map((g) => g.coordinates as [number, number]),
    [located]
  );

  return (
    <div className="h-[min(70vh,640px)] w-full overflow-hidden rounded-lg border border-border">
      <MapContainer
        center={[20, 10]}
        zoom={2}
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
        <FitBounds points={points} />
        {located.map((g) => (
          <Marker
            key={g.id}
            position={g.coordinates as [number, number]}
            icon={goldIcon}
          >
            <Popup>
              <div className="min-w-[140px]">
                <p className="font-semibold text-sm" style={{ color: "#e6edf3" }}>
                  {g.name}
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
        ))}
      </MapContainer>
    </div>
  );
}

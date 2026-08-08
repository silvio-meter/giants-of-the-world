"use client";

import { useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { NearPoint } from "@/lib/near";

/**
 * The point picker. Small and separate from GiantsMap on purpose: that one
 * takes a full GiantCardData, and /near is only allowed the five fields, so
 * reusing it would pull the catalogue into this bundle.
 */

function ClickToPick({ onPick }: { onPick: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const originIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#c9a227;box-shadow:0 0 0 4px rgba(201,162,39,.28)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function NearMap({
  points,
  origin,
  inRange,
  onPick,
}: {
  points: NearPoint[];
  origin: [number, number] | null;
  inRange: Set<string>;
  onPick: (p: [number, number]) => void;
}) {
  const center = useMemo<[number, number]>(() => origin ?? [30, 10], [origin]);

  return (
    <MapContainer
      center={center}
      zoom={origin ? 5 : 2}
      scrollWheelZoom
      className="h-[min(55vh,460px)] w-full rounded-lg border border-border"
      style={{ background: "#0d1117" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <ClickToPick onPick={onPick} />

      {points.map((p) => {
        const near = inRange.has(p.slug);
        return (
          <CircleMarker
            key={p.slug}
            center={p.coordinates}
            radius={near ? 5 : 3}
            pathOptions={{
              color: near ? "#c9a227" : "#8b949e",
              fillColor: near ? "#c9a227" : "#8b949e",
              fillOpacity: near ? 0.9 : 0.35,
              weight: 1,
            }}
          >
            <Tooltip>{p.name}</Tooltip>
          </CircleMarker>
        );
      })}

      {origin && <Marker position={origin} icon={originIcon} />}
    </MapContainer>
  );
}

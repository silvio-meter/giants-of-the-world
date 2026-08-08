"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Small dark pin map for a single entry. Coordinates only — not a photograph
 * of the site. Real place photos need licences and go elsewhere; this is our
 * own data rendered as a map, which is safe to generate.
 */
const pin = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#c9a227;box-shadow:0 0 0 3px rgba(201,162,39,.3)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export function EntryLocationMap({
  coordinates,
  name,
}: {
  coordinates: [number, number];
  name: string;
}) {
  const [lat, lng] = coordinates;

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={5}
      scrollWheelZoom={false}
      dragging
      doubleClickZoom={false}
      attributionControl
      className="h-40 w-full rounded-md border border-border"
      style={{ background: "#0d1117" }}
      aria-label={`Map location for ${name}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Marker position={[lat, lng]} icon={pin} />
    </MapContainer>
  );
}

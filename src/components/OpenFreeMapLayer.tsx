"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "@maplibre/maplibre-gl-leaflet";
import "maplibre-gl/dist/maplibre-gl.css";

const OPENFREEMAP_DARK = "https://tiles.openfreemap.org/styles/dark";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://openfreemap.org/">OpenFreeMap</a>';

/**
 * Vector basemap for every Leaflet map. CARTO's raster tiles now watermark
 * without a key; OpenFreeMap Dark (Dark Matter fork) does not need one.
 */
export function OpenFreeMapLayer() {
  const map = useMap();

  useEffect(() => {
    const layer = L.maplibreGL({
      style: OPENFREEMAP_DARK,
      // Plugin reads customAttribution for Leaflet's control; the GL map's
      // own attribution control is forced off inside maplibre-gl-leaflet.
      attributionControl: { customAttribution: ATTRIBUTION },
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
}

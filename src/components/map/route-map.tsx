"use client";

import { LatLngBounds } from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap
} from "react-leaflet";
import type { RoutePoint } from "@/types/quote";

interface RouteMapProps {
  geometry: RoutePoint[];
  start: RoutePoint;
  end: RoutePoint;
}

const FitToRoute = ({ points }: { points: RoutePoint[] }) => {
  const map = useMap();
  if (points.length > 1) {
    const bounds = new LatLngBounds(points.map((point) => [point.lat, point.lng]));
    map.fitBounds(bounds, { padding: [26, 26] });
  }
  return null;
};

export const RouteMap = ({ geometry, start, end }: RouteMapProps) => {
  const polylinePositions = geometry.map((point) => [point.lat, point.lng]) as [
    number,
    number
  ][];

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
      <MapContainer
        center={[start.lat, start.lng]}
        zoom={6}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToRoute points={geometry} />
        <Polyline
          positions={polylinePositions}
          pathOptions={{ color: "#0c5fa8", weight: 5, opacity: 0.9 }}
        />
        <CircleMarker center={[start.lat, start.lng]} radius={8} pathOptions={{ color: "#0f766e" }}>
          <Tooltip permanent direction="top">
            Start
          </Tooltip>
        </CircleMarker>
        <CircleMarker center={[end.lat, end.lng]} radius={8} pathOptions={{ color: "#b91c1c" }}>
          <Tooltip permanent direction="top">
            Cel
          </Tooltip>
        </CircleMarker>
      </MapContainer>
    </div>
  );
};

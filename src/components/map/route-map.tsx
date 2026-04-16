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
    map.fitBounds(bounds, { padding: [34, 34] });
  }
  return null;
};

export const RouteMap = ({ geometry, start, end }: RouteMapProps) => {
  const polylinePositions = geometry.map((point) => [point.lat, point.lng]) as [
    number,
    number
  ][];

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-[24px] border border-brand-300/28 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:h-[500px] 2xl:h-[560px]">
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
          pathOptions={{ color: "#8f6a35", weight: 3, opacity: 0.9 }}
        />
        <CircleMarker
          center={[start.lat, start.lng]}
          radius={9}
          pathOptions={{ color: "#253783", fillColor: "#253783", fillOpacity: 1 }}
        >
          <Tooltip permanent direction="top">
            Start
          </Tooltip>
        </CircleMarker>
        <CircleMarker
          center={[end.lat, end.lng]}
          radius={9}
          pathOptions={{ color: "#8f6a35", fillColor: "#8f6a35", fillOpacity: 1 }}
        >
          <Tooltip permanent direction="top">
            Cel
          </Tooltip>
        </CircleMarker>
      </MapContainer>
    </div>
  );
};

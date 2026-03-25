import { getAppEnv } from "@/lib/config/env";
import { fetchJson } from "@/lib/http/http-client";
import { DEFAULT_MVP_SETTINGS } from "@/lib/settings/default-settings";
import { roundTo2 } from "@/lib/shared/math";
import type { RoutePoint, RouteResult } from "@/types/quote";

interface RoutingProvider {
  name: string;
  calculateRoute(input: {
    start: RoutePoint;
    end: RoutePoint;
  }): Promise<RouteResult>;
}

interface OrsGeoJsonResponse {
  features?: Array<{
    geometry?: {
      coordinates?: [number, number][];
    };
    properties?: {
      summary?: {
        distance?: number;
        duration?: number;
      };
    };
  }>;
}

const toRadians = (value: number): number => (value * Math.PI) / 180;

const haversineDistanceKm = (start: RoutePoint, end: RoutePoint): number => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(end.lat - start.lat);
  const dLng = toRadians(end.lng - start.lng);
  const lat1 = toRadians(start.lat);
  const lat2 = toRadians(end.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const formula =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(formula), Math.sqrt(1 - formula));

  return earthRadiusKm * c;
};

class OsrmRoutingProvider implements RoutingProvider {
  readonly name = "osrm-driving";
  private readonly endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint =
      endpoint ?? "https://router.project-osrm.org/route/v1/driving";
  }

  async calculateRoute(input: {
    start: RoutePoint;
    end: RoutePoint;
  }): Promise<RouteResult> {
    const routeUrl = `${this.endpoint}/${input.start.lng},${input.start.lat};${input.end.lng},${input.end.lat}?overview=full&geometries=geojson`;
    const payload = await fetchJson<{
      routes?: Array<{
        distance: number;
        duration: number;
        geometry: {
          coordinates: [number, number][];
        };
      }>;
    }>(routeUrl);

    if (!payload.routes?.length) {
      throw new Error("OSRM returned empty route list");
    }

    const route = payload.routes[0];
    const geometry: RoutePoint[] = route.geometry.coordinates.map((coordinate) => ({
      lat: coordinate[1],
      lng: coordinate[0]
    }));

    return {
      distanceKm: roundTo2(route.distance / 1000),
      durationMin: roundTo2(route.duration / 60),
      geometry,
      source: this.name,
      fallbackUsed: false
    };
  }
}

export const parseOrsGeoJsonRoute = (
  payload: OrsGeoJsonResponse
): {
  distanceKm: number;
  durationMin: number;
  geometry: RoutePoint[];
} | null => {
  const feature = payload.features?.[0];
  const distance = feature?.properties?.summary?.distance;
  const duration = feature?.properties?.summary?.duration;
  const coordinates = feature?.geometry?.coordinates;

  if (
    !distance ||
    !duration ||
    !coordinates?.length ||
    !Number.isFinite(distance) ||
    !Number.isFinite(duration)
  ) {
    return null;
  }

  return {
    distanceKm: roundTo2(distance / 1000),
    durationMin: roundTo2(duration / 60),
    geometry: coordinates.map((coordinate) => ({
      lat: coordinate[1],
      lng: coordinate[0]
    }))
  };
};

class OrsHgvRoutingProvider implements RoutingProvider {
  readonly name = "ors-driving-hgv";
  private readonly endpoint: string;
  private readonly apiKey: string;

  constructor(endpoint: string, apiKey: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  async calculateRoute(input: {
    start: RoutePoint;
    end: RoutePoint;
  }): Promise<RouteResult> {
    const payload = await fetchJson<OrsGeoJsonResponse>(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.apiKey
      },
      body: JSON.stringify({
        coordinates: [
          [input.start.lng, input.start.lat],
          [input.end.lng, input.end.lat]
        ],
        instructions: false
      })
    });
    const parsed = parseOrsGeoJsonRoute(payload);
    if (!parsed) {
      throw new Error("ORS returned incomplete route payload");
    }

    return {
      ...parsed,
      source: this.name,
      fallbackUsed: false
    };
  }
}

class FallbackRoutingProvider implements RoutingProvider {
  readonly name = "fallback-haversine";

  async calculateRoute(input: {
    start: RoutePoint;
    end: RoutePoint;
  }): Promise<RouteResult> {
    const linearDistance = haversineDistanceKm(input.start, input.end);
    const distanceKm = Math.max(
      1,
      linearDistance * DEFAULT_MVP_SETTINGS.roadDistanceMultiplier
    );
    const durationMin = (distanceKm / 62) * 60;

    return {
      distanceKm: roundTo2(distanceKm),
      durationMin: roundTo2(durationMin),
      geometry: [input.start, input.end],
      source: this.name,
      fallbackUsed: true,
      message:
        "Brak trasy z API. Użyto przybliżenia Haversine i mnożnika drogi."
    };
  }
}

const resolveRoutingProviders = (): {
  providers: RoutingProvider[];
  note?: string;
} => {
  const env = getAppEnv();
  const preferredProvider = env.routingProvider;
  const orsApiKey = env.orsApiKey;
  const orsEndpoint = env.orsHgvEndpoint;
  const osrmProvider = new OsrmRoutingProvider(env.osrmEndpoint);
  const providers: RoutingProvider[] = [];
  let note: string | undefined;

  if (preferredProvider === "ors-hgv") {
    if (orsApiKey) {
      providers.push(new OrsHgvRoutingProvider(orsEndpoint, orsApiKey));
    } else {
      note =
        "Brak ORS_API_KEY. Użyto OSRM (profil driving, bez ograniczeń ciężarowych).";
    }
    providers.push(osrmProvider);
    return { providers, note };
  }

  if (preferredProvider !== "osrm") {
    note = `Nieznany ROUTING_PROVIDER="${preferredProvider}". Użyto OSRM.`;
  }

  providers.push(osrmProvider);
  return { providers, note };
};

export const calculateRoute = async (input: {
  start: RoutePoint;
  end: RoutePoint;
}): Promise<RouteResult> => {
  const env = getAppEnv();
  const fallbackProvider = new FallbackRoutingProvider();

  if (!env.enableExternalRouting) {
    return fallbackProvider.calculateRoute(input);
  }

  const { providers, note } = resolveRoutingProviders();
  const providerErrors: string[] = [];

  for (const provider of providers) {
    try {
      const route = await provider.calculateRoute(input);
      if (note) {
        return {
          ...route,
          message: route.message ? `${route.message} ${note}` : note
        };
      }
      return route;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown routing error";
      providerErrors.push(`${provider.name}: ${reason}`);
    }
  }

  const fallback = await fallbackProvider.calculateRoute(input);
  const reason = providerErrors.join(" | ");
  return {
    ...fallback,
    message: `${fallback.message} Powód: ${reason}.`
  };
};

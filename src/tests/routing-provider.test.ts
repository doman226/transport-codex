import { describe, expect, it } from "vitest";
import { parseOrsGeoJsonRoute } from "@/lib/routes/routing-provider";

describe("routing provider helpers", () => {
  it("parses ORS geojson payload", () => {
    const parsed = parseOrsGeoJsonRoute({
      features: [
        {
          properties: {
            summary: {
              distance: 320500,
              duration: 15840
            }
          },
          geometry: {
            coordinates: [
              [16.9252, 52.4064],
              [21.0122, 52.2297],
              [23.1688, 53.1325]
            ]
          }
        }
      ]
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.distanceKm).toBe(320.5);
    expect(parsed?.durationMin).toBe(264);
    expect(parsed?.geometry.length).toBe(3);
  });

  it("returns null for incomplete ORS payload", () => {
    const parsed = parseOrsGeoJsonRoute({
      features: []
    });

    expect(parsed).toBeNull();
  });
});

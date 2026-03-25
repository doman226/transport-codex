import { describe, expect, it } from "vitest";
import { estimateTollCost } from "@/lib/routes/toll-provider";
import { findVehicleById } from "@/lib/vehicles/default-vehicles";

const firanka = findVehicleById("firanka");

describe("toll provider", () => {
  it("calculates domestic toll cost using country rules", () => {
    if (!firanka) {
      throw new Error("firanka config missing");
    }

    const result = estimateTollCost({
      distanceKm: 300,
      transportType: "domestic",
      loadCountry: "PL",
      unloadCountry: "PL",
      vehicle: firanka
    });

    expect(result.source).toBe("rules-country-table");
    expect(result.fallbackUsed).toBe(false);
    expect(result.amountPln).toBe(138);
  });

  it("supports manual toll override", () => {
    if (!firanka) {
      throw new Error("firanka config missing");
    }

    const result = estimateTollCost({
      distanceKm: 300,
      transportType: "domestic",
      loadCountry: "PL",
      unloadCountry: "PL",
      vehicle: firanka,
      manualTollCostPln: 750
    });

    expect(result.source).toBe("manual");
    expect(result.amountPln).toBe(750);
  });

  it("falls back to vehicle toll rates for unsupported countries", () => {
    if (!firanka) {
      throw new Error("firanka config missing");
    }

    const result = estimateTollCost({
      distanceKm: 500,
      transportType: "international",
      loadCountry: "PL",
      unloadCountry: "ES",
      vehicle: firanka
    });

    expect(result.fallbackUsed).toBe(true);
    expect(result.amountPln).toBeGreaterThan(0);
    expect(result.message).toContain("Brak");
  });
});

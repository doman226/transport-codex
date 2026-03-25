import { describe, expect, it } from "vitest";
import { calculateCostBreakdown } from "@/lib/calculators/cost-calculator";
import { findVehicleById } from "@/lib/vehicles/default-vehicles";

const firanka = findVehicleById("firanka");
const niskopodwoziowa = findVehicleById("niskopodwoziowa");

describe("calculateCostBreakdown", () => {
  it("calculates domestic transport cost", () => {
    if (!firanka) {
      throw new Error("firanka config missing");
    }

    const result = calculateCostBreakdown({
      vehicle: firanka,
      transportType: "domestic",
      distanceKm: 300,
      durationMin: 300,
      fuelPricePlnPerLiter: 6.5,
      marginType: "percent",
      marginValue: 10,
      extraOperationalCostPln: 100,
      isOversize: false,
      requiresPermit: false,
      requiresCrane: false,
      exchangeRatePlnToEur: 4.3
    });

    expect(result.fuelCostPln).toBe(585);
    expect(result.tollCostPln).toBe(126);
    expect(result.driverCostPln).toBe(290);
    expect(result.totalNetPln).toBe(1821.6);
    expect(result.totalNetEur).toBe(423.63);
  });

  it("calculates international transport cost with surcharges", () => {
    if (!firanka) {
      throw new Error("firanka config missing");
    }

    const result = calculateCostBreakdown({
      vehicle: firanka,
      transportType: "international",
      distanceKm: 800,
      durationMin: 720,
      fuelPricePlnPerLiter: 6.8,
      marginType: "percent",
      marginValue: 15,
      extraOperationalCostPln: 500,
      isOversize: true,
      requiresPermit: true,
      requiresCrane: true,
      exchangeRatePlnToEur: 4.4
    });

    expect(result.fuelCostPln).toBe(1632);
    expect(result.tollCostPln).toBe(464);
    expect(result.extraCostPln).toBe(2300);
    expect(result.totalNetPln).toBe(7327.8);
    expect(result.totalNetEur).toBe(1665.41);
  });

  it("supports different vehicle cost models", () => {
    if (!niskopodwoziowa) {
      throw new Error("niskopodwoziowa config missing");
    }

    const result = calculateCostBreakdown({
      vehicle: niskopodwoziowa,
      transportType: "domestic",
      distanceKm: 500,
      durationMin: 700,
      fuelPricePlnPerLiter: 6.6,
      marginType: "amount",
      marginValue: 1200,
      extraOperationalCostPln: 0,
      isOversize: false,
      requiresPermit: false,
      requiresCrane: false,
      exchangeRatePlnToEur: 4.2
    });

    expect(result.driverCostPln).toBe(1300);
    expect(result.marginAmountPln).toBe(1200);
    expect(result.totalNetPln).toBe(5384);
    expect(result.totalNetEur).toBe(1281.9);
  });

  it("uses manual toll override when provided", () => {
    if (!firanka) {
      throw new Error("firanka config missing");
    }

    const result = calculateCostBreakdown({
      vehicle: firanka,
      transportType: "domestic",
      distanceKm: 350,
      durationMin: 360,
      fuelPricePlnPerLiter: 6.9,
      tollCostPlnOverride: 910,
      marginType: "percent",
      marginValue: 10,
      extraOperationalCostPln: 0,
      isOversize: false,
      requiresPermit: false,
      requiresCrane: false,
      exchangeRatePlnToEur: 4.3
    });

    expect(result.tollCostPln).toBe(910);
    expect(result.totalNetPln).toBe(2871);
  });
});

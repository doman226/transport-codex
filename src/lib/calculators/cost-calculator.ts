import { DEFAULT_MVP_SETTINGS } from "@/lib/settings/default-settings";
import { clampAtLeastZero, roundTo2 } from "@/lib/shared/math";
import type { CostBreakdown, MarginType, TransportType } from "@/types/quote";
import type { VehicleType } from "@/types/vehicles";

interface CostCalculatorInput {
  vehicle: VehicleType;
  transportType: TransportType;
  distanceKm: number;
  durationMin: number;
  fuelPricePlnPerLiter: number;
  tollCostPlnOverride?: number;
  marginType: MarginType;
  marginValue: number;
  extraOperationalCostPln: number;
  isOversize: boolean;
  requiresPermit: boolean;
  requiresCrane: boolean;
  exchangeRatePlnToEur: number;
}

const calculateDriverCost = (
  vehicle: VehicleType,
  distanceKm: number,
  durationMin: number
): number => {
  if (vehicle.driverCostModel === "perKm") {
    return distanceKm * vehicle.driverCostPerKm;
  }

  if (vehicle.driverCostModel === "daily") {
    const dailyBlocks = Math.max(1, Math.ceil(durationMin / (8 * 60)));
    return dailyBlocks * vehicle.driverCostPerDay;
  }

  const durationHours = durationMin / 60;
  return Math.max(1, durationHours) * vehicle.driverCostPerHour;
};

const calculateMarginAmount = (
  subtotalPln: number,
  marginType: MarginType,
  marginValue: number
): number => {
  if (marginType === "amount") {
    return clampAtLeastZero(marginValue);
  }

  return clampAtLeastZero((subtotalPln * marginValue) / 100);
};

export const calculateCostBreakdown = (
  input: CostCalculatorInput
): CostBreakdown => {
  const distanceKm = clampAtLeastZero(input.distanceKm);
  const fuelCostPln =
    (distanceKm / 100) *
    clampAtLeastZero(input.vehicle.avgFuelConsumptionPer100Km) *
    clampAtLeastZero(input.fuelPricePlnPerLiter);

  const tollRatePerKm =
    input.transportType === "international"
      ? input.vehicle.tollCostPerKmInternational
      : input.vehicle.tollCostPerKmDomestic;
  const tollCostPln =
    typeof input.tollCostPlnOverride === "number" &&
    Number.isFinite(input.tollCostPlnOverride)
      ? clampAtLeastZero(input.tollCostPlnOverride)
      : distanceKm * clampAtLeastZero(tollRatePerKm);

  const driverCostPln = calculateDriverCost(
    input.vehicle,
    distanceKm,
    input.durationMin
  );

  const fixedVehicleCostPln = distanceKm * clampAtLeastZero(input.vehicle.costPerKm);
  const stopCostPln = clampAtLeastZero(input.vehicle.stopCostPln);

  const surchargeCostPln =
    (input.requiresPermit ? DEFAULT_MVP_SETTINGS.permitCostPln : 0) +
    (input.requiresCrane ? DEFAULT_MVP_SETTINGS.craneCostPln : 0) +
    (input.isOversize ? DEFAULT_MVP_SETTINGS.oversizeSurchargePln : 0);

  const extraCostPln =
    clampAtLeastZero(input.extraOperationalCostPln) + surchargeCostPln;

  const subtotalPln =
    fuelCostPln +
    tollCostPln +
    driverCostPln +
    fixedVehicleCostPln +
    stopCostPln +
    extraCostPln;

  const marginAmountPln = calculateMarginAmount(
    subtotalPln,
    input.marginType,
    input.marginValue
  );
  const totalNetPln = subtotalPln + marginAmountPln;
  const safeRate = input.exchangeRatePlnToEur > 0 ? input.exchangeRatePlnToEur : 1;
  const totalNetEur = totalNetPln / safeRate;

  return {
    fuelCostPln: roundTo2(fuelCostPln),
    tollCostPln: roundTo2(tollCostPln),
    driverCostPln: roundTo2(driverCostPln),
    fixedVehicleCostPln: roundTo2(fixedVehicleCostPln),
    stopCostPln: roundTo2(stopCostPln),
    extraCostPln: roundTo2(extraCostPln),
    marginAmountPln: roundTo2(marginAmountPln),
    subtotalPln: roundTo2(subtotalPln),
    totalNetPln: roundTo2(totalNetPln),
    totalNetEur: roundTo2(totalNetEur)
  };
};

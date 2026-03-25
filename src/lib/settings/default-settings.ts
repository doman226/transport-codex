export interface MvpSettings {
  fallbackFuelPricePlnPerLiter: number;
  fallbackPlnToEurRate: number;
  permitCostPln: number;
  oversizeSurchargePln: number;
  craneCostPln: number;
  roadDistanceMultiplier: number;
}

// Sample defaults for MVP. Values should be adjusted in admin settings later.
export const DEFAULT_MVP_SETTINGS: MvpSettings = {
  fallbackFuelPricePlnPerLiter: 6.85,
  fallbackPlnToEurRate: 4.35,
  permitCostPln: 500,
  oversizeSurchargePln: 700,
  craneCostPln: 600,
  roadDistanceMultiplier: 1.22
};

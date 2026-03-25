export type DriverCostModel = "hourly" | "daily" | "perKm";

export interface VehicleType {
  id: string;
  name: string;
  payloadKg: number;
  maxLengthM: number;
  avgFuelConsumptionPer100Km: number;
  costPerKm: number;
  driverCostPerHour: number;
  driverCostPerDay: number;
  driverCostPerKm: number;
  driverCostModel: DriverCostModel;
  avgOperationalSpeedKmh: number;
  tollCostPerKmDomestic: number;
  tollCostPerKmInternational: number;
  stopCostPln: number;
  defaultMarginPercent: number;
  active: boolean;
}

import type { VehicleType } from "@/types/vehicles";

export type TransportType = "domestic" | "international";
export type OfferCurrency = "PLN" | "EUR";
export type MarginType = "percent" | "amount";
export type FuelType = "on" | "pb95";

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: RoutePoint[];
  source: string;
  fallbackUsed: boolean;
  message?: string;
}

export interface GeocodedAddress {
  address: string;
  country: string;
  lat: number;
  lng: number;
  source: string;
  fallbackUsed: boolean;
  message?: string;
}

export interface FuelPriceResult {
  fuelType: FuelType;
  fuelPricePlnPerLiter: number;
  source: string;
  date: string;
  fallbackUsed: boolean;
  message?: string;
}

export interface CurrencyRateResult {
  plnToEurRate: number;
  source: string;
  date: string;
  fallbackUsed: boolean;
  message?: string;
}

export interface TollCostResult {
  amountPln: number;
  source: string;
  date: string;
  fallbackUsed: boolean;
  message?: string;
}

export interface QuoteInput {
  customerName?: string;
  loadAddress: string;
  unloadAddress: string;
  loadCountry: string;
  unloadCountry: string;
  transportType: TransportType;
  vehicleTypeId: string;
  loadWeightKg: number;
  loadLengthM: number;
  itemsCount: number;
  isOversize: boolean;
  requiresPermit: boolean;
  requiresCrane: boolean;
  marginType: MarginType;
  marginValue: number;
  fuelType: FuelType;
  extraOperationalCostPln: number;
  manualDistanceKm?: number;
  manualTollCostPln?: number;
  manualFuelPricePln?: number;
  manualExchangeRate?: number;
}

export interface CostBreakdown {
  fuelCostPln: number;
  tollCostPln: number;
  driverCostPln: number;
  fixedVehicleCostPln: number;
  stopCostPln: number;
  extraCostPln: number;
  marginAmountPln: number;
  subtotalPln: number;
  totalNetPln: number;
  totalNetEur: number;
}

export interface QuoteWarnings {
  vehicleLengthExceeded: boolean;
  vehiclePayloadExceeded: boolean;
}

export interface QuoteResult {
  createdAt: string;
  vehicle: VehicleType;
  input: QuoteInput;
  route: RouteResult;
  loadLocation: GeocodedAddress;
  unloadLocation: GeocodedAddress;
  fuel: FuelPriceResult;
  currency: CurrencyRateResult;
  toll: TollCostResult;
  breakdown: CostBreakdown;
  warnings: QuoteWarnings;
}

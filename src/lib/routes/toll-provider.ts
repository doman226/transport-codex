import { roundTo2 } from "@/lib/shared/math";
import type { TransportType } from "@/types/quote";
import type { VehicleType } from "@/types/vehicles";

export interface TollCostResult {
  amountPln: number;
  source: string;
  fallbackUsed: boolean;
  date: string;
  message?: string;
}

const COUNTRY_TOLL_RATES_PER_KM: Record<
  string,
  { domestic: number; international: number }
> = {
  PL: { domestic: 0.46, international: 0.54 },
  DE: { domestic: 0.86, international: 0.94 },
  CZ: { domestic: 0.74, international: 0.81 },
  SK: { domestic: 0.68, international: 0.75 },
  LT: { domestic: 0.59, international: 0.67 },
  NL: { domestic: 0.71, international: 0.79 }
};

const VEHICLE_TOLL_FACTOR: Record<string, number> = {
  firanka: 1,
  platforma: 1.06,
  niskopodwoziowa: 1.28,
  "zestaw-przestrzenny": 1.08,
  solowka: 0.74,
  specjalny: 1.25
};

const splitDistanceForInternational = (distanceKm: number): [number, number] => {
  // Heuristic split for MVP when detailed per-country route geometry is unavailable.
  const firstLeg = distanceKm * 0.42;
  const secondLeg = distanceKm - firstLeg;
  return [firstLeg, secondLeg];
};

const getCountryRate = (
  country: string,
  transportType: TransportType
): number | null => {
  const normalizedCountry = country.trim().toUpperCase();
  const countryRates = COUNTRY_TOLL_RATES_PER_KM[normalizedCountry];
  if (!countryRates) {
    return null;
  }
  return transportType === "international"
    ? countryRates.international
    : countryRates.domestic;
};

export const estimateTollCost = (input: {
  distanceKm: number;
  transportType: TransportType;
  loadCountry: string;
  unloadCountry: string;
  vehicle: VehicleType;
  manualTollCostPln?: number;
}): TollCostResult => {
  if (
    typeof input.manualTollCostPln === "number" &&
    Number.isFinite(input.manualTollCostPln)
  ) {
    return {
      amountPln: roundTo2(Math.max(0, input.manualTollCostPln)),
      source: "manual",
      fallbackUsed: false,
      date: new Date().toISOString()
    };
  }

  const vehicleFactor =
    VEHICLE_TOLL_FACTOR[input.vehicle.id] ??
    (input.transportType === "international" ? 1.12 : 1);

  const loadCountryRate = getCountryRate(input.loadCountry, input.transportType);
  const unloadCountryRate = getCountryRate(input.unloadCountry, input.transportType);

  const vehicleFallbackRate =
    input.transportType === "international"
      ? input.vehicle.tollCostPerKmInternational
      : input.vehicle.tollCostPerKmDomestic;

  let amountPln = 0;
  let message: string | undefined;
  let fallbackUsed = false;

  if (
    input.transportType === "domestic" ||
    input.loadCountry.trim().toUpperCase() === input.unloadCountry.trim().toUpperCase()
  ) {
    const ratePerKm = loadCountryRate ?? vehicleFallbackRate;
    if (loadCountryRate === null) {
      fallbackUsed = true;
      message = `Brak stawek opłat drogowych dla kraju ${input.loadCountry.toUpperCase()}. Użyto stawek pojazdu.`;
    }
    amountPln = input.distanceKm * ratePerKm * vehicleFactor;
  } else {
    const [firstLegKm, secondLegKm] = splitDistanceForInternational(input.distanceKm);
    const loadRate = loadCountryRate ?? vehicleFallbackRate;
    const unloadRate = unloadCountryRate ?? vehicleFallbackRate;
    if (loadCountryRate === null || unloadCountryRate === null) {
      fallbackUsed = true;
      message =
        "Brak pełnych stawek opłat drogowych dla części krajów. Użyto stawek pojazdu dla brakujących danych.";
    }
    amountPln = firstLegKm * loadRate * vehicleFactor + secondLegKm * unloadRate * vehicleFactor;
  }

  return {
    amountPln: roundTo2(Math.max(0, amountPln)),
    source: "rules-country-table",
    fallbackUsed,
    date: new Date().toISOString(),
    message
  };
};

import { getAppEnv } from "@/lib/config/env";
import { getPlnToEurRate } from "@/lib/currencies/currency-provider";
import { fetchJson, fetchText, HttpRequestError } from "@/lib/http/http-client";
import { DEFAULT_MVP_SETTINGS } from "@/lib/settings/default-settings";
import { roundTo2 } from "@/lib/shared/math";
import {
  minutesToMs,
  readRuntimeCache,
  writeRuntimeCache
} from "@/lib/shared/runtime-cache";
import type { FuelPriceResult } from "@/types/quote";

const PUBLIC_FUEL_SOURCE_URL = "https://www.fuel-prices.eu/Poland/";
const FUEL_CACHE_KEY = "fuel:diesel-pln";

const normalizeFuelReason = (reason?: string): string | undefined => {
  if (!reason) {
    return undefined;
  }

  if (reason.includes("FUEL_API_ENDPOINT")) {
    return "brak skonfigurowanego endpointu API paliwa";
  }

  if (reason.startsWith("Fuel API status")) {
    return `błąd dostawcy paliwa (${reason.replace("Fuel API status ", "HTTP ")})`;
  }

  if (reason.includes("dieselPricePlnPerLiter")) {
    return "niepoprawny format odpowiedzi dostawcy paliwa";
  }

  if (reason.includes("Unknown fuel error")) {
    return "nieznany błąd dostawcy paliwa";
  }

  return reason;
};

const mapFuelError = (error: unknown): string => {
  if (error instanceof HttpRequestError && typeof error.status === "number") {
    return `Fuel API status ${error.status}`;
  }

  if (error instanceof HttpRequestError && error.code === "timeout") {
    return "Fuel API timeout";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown fuel error";
};

export const fallbackFuelPrice = (
  reason?: string,
  overridePrice?: number
): FuelPriceResult => {
  const normalizedReason = normalizeFuelReason(reason);

  return {
    dieselPricePlnPerLiter: roundTo2(
      overridePrice ?? DEFAULT_MVP_SETTINGS.fallbackFuelPricePlnPerLiter
    ),
    source: "fallback-static",
    date: new Date().toISOString(),
    fallbackUsed: true,
    message: normalizedReason
      ? `Cena paliwa fallback. Powód: ${normalizedReason}.`
      : "Cena paliwa fallback (wartość przykładowa)."
  };
};

const parseDateFromFuelPage = (html: string): string => {
  const updatedMatch = html.match(/UPDATED:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);

  if (updatedMatch?.[1]) {
    return updatedMatch[1];
  }

  const fallbackDateMatch = html.match(/Updated:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);

  return fallbackDateMatch?.[1] ?? new Date().toISOString().slice(0, 10);
};

const extractFirstPriceNumber = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseDieselEurPerLiter = (html: string): number | null => {
  const dieselSection = html.match(/DIESEL[\s\S]{0,700}/i)?.[0];
  if (!dieselSection) {
    return null;
  }

  const euroMatch = dieselSection.match(
    /(?:€|&euro;|&#8364;)\s*([0-9]+(?:[.,][0-9]+)?)/i
  );
  const euroValue = extractFirstPriceNumber(euroMatch?.[1]);
  if (euroValue) {
    return euroValue;
  }

  const plainMatch = dieselSection.match(/([0-9]+(?:[.,][0-9]+)?)\s*(?:EUR|EURO)/i);
  return extractFirstPriceNumber(plainMatch?.[1]);
};

const fetchFuelFromCustomEndpoint = async (
  endpoint: string
): Promise<FuelPriceResult> => {
  const payload = await fetchJson<{
    dieselPricePlnPerLiter?: number;
    date?: string;
  }>(endpoint);

  if (!payload.dieselPricePlnPerLiter) {
    throw new Error("Fuel API payload is missing dieselPricePlnPerLiter");
  }

  return {
    dieselPricePlnPerLiter: roundTo2(payload.dieselPricePlnPerLiter),
    source: "external-fuel-api",
    date: payload.date ?? new Date().toISOString(),
    fallbackUsed: false
  };
};

const fetchFuelFromPublicFeed = async (): Promise<FuelPriceResult> => {
  const html = await fetchText(PUBLIC_FUEL_SOURCE_URL);
  const dieselEurPerLiter = parseDieselEurPerLiter(html);
  if (!dieselEurPerLiter) {
    throw new Error("Fuel API payload is missing dieselPricePlnPerLiter");
  }

  const rate = await getPlnToEurRate();
  const dieselPricePlnPerLiter = roundTo2(dieselEurPerLiter * rate.plnToEurRate);
  const date = parseDateFromFuelPage(html);

  return {
    dieselPricePlnPerLiter,
    source: `fuel-prices-eu+${rate.source}`,
    date,
    fallbackUsed: false,
    message: rate.fallbackUsed
      ? "Cena paliwa z internetu; przeliczenie EUR->PLN wykonano kursem fallback."
      : undefined
  };
};

const fetchFuelFromExternalSource = async (): Promise<FuelPriceResult> => {
  const endpoint = getAppEnv().fuelApiEndpoint;

  if (endpoint && endpoint.trim().length > 0) {
    return fetchFuelFromCustomEndpoint(endpoint);
  }

  return fetchFuelFromPublicFeed();
};

const getFuelTtlMs = (): number =>
  minutesToMs(getAppEnv().fuelCacheTtlMin, 6 * 60);

export const getDieselPrice = async (
  manualPrice?: number
): Promise<FuelPriceResult> => {
  if (typeof manualPrice === "number" && Number.isFinite(manualPrice)) {
    return {
      dieselPricePlnPerLiter: roundTo2(manualPrice),
      source: "manual",
      date: new Date().toISOString(),
      fallbackUsed: false
    };
  }

  if (!getAppEnv().enableExternalFuel) {
    return fallbackFuelPrice();
  }

  const cachedFuel = readRuntimeCache<FuelPriceResult>(FUEL_CACHE_KEY);
  if (cachedFuel) {
    return {
      ...cachedFuel,
      source: `${cachedFuel.source}-cache`
    };
  }

  try {
    const fetchedFuel = await fetchFuelFromExternalSource();
    writeRuntimeCache(FUEL_CACHE_KEY, fetchedFuel, getFuelTtlMs());
    return fetchedFuel;
  } catch (error) {
    const reason = mapFuelError(error);
    return fallbackFuelPrice(reason);
  }
};

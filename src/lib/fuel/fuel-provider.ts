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
import type { FuelPriceResult, FuelType } from "@/types/quote";

const PUBLIC_FUEL_SOURCE_URL = "https://www.fuel-prices.eu/Poland/";
const FUEL_CACHE_KEY_PREFIX = "fuel:pln";
const PB95_FALLBACK_DELTA_PLN = 0.35;

const FUEL_LABELS: Record<FuelType, string> = {
  on: "ON",
  pb95: "PB95"
};

const normalizeFuelReason = (reason?: string): string | undefined => {
  if (!reason) {
    return undefined;
  }

  if (reason.includes("FUEL_API_ENDPOINT")) {
    return "brak skonfigurowanego endpointu API paliwa";
  }

  if (reason.startsWith("Fuel API status")) {
    return `blad dostawcy paliwa (${reason.replace("Fuel API status ", "HTTP ")})`;
  }

  if (reason.includes("fuel price")) {
    return "niepoprawny format odpowiedzi dostawcy paliwa";
  }

  if (reason.includes("Unknown fuel error")) {
    return "nieznany blad dostawcy paliwa";
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

const getFallbackFuelPriceByType = (fuelType: FuelType): number => {
  if (fuelType === "pb95") {
    return DEFAULT_MVP_SETTINGS.fallbackFuelPricePlnPerLiter + PB95_FALLBACK_DELTA_PLN;
  }
  return DEFAULT_MVP_SETTINGS.fallbackFuelPricePlnPerLiter;
};

export const fallbackFuelPrice = (
  fuelType: FuelType,
  reason?: string,
  overridePrice?: number
): FuelPriceResult => {
  const normalizedReason = normalizeFuelReason(reason);

  return {
    fuelType,
    fuelPricePlnPerLiter: roundTo2(
      overridePrice ?? getFallbackFuelPriceByType(fuelType)
    ),
    source: "fallback-static",
    date: new Date().toISOString(),
    fallbackUsed: true,
    message: normalizedReason
      ? `Cena paliwa ${FUEL_LABELS[fuelType]} fallback. Powod: ${normalizedReason}.`
      : `Cena paliwa ${FUEL_LABELS[fuelType]} fallback (wartosc przykladowa).`
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

const findPriceByKeywords = (html: string, keywords: string[]): number | null => {
  for (const keyword of keywords) {
    const section = html.match(new RegExp(`${keyword}[\\s\\S]{0,900}`, "i"))?.[0];
    if (!section) {
      continue;
    }

    const euroMatch = section.match(
      /(?:€|&euro;|&#8364;)\s*([0-9]+(?:[.,][0-9]+)?)/i
    );
    const euroValue = extractFirstPriceNumber(euroMatch?.[1]);
    if (euroValue) {
      return euroValue;
    }

    const plainMatch = section.match(
      /([0-9]+(?:[.,][0-9]+)?)\s*(?:EUR|EURO)/i
    );
    const plainValue = extractFirstPriceNumber(plainMatch?.[1]);
    if (plainValue) {
      return plainValue;
    }
  }

  return null;
};

export const parseFuelEurPerLiter = (
  html: string,
  fuelType: FuelType
): number | null => {
  if (fuelType === "on") {
    return findPriceByKeywords(html, ["DIESEL", "B7"]);
  }

  return findPriceByKeywords(html, [
    "PREMIUM UNLEADED 95",
    "UNLEADED 95",
    "GASOLINE 95",
    "PETROL 95",
    "PB95"
  ]);
};

interface ExternalFuelPayload {
  fuelPricePlnPerLiter?: number;
  dieselPricePlnPerLiter?: number;
  onPricePlnPerLiter?: number;
  pb95PricePlnPerLiter?: number;
  date?: string;
}

const resolveExternalFuelPayloadPrice = (
  payload: ExternalFuelPayload,
  fuelType: FuelType
): number | undefined => {
  if (fuelType === "on") {
    return (
      payload.onPricePlnPerLiter ??
      payload.dieselPricePlnPerLiter ??
      payload.fuelPricePlnPerLiter
    );
  }

  return payload.pb95PricePlnPerLiter ?? payload.fuelPricePlnPerLiter;
};

const fetchFuelFromCustomEndpoint = async (input: {
  endpoint: string;
  fuelType: FuelType;
}): Promise<FuelPriceResult> => {
  const payload = await fetchJson<ExternalFuelPayload>(input.endpoint);
  const price = resolveExternalFuelPayloadPrice(payload, input.fuelType);

  if (!price) {
    throw new Error("Fuel API payload is missing fuel price");
  }

  return {
    fuelType: input.fuelType,
    fuelPricePlnPerLiter: roundTo2(price),
    source: "external-fuel-api",
    date: payload.date ?? new Date().toISOString(),
    fallbackUsed: false
  };
};

const fetchFuelFromPublicFeed = async (
  fuelType: FuelType
): Promise<FuelPriceResult> => {
  const html = await fetchText(PUBLIC_FUEL_SOURCE_URL);
  const fuelEurPerLiter = parseFuelEurPerLiter(html, fuelType);
  if (!fuelEurPerLiter) {
    throw new Error("Fuel API payload is missing fuel price");
  }

  const rate = await getPlnToEurRate();
  const fuelPricePlnPerLiter = roundTo2(fuelEurPerLiter * rate.plnToEurRate);
  const date = parseDateFromFuelPage(html);

  return {
    fuelType,
    fuelPricePlnPerLiter,
    source: `fuel-prices-eu+${rate.source}`,
    date,
    fallbackUsed: false,
    message: rate.fallbackUsed
      ? "Cena paliwa z internetu; przeliczenie EUR->PLN wykonano kursem fallback."
      : undefined
  };
};

const fetchFuelFromExternalSource = async (
  fuelType: FuelType
): Promise<FuelPriceResult> => {
  const endpoint = getAppEnv().fuelApiEndpoint;

  if (endpoint && endpoint.trim().length > 0) {
    return fetchFuelFromCustomEndpoint({ endpoint, fuelType });
  }

  return fetchFuelFromPublicFeed(fuelType);
};

const getFuelTtlMs = (): number =>
  minutesToMs(getAppEnv().fuelCacheTtlMin, 6 * 60);

const buildFuelCacheKey = (fuelType: FuelType): string =>
  `${FUEL_CACHE_KEY_PREFIX}:${fuelType}`;

export const getFuelPrice = async (input?: {
  fuelType?: FuelType;
  manualPrice?: number;
}): Promise<FuelPriceResult> => {
  const fuelType = input?.fuelType ?? "on";
  const manualPrice = input?.manualPrice;

  if (typeof manualPrice === "number" && Number.isFinite(manualPrice)) {
    return {
      fuelType,
      fuelPricePlnPerLiter: roundTo2(manualPrice),
      source: "manual",
      date: new Date().toISOString(),
      fallbackUsed: false
    };
  }

  if (!getAppEnv().enableExternalFuel) {
    return fallbackFuelPrice(fuelType);
  }

  const cachedFuel = readRuntimeCache<FuelPriceResult>(buildFuelCacheKey(fuelType));
  if (cachedFuel) {
    return {
      ...cachedFuel,
      source: `${cachedFuel.source}-cache`
    };
  }

  try {
    const fetchedFuel = await fetchFuelFromExternalSource(fuelType);
    writeRuntimeCache(buildFuelCacheKey(fuelType), fetchedFuel, getFuelTtlMs());
    return fetchedFuel;
  } catch (error) {
    const reason = mapFuelError(error);
    return fallbackFuelPrice(fuelType, reason);
  }
};

// Backward compatibility for existing imports/tests.
export const getDieselPrice = async (
  manualPrice?: number
): Promise<FuelPriceResult> =>
  getFuelPrice({ fuelType: "on", manualPrice });

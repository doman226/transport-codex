import { getAppEnv } from "@/lib/config/env";
import { fetchJson, HttpRequestError } from "@/lib/http/http-client";
import { DEFAULT_MVP_SETTINGS } from "@/lib/settings/default-settings";
import { roundTo2 } from "@/lib/shared/math";
import {
  minutesToMs,
  readRuntimeCache,
  writeRuntimeCache
} from "@/lib/shared/runtime-cache";
import type { CurrencyRateResult } from "@/types/quote";

const CURRENCY_CACHE_KEY = "currency:pln-eur";

const normalizeCurrencyReason = (reason?: string): string | undefined => {
  if (!reason) {
    return undefined;
  }

  if (reason.startsWith("Currency API status")) {
    return `błąd dostawcy kursów (${reason.replace("Currency API status ", "HTTP ")})`;
  }

  if (reason.includes("missing rates")) {
    return "niepoprawny format odpowiedzi dostawcy kursów";
  }

  return reason;
};

const mapCurrencyError = (error: unknown): string => {
  if (error instanceof HttpRequestError && typeof error.status === "number") {
    return `Currency API status ${error.status}`;
  }

  if (error instanceof HttpRequestError && error.code === "timeout") {
    return "Currency API timeout";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown currency error";
};

export const fallbackCurrencyRate = (
  reason?: string,
  overrideRate?: number
): CurrencyRateResult => ({
  plnToEurRate: roundTo2(overrideRate ?? DEFAULT_MVP_SETTINGS.fallbackPlnToEurRate),
  source: "fallback-static",
  date: new Date().toISOString(),
  fallbackUsed: true,
  message: normalizeCurrencyReason(reason)
    ? `Kurs waluty fallback. Powód: ${normalizeCurrencyReason(reason)}.`
    : "Kurs waluty fallback (wartość przykładowa)."
});

const fetchRateFromNbp = async (): Promise<CurrencyRateResult> => {
  const env = getAppEnv();
  const payload = await fetchJson<{
    rates?: Array<{ effectiveDate: string; mid: number }>;
  }>(env.currencyApiEndpoint);

  if (!payload.rates?.length) {
    throw new Error("Currency payload is missing rates");
  }

  const rate = payload.rates[0];
  return {
    plnToEurRate: roundTo2(rate.mid),
    source: "nbp",
    date: rate.effectiveDate,
    fallbackUsed: false
  };
};

const getCurrencyTtlMs = (): number =>
  minutesToMs(getAppEnv().currencyCacheTtlMin, 12 * 60);

export const getPlnToEurRate = async (
  manualRate?: number
): Promise<CurrencyRateResult> => {
  if (typeof manualRate === "number" && Number.isFinite(manualRate)) {
    return {
      plnToEurRate: roundTo2(manualRate),
      source: "manual",
      date: new Date().toISOString(),
      fallbackUsed: false
    };
  }

  if (!getAppEnv().enableExternalCurrency) {
    return fallbackCurrencyRate();
  }

  const cachedRate = readRuntimeCache<CurrencyRateResult>(CURRENCY_CACHE_KEY);
  if (cachedRate) {
    return {
      ...cachedRate,
      source: `${cachedRate.source}-cache`
    };
  }

  try {
    const fetchedRate = await fetchRateFromNbp();
    writeRuntimeCache(CURRENCY_CACHE_KEY, fetchedRate, getCurrencyTtlMs());
    return fetchedRate;
  } catch (error) {
    const reason = mapCurrencyError(error);
    return fallbackCurrencyRate(reason);
  }
};

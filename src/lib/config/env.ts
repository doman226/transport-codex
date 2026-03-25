import { z } from "zod";

type RoutingProviderType = "osrm" | "ors-hgv";

export interface AppEnv {
  nodeEnv: "development" | "test" | "production";
  enableExternalGeocoding: boolean;
  enableExternalRouting: boolean;
  enableExternalCurrency: boolean;
  enableExternalFuel: boolean;
  nominatimEndpoint: string;
  osrmEndpoint: string;
  routingProvider: RoutingProviderType;
  orsHgvEndpoint: string;
  orsApiKey?: string;
  currencyApiEndpoint: string;
  currencyCacheTtlMin: number;
  fuelCacheTtlMin: number;
  fuelApiEndpoint?: string;
  httpTimeoutMs: number;
  httpRetries: number;
  healthcheckWithDb: boolean;
}

const rawEnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  ENABLE_EXTERNAL_GEOCODING: z.string().optional(),
  ENABLE_EXTERNAL_ROUTING: z.string().optional(),
  ENABLE_EXTERNAL_CURRENCY: z.string().optional(),
  ENABLE_EXTERNAL_FUEL: z.string().optional(),
  NOMINATIM_ENDPOINT: z.string().optional(),
  OSRM_ENDPOINT: z.string().optional(),
  ROUTING_PROVIDER: z.string().optional(),
  ORS_HGV_ENDPOINT: z.string().optional(),
  ORS_API_KEY: z.string().optional(),
  CURRENCY_API_ENDPOINT: z.string().optional(),
  CURRENCY_CACHE_TTL_MIN: z.string().optional(),
  FUEL_CACHE_TTL_MIN: z.string().optional(),
  FUEL_API_ENDPOINT: z.string().optional(),
  HTTP_TIMEOUT_MS: z.string().optional(),
  HTTP_RETRIES: z.string().optional(),
  HEALTHCHECK_WITH_DB: z.string().optional()
});

const safeTrim = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const parseBoolean = (
  rawValue: string | undefined,
  defaultValue: boolean,
  warnings: string[],
  key: string
): boolean => {
  if (!rawValue) {
    return defaultValue;
  }

  const normalized = rawValue.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }

  warnings.push(
    `Nieprawidłowa wartość ${key}="${rawValue}". Użyto domyślnej: ${String(defaultValue)}.`
  );
  return defaultValue;
};

const parsePositiveInt = (
  rawValue: string | undefined,
  defaultValue: number,
  warnings: string[],
  key: string
): number => {
  if (!rawValue) {
    return defaultValue;
  }

  const parsed = Number(rawValue);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }

  warnings.push(
    `Nieprawidłowa wartość ${key}="${rawValue}". Użyto domyślnej: ${defaultValue}.`
  );
  return defaultValue;
};

const parseRoutingProvider = (
  rawValue: string | undefined,
  warnings: string[]
): RoutingProviderType => {
  const normalized = rawValue?.trim().toLowerCase();

  if (!normalized) {
    return "ors-hgv";
  }

  if (normalized === "osrm" || normalized === "ors-hgv") {
    return normalized;
  }

  warnings.push(
    `Nieznany ROUTING_PROVIDER="${rawValue}". Użyto wartości domyślnej: ors-hgv.`
  );
  return "ors-hgv";
};

const parseNodeEnv = (
  rawValue: string | undefined
): AppEnv["nodeEnv"] => {
  if (rawValue === "production" || rawValue === "test") {
    return rawValue;
  }
  return "development";
};

export interface EnvValidationResult {
  env: AppEnv;
  warnings: string[];
}

export const getEnvValidationResult = (): EnvValidationResult => {
  const raw = rawEnvSchema.parse(process.env);
  const warnings: string[] = [];

  const env: AppEnv = {
    nodeEnv: parseNodeEnv(raw.NODE_ENV),
    enableExternalGeocoding: parseBoolean(
      raw.ENABLE_EXTERNAL_GEOCODING,
      false,
      warnings,
      "ENABLE_EXTERNAL_GEOCODING"
    ),
    enableExternalRouting: parseBoolean(
      raw.ENABLE_EXTERNAL_ROUTING,
      false,
      warnings,
      "ENABLE_EXTERNAL_ROUTING"
    ),
    enableExternalCurrency: parseBoolean(
      raw.ENABLE_EXTERNAL_CURRENCY,
      false,
      warnings,
      "ENABLE_EXTERNAL_CURRENCY"
    ),
    enableExternalFuel: parseBoolean(
      raw.ENABLE_EXTERNAL_FUEL,
      false,
      warnings,
      "ENABLE_EXTERNAL_FUEL"
    ),
    nominatimEndpoint:
      safeTrim(raw.NOMINATIM_ENDPOINT) ??
      "https://nominatim.openstreetmap.org/search",
    osrmEndpoint:
      safeTrim(raw.OSRM_ENDPOINT) ?? "https://router.project-osrm.org/route/v1/driving",
    routingProvider: parseRoutingProvider(raw.ROUTING_PROVIDER, warnings),
    orsHgvEndpoint:
      safeTrim(raw.ORS_HGV_ENDPOINT) ??
      "https://api.openrouteservice.org/v2/directions/driving-hgv/geojson",
    orsApiKey: safeTrim(raw.ORS_API_KEY),
    currencyApiEndpoint:
      safeTrim(raw.CURRENCY_API_ENDPOINT) ??
      "https://api.nbp.pl/api/exchangerates/rates/A/EUR/?format=json",
    currencyCacheTtlMin: parsePositiveInt(
      raw.CURRENCY_CACHE_TTL_MIN,
      720,
      warnings,
      "CURRENCY_CACHE_TTL_MIN"
    ),
    fuelCacheTtlMin: parsePositiveInt(
      raw.FUEL_CACHE_TTL_MIN,
      360,
      warnings,
      "FUEL_CACHE_TTL_MIN"
    ),
    fuelApiEndpoint: safeTrim(raw.FUEL_API_ENDPOINT),
    httpTimeoutMs: parsePositiveInt(raw.HTTP_TIMEOUT_MS, 12000, warnings, "HTTP_TIMEOUT_MS"),
    httpRetries: parsePositiveInt(raw.HTTP_RETRIES, 1, warnings, "HTTP_RETRIES"),
    healthcheckWithDb: parseBoolean(
      raw.HEALTHCHECK_WITH_DB,
      false,
      warnings,
      "HEALTHCHECK_WITH_DB"
    )
  };

  if (
    env.enableExternalRouting &&
    env.routingProvider === "ors-hgv" &&
    !env.orsApiKey
  ) {
    warnings.push(
      "ROUTING_PROVIDER=ors-hgv bez ORS_API_KEY. Routing przełączy się na OSRM fallback."
    );
  }

  if (env.enableExternalFuel && !env.fuelApiEndpoint) {
    warnings.push(
      "ENABLE_EXTERNAL_FUEL=true bez FUEL_API_ENDPOINT. Użyte będzie publiczne źródło fuel-prices.eu."
    );
  }

  return { env, warnings };
};

export const getAppEnv = (): AppEnv => getEnvValidationResult().env;

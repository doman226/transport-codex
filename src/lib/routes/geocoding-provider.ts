import { getAppEnv } from "@/lib/config/env";
import { fetchJson } from "@/lib/http/http-client";
import type { AddressSuggestion } from "@/types/geocoding";
import type { GeocodedAddress } from "@/types/quote";

interface GeocodingProvider {
  geocode(input: { address: string; country: string }): Promise<GeocodedAddress>;
}

interface CityCenter {
  lat: number;
  lng: number;
  country: string;
}

const COUNTRY_CENTERS: Record<string, { lat: number; lng: number }> = {
  PL: { lat: 52.05, lng: 19.4 },
  DE: { lat: 51.2, lng: 10.45 },
  CZ: { lat: 49.82, lng: 15.47 },
  SK: { lat: 48.7, lng: 19.7 },
  LT: { lat: 55.17, lng: 23.88 },
  NL: { lat: 52.13, lng: 5.29 },
  RO: { lat: 45.94, lng: 24.97 }
};

const COUNTRY_NAMES_BY_CODE: Record<string, string> = {
  PL: "Polska",
  DE: "Niemcy",
  CZ: "Czechy",
  SK: "Slowacja",
  LT: "Litwa",
  NL: "Holandia",
  RO: "Rumunia"
};

const CITY_CENTERS: Record<string, CityCenter> = {
  warszawa: { lat: 52.2297, lng: 21.0122, country: "PL" },
  poznan: { lat: 52.4064, lng: 16.9252, country: "PL" },
  bialystok: { lat: 53.1325, lng: 23.1688, country: "PL" },
  krakow: { lat: 50.0647, lng: 19.945, country: "PL" },
  lodz: { lat: 51.7592, lng: 19.456, country: "PL" },
  wroclaw: { lat: 51.1079, lng: 17.0385, country: "PL" },
  gdansk: { lat: 54.352, lng: 18.6466, country: "PL" },
  szczecin: { lat: 53.4285, lng: 14.5528, country: "PL" },
  lublin: { lat: 51.2465, lng: 22.5684, country: "PL" },
  katowice: { lat: 50.2649, lng: 19.0238, country: "PL" },
  rzeszow: { lat: 50.0412, lng: 21.9991, country: "PL" },
  bydgoszcz: { lat: 53.1235, lng: 18.0084, country: "PL" },
  torun: { lat: 53.0138, lng: 18.5984, country: "PL" },
  opole: { lat: 50.6751, lng: 17.9213, country: "PL" },
  kielce: { lat: 50.8661, lng: 20.6286, country: "PL" },
  olsztyn: { lat: 53.7784, lng: 20.48, country: "PL" },
  "zielona gora": { lat: 51.9356, lng: 15.5062, country: "PL" },
  "gorzow wielkopolski": { lat: 52.7368, lng: 15.2288, country: "PL" },
  hamburg: { lat: 53.5511, lng: 9.9937, country: "DE" },
  berlin: { lat: 52.52, lng: 13.405, country: "DE" },
  prague: { lat: 50.0755, lng: 14.4378, country: "CZ" },
  praha: { lat: 50.0755, lng: 14.4378, country: "CZ" },
  bratislava: { lat: 48.1486, lng: 17.1077, country: "SK" },
  vilnius: { lat: 54.6872, lng: 25.2797, country: "LT" },
  amsterdam: { lat: 52.3676, lng: 4.9041, country: "NL" },
  bucharest: { lat: 44.4268, lng: 26.1025, country: "RO" },
  bukareszt: { lat: 44.4268, lng: 26.1025, country: "RO" },
  "cluj napoca": { lat: 46.7712, lng: 23.6236, country: "RO" },
  konstanca: { lat: 44.1598, lng: 28.6348, country: "RO" }
};

const CITY_DISPLAY_NAMES: Record<string, string> = {
  warszawa: "Warszawa",
  poznan: "Poznan",
  bialystok: "Bialystok",
  krakow: "Krakow",
  lodz: "Lodz",
  wroclaw: "Wroclaw",
  gdansk: "Gdansk",
  szczecin: "Szczecin",
  lublin: "Lublin",
  katowice: "Katowice",
  rzeszow: "Rzeszow",
  bydgoszcz: "Bydgoszcz",
  torun: "Torun",
  opole: "Opole",
  kielce: "Kielce",
  olsztyn: "Olsztyn",
  "zielona gora": "Zielona Gora",
  "gorzow wielkopolski": "Gorzow Wielkopolski",
  hamburg: "Hamburg",
  berlin: "Berlin",
  prague: "Praga",
  praha: "Praga",
  bratislava: "Bratislava",
  vilnius: "Vilnius",
  amsterdam: "Amsterdam",
  bucharest: "Bukareszt",
  bukareszt: "Bukareszt",
  "cluj napoca": "Cluj-Napoca",
  konstanca: "Konstanca"
};

const COUNTRY_ALIASES: Record<string, string> = {
  pl: "PL",
  polska: "PL",
  poland: "PL",
  de: "DE",
  niemcy: "DE",
  germany: "DE",
  deutschland: "DE",
  cz: "CZ",
  czechy: "CZ",
  czechia: "CZ",
  "czech republic": "CZ",
  sk: "SK",
  slowacja: "SK",
  slovakia: "SK",
  lt: "LT",
  litwa: "LT",
  lithuania: "LT",
  nl: "NL",
  holandia: "NL",
  netherlands: "NL",
  ro: "RO",
  rumunia: "RO",
  romania: "RO"
};

const hashToNumber = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const resolveCountryCode = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  const upper = trimmed.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) {
    return upper;
  }

  return COUNTRY_ALIASES[normalizeText(trimmed)];
};

const stripStreetPrefixes = (value: string): string =>
  value
    .replace(/\bul\.?\b/gi, " ")
    .replace(/\bulica\b/gi, " ")
    .replace(/\bal\.?\b/gi, " ")
    .replace(/\baleja\b/gi, " ")
    .replace(/\bplac\b/gi, " ")
    .replace(/\spl\.\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const titleCase = (value: string): string =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

const escapeForRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sortedCityNames = Object.keys(CITY_CENTERS).sort(
  (first, second) => second.length - first.length
);

const findCityCenterByCountry = (
  address: string,
  countryCode: string
): CityCenter | undefined => {
  const normalizedAddress = normalizeText(address);
  const country = countryCode.toUpperCase();

  for (const cityName of sortedCityNames) {
    const city = CITY_CENTERS[cityName];
    if (city.country !== country) {
      continue;
    }

    const cityPattern = new RegExp(`\\b${escapeForRegex(cityName)}\\b`, "i");
    if (cityPattern.test(normalizedAddress)) {
      return city;
    }
  }

  return undefined;
};

const findCityCenterAnyCountry = (address: string): CityCenter | undefined => {
  const normalizedAddress = normalizeText(address);

  for (const cityName of sortedCityNames) {
    const cityPattern = new RegExp(`\\b${escapeForRegex(cityName)}\\b`, "i");
    if (cityPattern.test(normalizedAddress)) {
      return CITY_CENTERS[cityName];
    }
  }

  return undefined;
};

export const getFallbackAddressSuggestions = (
  query: string,
  countryInput?: string,
  limit = 5
): AddressSuggestion[] => {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery.length < 2) {
    return [];
  }

  const country = resolveCountryCode(countryInput);
  const allMatches = Object.entries(CITY_CENTERS).filter(([cityName]) =>
    cityName.includes(normalizedQuery)
  );

  const countryMatches = country
    ? allMatches.filter(([, city]) => city.country === country)
    : allMatches;

  const matches = (countryMatches.length > 0 ? countryMatches : allMatches)
    .sort(([firstCity], [secondCity]) => {
      const firstStarts = firstCity.startsWith(normalizedQuery);
      const secondStarts = secondCity.startsWith(normalizedQuery);

      if (firstStarts && !secondStarts) {
        return -1;
      }
      if (!firstStarts && secondStarts) {
        return 1;
      }
      return firstCity.localeCompare(secondCity);
    })
    .slice(0, limit);

  return matches.map(([cityName, city]) => {
    const cityTitle = CITY_DISPLAY_NAMES[cityName] ?? titleCase(cityName);
    const cityCountryName = COUNTRY_NAMES_BY_CODE[city.country] ?? city.country;
    return {
      label: `${cityTitle}, ${cityCountryName}`,
      displayName: `${cityTitle}, ${cityCountryName}`,
      lat: city.lat,
      lng: city.lng,
      source: "fallback-city-dictionary",
      fallbackUsed: true
    };
  });
};

class NominatimGeocodingProvider implements GeocodingProvider {
  private readonly endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint ?? "https://nominatim.openstreetmap.org/search";
  }

  private async queryNominatimSuggestions(input: {
    text: string;
    countryCode?: string;
    limit: number;
  }): Promise<AddressSuggestion[]> {
    const params = new URLSearchParams({
      q: input.text,
      format: "jsonv2",
      limit: String(input.limit),
      addressdetails: "1"
    });

    if (input.countryCode?.length === 2) {
      params.set("countrycodes", input.countryCode.toLowerCase());
    }

    const payload = await fetchJson<
      Array<{
        display_name: string;
        lat: string;
        lon: string;
      }>
    >(`${this.endpoint}?${params.toString()}`, {
      headers: {
        "User-Agent": "transport-codex-mvp/1.0 (internal app)",
        "Accept-Language": "pl,en"
      }
    });

    return payload.map((item) => ({
      label: item.display_name.split(",").slice(0, 3).join(",").trim(),
      displayName: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      source: "nominatim",
      fallbackUsed: false
    }));
  }

  async suggest(input: {
    query: string;
    countryCode?: string;
    limit: number;
  }): Promise<AddressSuggestion[]> {
    const cleanedQuery = stripStreetPrefixes(input.query);
    const uniqueVariants = Array.from(new Set([input.query, cleanedQuery])).filter(
      (item) => item.length > 1
    );

    for (const variant of uniqueVariants) {
      if (input.countryCode) {
        const countryLimited = await this.queryNominatimSuggestions({
          text: variant,
          countryCode: input.countryCode,
          limit: input.limit
        });
        if (countryLimited.length) {
          return countryLimited;
        }
      }

      const unrestricted = await this.queryNominatimSuggestions({
        text: variant,
        limit: input.limit
      });
      if (unrestricted.length) {
        return unrestricted;
      }
    }

    return [];
  }

  async geocode(input: {
    address: string;
    country: string;
  }): Promise<GeocodedAddress> {
    const countryCode = resolveCountryCode(input.country);
    const countryName = countryCode
      ? COUNTRY_NAMES_BY_CODE[countryCode] ?? input.country
      : input.country;
    const sanitizedAddress = stripStreetPrefixes(input.address);

    const candidates: Array<{ text: string; countryCode?: string }> = [];
    if (countryCode) {
      candidates.push(
        { text: input.address, countryCode },
        { text: `${input.address}, ${countryName}`, countryCode },
        { text: sanitizedAddress, countryCode },
        { text: `${sanitizedAddress}, ${countryName}`, countryCode }
      );
    }

    candidates.push({ text: input.address }, { text: sanitizedAddress });

    const uniqueCandidates = Array.from(
      new Map(
        candidates.map((candidate) => [
          `${candidate.text}::${candidate.countryCode ?? "*"}`,
          candidate
        ])
      ).values()
    );

    for (const candidate of uniqueCandidates) {
      const suggestions = await this.queryNominatimSuggestions({
        text: candidate.text,
        countryCode: candidate.countryCode,
        limit: 1
      });

      if (suggestions.length) {
        const result = suggestions[0];
        return {
          address: input.address,
          country: input.country,
          lat: result.lat,
          lng: result.lng,
          source: candidate.countryCode ? "nominatim" : "nominatim-open",
          fallbackUsed: false,
          message: candidate.countryCode
            ? undefined
            : "Adres dopasowano bez ograniczenia kraju."
        };
      }
    }

    throw new Error("Nominatim returned empty result for all query variants");
  }
}

class DeterministicFallbackGeocodingProvider implements GeocodingProvider {
  async geocode(input: {
    address: string;
    country: string;
  }): Promise<GeocodedAddress> {
    const countryCode = resolveCountryCode(input.country);
    const cityCenterInCountry = countryCode
      ? findCityCenterByCountry(input.address, countryCode)
      : undefined;
    const cityCenterGlobal = cityCenterInCountry ?? findCityCenterAnyCountry(input.address);
    const baseCenter =
      cityCenterGlobal ??
      (countryCode ? COUNTRY_CENTERS[countryCode] : undefined) ??
      COUNTRY_CENTERS.PL;
    const hash = hashToNumber(`${input.country}:${input.address}`);

    const latOffset = ((hash % 60) - 30) / 1000;
    const lngOffset = (((hash / 60) % 80) - 40) / 1000;

    const source = cityCenterInCountry
      ? "fallback-city-center"
      : cityCenterGlobal
        ? "fallback-city-center-global"
        : "fallback-deterministic";

    const message = cityCenterInCountry
      ? "Brak geokodowania API. Uzyto fallback oparty o centrum miasta."
      : cityCenterGlobal
        ? "Brak geokodowania API. Uzyto fallback oparty o rozpoznane miasto (poza wskazanym krajem)."
        : "Brak geokodowania API. Uzyto fallback oparty o centrum kraju.";

    return {
      address: input.address,
      country: input.country,
      lat: Number((baseCenter.lat + latOffset).toFixed(6)),
      lng: Number((baseCenter.lng + lngOffset).toFixed(6)),
      source,
      fallbackUsed: true,
      message
    };
  }
}

export const suggestAddresses = async (input: {
  query: string;
  country?: string;
  limit?: number;
}): Promise<AddressSuggestion[]> => {
  const query = input.query.trim();
  if (query.length < 2) {
    return [];
  }

  const countryCode = resolveCountryCode(input.country);
  const limit = Math.min(Math.max(input.limit ?? 5, 1), 10);

  const env = getAppEnv();
  if (!env.enableExternalGeocoding) {
    return getFallbackAddressSuggestions(query, countryCode, limit);
  }

  const provider = new NominatimGeocodingProvider(env.nominatimEndpoint);

  try {
    const externalSuggestions = await provider.suggest({
      query,
      countryCode,
      limit
    });

    if (externalSuggestions.length) {
      return externalSuggestions;
    }

    return getFallbackAddressSuggestions(query, countryCode, limit);
  } catch {
    return getFallbackAddressSuggestions(query, countryCode, limit);
  }
};

export const geocodeAddress = async (input: {
  address: string;
  country: string;
}): Promise<GeocodedAddress> => {
  const fallbackProvider = new DeterministicFallbackGeocodingProvider();
  const env = getAppEnv();

  if (!env.enableExternalGeocoding) {
    return fallbackProvider.geocode(input);
  }

  const nominatimProvider = new NominatimGeocodingProvider(env.nominatimEndpoint);

  try {
    return await nominatimProvider.geocode(input);
  } catch (error) {
    const fallback = await fallbackProvider.geocode(input);
    const reason = error instanceof Error ? error.message : "Unknown geocoding error";
    return {
      ...fallback,
      message: `${fallback.message} Powod: ${reason}.`
    };
  }
};

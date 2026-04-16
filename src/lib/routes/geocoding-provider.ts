import { getAppEnv } from "@/lib/config/env";
import { fetchJson } from "@/lib/http/http-client";
import {
  EUROPEAN_COUNTRIES,
  getEuropeanCountryNameByCode,
  resolveEuropeanCountryCode
} from "@/lib/locations/european-countries";
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

interface CityDefinition {
  keys: string[];
  displayName: string;
  lat: number;
  lng: number;
  country: string;
}

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0142/g, "l")
    .replace(/\u0105/g, "a")
    .replace(/\u0107/g, "c")
    .replace(/\u0119/g, "e")
    .replace(/\u0144/g, "n")
    .replace(/\u00f3/g, "o")
    .replace(/\u015b/g, "s")
    .replace(/[\u017a\u017c]/g, "z")
    .replace(/[^\w\s]/g, " ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const CITY_DEFINITIONS: CityDefinition[] = [
  { keys: ["tirana"], displayName: "Tirana", lat: 41.3275, lng: 19.8187, country: "AL" },
  {
    keys: ["andora la vella", "andorra la vella"],
    displayName: "Andora",
    lat: 42.5078,
    lng: 1.5211,
    country: "AD"
  },
  { keys: ["erewan", "yerevan"], displayName: "Erywań", lat: 40.1792, lng: 44.4991, country: "AM" },
  { keys: ["wieden", "vienna"], displayName: "Wiedeń", lat: 48.2082, lng: 16.3738, country: "AT" },
  { keys: ["baku"], displayName: "Baku", lat: 40.4093, lng: 49.8671, country: "AZ" },
  { keys: ["bruksela", "brussels"], displayName: "Bruksela", lat: 50.8503, lng: 4.3517, country: "BE" },
  { keys: ["minsk"], displayName: "Mińsk", lat: 53.9006, lng: 27.559, country: "BY" },
  {
    keys: ["sarajewo", "sarajevo"],
    displayName: "Sarajewo",
    lat: 43.8563,
    lng: 18.4131,
    country: "BA"
  },
  { keys: ["sofia"], displayName: "Sofia", lat: 42.6977, lng: 23.3219, country: "BG" },
  { keys: ["zagrzeb", "zagreb"], displayName: "Zagrzeb", lat: 45.815, lng: 15.9819, country: "HR" },
  { keys: ["nikozja", "nicosia"], displayName: "Nikozja", lat: 35.1856, lng: 33.3823, country: "CY" },
  { keys: ["podgorica"], displayName: "Podgorica", lat: 42.4304, lng: 19.2594, country: "ME" },
  { keys: ["praga", "prague", "praha"], displayName: "Praga", lat: 50.0755, lng: 14.4378, country: "CZ" },
  {
    keys: ["kopenhaga", "copenhagen"],
    displayName: "Kopenhaga",
    lat: 55.6761,
    lng: 12.5683,
    country: "DK"
  },
  { keys: ["tallinn"], displayName: "Tallinn", lat: 59.437, lng: 24.7536, country: "EE" },
  { keys: ["helsinki"], displayName: "Helsinki", lat: 60.1699, lng: 24.9384, country: "FI" },
  { keys: ["paryz", "paris"], displayName: "Paryż", lat: 48.8566, lng: 2.3522, country: "FR" },
  { keys: ["tbilisi"], displayName: "Tbilisi", lat: 41.7151, lng: 44.8271, country: "GE" },
  { keys: ["ateny", "athens"], displayName: "Ateny", lat: 37.9838, lng: 23.7275, country: "GR" },
  { keys: ["madryt", "madrid"], displayName: "Madryt", lat: 40.4168, lng: -3.7038, country: "ES" },
  { keys: ["amsterdam"], displayName: "Amsterdam", lat: 52.3676, lng: 4.9041, country: "NL" },
  { keys: ["dublin"], displayName: "Dublin", lat: 53.3498, lng: -6.2603, country: "IE" },
  { keys: ["reykjavik"], displayName: "Reykjavik", lat: 64.1466, lng: -21.9426, country: "IS" },
  {
    keys: ["prisztina", "pristina"],
    displayName: "Prisztina",
    lat: 42.6629,
    lng: 21.1655,
    country: "XK"
  },
  { keys: ["vaduz"], displayName: "Vaduz", lat: 47.141, lng: 9.5209, country: "LI" },
  { keys: ["wilno", "vilnius"], displayName: "Wilno", lat: 54.6872, lng: 25.2797, country: "LT" },
  { keys: ["ryga", "riga"], displayName: "Ryga", lat: 56.9496, lng: 24.1052, country: "LV" },
  {
    keys: ["luksemburg", "luxembourg"],
    displayName: "Luksemburg",
    lat: 49.6117,
    lng: 6.1319,
    country: "LU"
  },
  { keys: ["skopje"], displayName: "Skopje", lat: 41.9973, lng: 21.428, country: "MK" },
  { keys: ["valletta"], displayName: "Valletta", lat: 35.8989, lng: 14.5146, country: "MT" },
  {
    keys: ["kiszyniow", "chisinau"],
    displayName: "Kiszyniów",
    lat: 47.0105,
    lng: 28.8638,
    country: "MD"
  },
  { keys: ["monako", "monaco"], displayName: "Monako", lat: 43.7384, lng: 7.4246, country: "MC" },
  { keys: ["berlin"], displayName: "Berlin", lat: 52.52, lng: 13.405, country: "DE" },
  { keys: ["hamburg"], displayName: "Hamburg", lat: 53.5511, lng: 9.9937, country: "DE" },
  { keys: ["oslo"], displayName: "Oslo", lat: 59.9139, lng: 10.7522, country: "NO" },
  { keys: ["warszawa", "warsaw"], displayName: "Warszawa", lat: 52.2297, lng: 21.0122, country: "PL" },
  { keys: ["poznan"], displayName: "Poznań", lat: 52.4064, lng: 16.9252, country: "PL" },
  { keys: ["bialystok"], displayName: "Białystok", lat: 53.1325, lng: 23.1688, country: "PL" },
  { keys: ["krakow"], displayName: "Kraków", lat: 50.0647, lng: 19.945, country: "PL" },
  { keys: ["lodz"], displayName: "Łódź", lat: 51.7592, lng: 19.456, country: "PL" },
  { keys: ["wroclaw"], displayName: "Wrocław", lat: 51.1079, lng: 17.0385, country: "PL" },
  { keys: ["gdansk"], displayName: "Gdańsk", lat: 54.352, lng: 18.6466, country: "PL" },
  { keys: ["szczecin"], displayName: "Szczecin", lat: 53.4285, lng: 14.5528, country: "PL" },
  { keys: ["lublin"], displayName: "Lublin", lat: 51.2465, lng: 22.5684, country: "PL" },
  { keys: ["katowice"], displayName: "Katowice", lat: 50.2649, lng: 19.0238, country: "PL" },
  { keys: ["rzeszow"], displayName: "Rzeszów", lat: 50.0412, lng: 21.9991, country: "PL" },
  { keys: ["bydgoszcz"], displayName: "Bydgoszcz", lat: 53.1235, lng: 18.0084, country: "PL" },
  { keys: ["torun"], displayName: "Toruń", lat: 53.0138, lng: 18.5984, country: "PL" },
  { keys: ["opole"], displayName: "Opole", lat: 50.6751, lng: 17.9213, country: "PL" },
  { keys: ["kielce"], displayName: "Kielce", lat: 50.8661, lng: 20.6286, country: "PL" },
  { keys: ["olsztyn"], displayName: "Olsztyn", lat: 53.7784, lng: 20.48, country: "PL" },
  { keys: ["zielona gora"], displayName: "Zielona Góra", lat: 51.9356, lng: 15.5062, country: "PL" },
  {
    keys: ["gorzow wielkopolski"],
    displayName: "Gorzów Wielkopolski",
    lat: 52.7368,
    lng: 15.2288,
    country: "PL"
  },
  { keys: ["lizbona", "lisbon"], displayName: "Lizbona", lat: 38.7223, lng: -9.1393, country: "PT" },
  {
    keys: ["bukareszt", "bucharest"],
    displayName: "Bukareszt",
    lat: 44.4268,
    lng: 26.1025,
    country: "RO"
  },
  { keys: ["cluj napoca"], displayName: "Cluj-Napoca", lat: 46.7712, lng: 23.6236, country: "RO" },
  { keys: ["konstanca"], displayName: "Konstanca", lat: 44.1598, lng: 28.6348, country: "RO" },
  { keys: ["moskwa", "moscow"], displayName: "Moskwa", lat: 55.7558, lng: 37.6173, country: "RU" },
  { keys: ["san marino"], displayName: "San Marino", lat: 43.9424, lng: 12.4578, country: "SM" },
  { keys: ["belgrad", "belgrade"], displayName: "Belgrad", lat: 44.7866, lng: 20.4489, country: "RS" },
  {
    keys: ["bratyslawa", "bratislava"],
    displayName: "Bratysława",
    lat: 48.1486,
    lng: 17.1077,
    country: "SK"
  },
  { keys: ["lublana", "ljubljana"], displayName: "Lublana", lat: 46.0569, lng: 14.5058, country: "SI" },
  { keys: ["berno", "bern"], displayName: "Berno", lat: 46.948, lng: 7.4474, country: "CH" },
  {
    keys: ["sztokholm", "stockholm"],
    displayName: "Sztokholm",
    lat: 59.3293,
    lng: 18.0686,
    country: "SE"
  },
  { keys: ["ankara"], displayName: "Ankara", lat: 39.9334, lng: 32.8597, country: "TR" },
  { keys: ["kijow", "kyiv", "kiev"], displayName: "Kijów", lat: 50.4501, lng: 30.5234, country: "UA" },
  { keys: ["watykan", "vatican"], displayName: "Watykan", lat: 41.9029, lng: 12.4534, country: "VA" },
  {
    keys: ["budapeszt", "budapest"],
    displayName: "Budapeszt",
    lat: 47.4979,
    lng: 19.0402,
    country: "HU"
  },
  { keys: ["londyn", "london"], displayName: "Londyn", lat: 51.5072, lng: -0.1276, country: "GB" },
  { keys: ["rzym", "rome"], displayName: "Rzym", lat: 41.9028, lng: 12.4964, country: "IT" }
];

const CITY_CENTERS: Record<string, CityCenter> = {};
const CITY_DISPLAY_NAMES: Record<string, string> = {};

for (const city of CITY_DEFINITIONS) {
  for (const key of city.keys) {
    const normalizedKey = normalizeText(key);
    CITY_CENTERS[normalizedKey] = {
      lat: city.lat,
      lng: city.lng,
      country: city.country
    };
    CITY_DISPLAY_NAMES[normalizedKey] = city.displayName;
  }
}

const COUNTRY_CENTERS: Record<string, { lat: number; lng: number }> = {};

for (const country of EUROPEAN_COUNTRIES) {
  const capital = CITY_DEFINITIONS.find((city) => city.country === country.code);
  COUNTRY_CENTERS[country.code] = capital
    ? { lat: capital.lat, lng: capital.lng }
    : { lat: 52.0, lng: 19.0 };
}

const hashToNumber = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const resolveCountryCode = (value?: string): string | undefined => {
  return resolveEuropeanCountryCode(value);
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

  const matches = countryMatches
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

  if (matches.length > 0) {
    return matches.map(([cityName, city]) => {
      const cityTitle = CITY_DISPLAY_NAMES[cityName] ?? titleCase(cityName);
      const cityCountryName = getEuropeanCountryNameByCode(city.country) ?? city.country;
      return {
        label: `${cityTitle}, ${cityCountryName}`,
        displayName: `${cityTitle}, ${cityCountryName}`,
        lat: city.lat,
        lng: city.lng,
        source: "fallback-city-dictionary",
        fallbackUsed: true
      };
    });
  }

  if (country && COUNTRY_CENTERS[country]) {
    const countryName = getEuropeanCountryNameByCode(country) ?? country;
    const countryCenter = COUNTRY_CENTERS[country];
    const queryLabel = titleCase(query.trim());

    return [
      {
        label: `${queryLabel}, ${countryName}`,
        displayName: `${queryLabel}, ${countryName}`,
        lat: countryCenter.lat,
        lng: countryCenter.lng,
        source: "fallback-country-center",
        fallbackUsed: true
      }
    ];
  }

  return [];
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
      ? getEuropeanCountryNameByCode(countryCode) ?? input.country
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
      ? "Brak geokodowania API. Użyto fallback oparty o centrum miasta."
      : cityCenterGlobal
        ? "Brak geokodowania API. Użyto fallback oparty o rozpoznane miasto (poza wskazanym krajem)."
        : "Brak geokodowania API. Użyto fallback oparty o centrum kraju.";

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
      message: `${fallback.message} Powód: ${reason}.`
    };
  }
};
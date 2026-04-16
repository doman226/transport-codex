export interface EuropeanCountryDefinition {
  code: string;
  name: string;
  aliases: string[];
}

export const EUROPEAN_COUNTRIES: EuropeanCountryDefinition[] = [
  { code: "AL", name: "Albania", aliases: ["albania"] },
  { code: "AD", name: "Andora", aliases: ["andorra"] },
  { code: "AM", name: "Armenia", aliases: ["armenia"] },
  { code: "AT", name: "Austria", aliases: ["austria"] },
  { code: "AZ", name: "Azerbejdżan", aliases: ["azerbaijan"] },
  { code: "BE", name: "Belgia", aliases: ["belgium"] },
  { code: "BY", name: "Białoruś", aliases: ["belarus"] },
  {
    code: "BA",
    name: "Bośnia i Hercegowina",
    aliases: ["bosnia", "bosnia herzegovina", "bosnia and herzegovina"]
  },
  { code: "BG", name: "Bulgaria", aliases: ["bulgaria"] },
  { code: "HR", name: "Chorwacja", aliases: ["croatia"] },
  { code: "CY", name: "Cypr", aliases: ["cyprus"] },
  { code: "ME", name: "Czarnogóra", aliases: ["montenegro"] },
  { code: "CZ", name: "Czechy", aliases: ["czechia", "czech republic"] },
  { code: "DK", name: "Dania", aliases: ["denmark"] },
  { code: "EE", name: "Estonia", aliases: ["estonia"] },
  { code: "FI", name: "Finlandia", aliases: ["finland"] },
  { code: "FR", name: "Francja", aliases: ["france"] },
  { code: "GE", name: "Gruzja", aliases: ["georgia"] },
  { code: "GR", name: "Grecja", aliases: ["greece"] },
  { code: "ES", name: "Hiszpania", aliases: ["spain"] },
  { code: "NL", name: "Holandia", aliases: ["netherlands", "holland", "niderlandy"] },
  { code: "IE", name: "Irlandia", aliases: ["ireland"] },
  { code: "IS", name: "Islandia", aliases: ["iceland"] },
  { code: "XK", name: "Kosowo", aliases: ["kosovo"] },
  { code: "LI", name: "Liechtenstein", aliases: ["liechtenstein"] },
  { code: "LT", name: "Litwa", aliases: ["lithuania"] },
  { code: "LV", name: "Łotwa", aliases: ["latvia"] },
  { code: "LU", name: "Luksemburg", aliases: ["luxembourg"] },
  {
    code: "MK",
    name: "Macedonia Północna",
    aliases: ["north macedonia", "macedonia"]
  },
  { code: "MT", name: "Malta", aliases: ["malta"] },
  { code: "MD", name: "Moldawia", aliases: ["moldova"] },
  { code: "MC", name: "Monako", aliases: ["monaco"] },
  { code: "DE", name: "Niemcy", aliases: ["germany", "deutschland"] },
  { code: "NO", name: "Norwegia", aliases: ["norway"] },
  { code: "PL", name: "Polska", aliases: ["poland"] },
  { code: "PT", name: "Portugalia", aliases: ["portugal"] },
  { code: "RO", name: "Rumunia", aliases: ["romania"] },
  { code: "RU", name: "Rosja", aliases: ["russia"] },
  { code: "SM", name: "San Marino", aliases: ["san marino"] },
  { code: "RS", name: "Serbia", aliases: ["serbia"] },
  { code: "SK", name: "Słowacja", aliases: ["slovakia"] },
  { code: "SI", name: "Słowenia", aliases: ["slovenia"] },
  { code: "CH", name: "Szwajcaria", aliases: ["switzerland"] },
  { code: "SE", name: "Szwecja", aliases: ["sweden"] },
  { code: "TR", name: "Turcja", aliases: ["turkey"] },
  { code: "UA", name: "Ukraina", aliases: ["ukraine"] },
  { code: "VA", name: "Watykan", aliases: ["vatican", "vatican city"] },
  { code: "HU", name: "Węgry", aliases: ["hungary"] },
  {
    code: "GB",
    name: "Wielka Brytania",
    aliases: ["united kingdom", "uk", "great britain", "england"]
  },
  { code: "IT", name: "Włochy", aliases: ["italy"] }
];

const normalizeCountryText = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/[źż]/g, "z")
    .replace(/[^\w\s]/g, " ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const countryByCode = new Map(
  EUROPEAN_COUNTRIES.map((country) => [country.code, country] as const)
);

const aliasToCode = new Map<string, string>();

for (const country of EUROPEAN_COUNTRIES) {
  const aliases = [country.code, country.name, ...country.aliases];
  for (const alias of aliases) {
    aliasToCode.set(normalizeCountryText(alias), country.code);
  }
}

export const EUROPEAN_COUNTRY_OPTIONS = EUROPEAN_COUNTRIES.map(
  (country) => country.name
).sort((first, second) => first.localeCompare(second));

export const resolveEuropeanCountryCode = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const normalizedValue = normalizeCountryText(value);
  return aliasToCode.get(normalizedValue);
};

export const resolveEuropeanCountryName = (value?: string): string | undefined => {
  const code = resolveEuropeanCountryCode(value);
  if (!code) {
    return undefined;
  }

  return countryByCode.get(code)?.name;
};

export const getEuropeanCountryNameByCode = (
  code?: string
): string | undefined => {
  if (!code) {
    return undefined;
  }

  const upperCode = code.trim().toUpperCase();
  return countryByCode.get(upperCode)?.name;
};

export const isEuropeanCountry = (value?: string): boolean =>
  Boolean(resolveEuropeanCountryCode(value));

export const getEuropeanCountrySuggestions = (
  query: string,
  limit = 8
): string[] => {
  const normalizedQuery = normalizeCountryText(query);
  const safeLimit = Math.min(Math.max(limit, 1), 25);

  const matches = EUROPEAN_COUNTRY_OPTIONS.filter((countryName) =>
    normalizeCountryText(countryName).includes(normalizedQuery)
  ).sort((first, second) => {
    const firstNormalized = normalizeCountryText(first);
    const secondNormalized = normalizeCountryText(second);
    const firstStarts = firstNormalized.startsWith(normalizedQuery);
    const secondStarts = secondNormalized.startsWith(normalizedQuery);

    if (firstStarts && !secondStarts) {
      return -1;
    }
    if (!firstStarts && secondStarts) {
      return 1;
    }
    return first.localeCompare(second);
  });

  return matches.slice(0, safeLimit);
};

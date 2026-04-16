import { afterEach, describe, expect, it, vi } from "vitest";
import { EUROPEAN_COUNTRIES } from "@/lib/locations/european-countries";
import {
  geocodeAddress,
  getFallbackAddressSuggestions,
  resolveCountryCode
} from "@/lib/routes/geocoding-provider";

describe("geocoding fallback suggestions", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns city suggestions for PL query", () => {
    const result = getFallbackAddressSuggestions("pozn", "PL", 5);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].displayName.toLowerCase()).toContain("pozna");
    expect(result[0].fallbackUsed).toBe(true);
  });

  it("returns empty list for too short query", () => {
    const result = getFallbackAddressSuggestions("p", "PL", 5);
    expect(result).toEqual([]);
  });

  it("filters by country code", () => {
    const result = getFallbackAddressSuggestions("ber", "DE", 5);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].displayName.toLowerCase()).toContain("berlin");
  });

  it("supports country names (e.g. Czechy) for filtering", () => {
    const result = getFallbackAddressSuggestions("pra", "Czechy", 5);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].displayName.toLowerCase()).toContain("praga");
  });

  it("supports Romania aliases and Bukareszt suggestions", () => {
    const result = getFallbackAddressSuggestions("buk", "Rumunia", 5);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].displayName.toLowerCase()).toContain("bukareszt");
  });

  it("supports Łotwa aliases and Ryga suggestions", () => {
    const resultByName = getFallbackAddressSuggestions("ryg", "Łotwa", 5);
    const resultByCode = getFallbackAddressSuggestions("riga", "LV", 5);

    expect(resultByName.length).toBeGreaterThan(0);
    expect(resultByName[0].displayName.toLowerCase()).toContain("ryga");
    expect(resultByCode.length).toBeGreaterThan(0);
    expect(resultByCode[0].displayName.toLowerCase()).toContain("ryga");
  });

  it("returns country-center fallback suggestion when city dictionary has no match", () => {
    const result = getFallbackAddressSuggestions("NieznaneMiasto", "Hiszpania", 5);

    expect(result.length).toBe(1);
    expect(result[0].source).toBe("fallback-country-center");
    expect(result[0].displayName.toLowerCase()).toContain("hiszpania");
  });

  it("resolves common country aliases to ISO code", () => {
    expect(resolveCountryCode("Czechy")).toBe("CZ");
    expect(resolveCountryCode("Niemcy")).toBe("DE");
    expect(resolveCountryCode("Rumunia")).toBe("RO");
    expect(resolveCountryCode("RU")).toBe("RU");
    expect(resolveCountryCode("PL")).toBe("PL");
  });

  it("uses global city fallback when country does not match address city", async () => {
    vi.stubEnv("ENABLE_EXTERNAL_GEOCODING", "false");

    const result = await geocodeAddress({
      address: "Bukareszt",
      country: "PL"
    });

    expect(result.source).toBe("fallback-city-center-global");
    expect(result.lat).toBeGreaterThan(44);
    expect(result.lat).toBeLessThan(45);
    expect(result.lng).toBeGreaterThan(26);
    expect(result.lng).toBeLessThan(27);
  });

  it("uses global city fallback also for unknown country center map", async () => {
    vi.stubEnv("ENABLE_EXTERNAL_GEOCODING", "false");

    const result = await geocodeAddress({
      address: "Bukareszt",
      country: "RU"
    });

    expect(result.source).toBe("fallback-city-center-global");
    expect(result.lat).toBeGreaterThan(44);
    expect(result.lng).toBeGreaterThan(26);
  });

  it("uses city-center fallback for Łotwa and Ryga", async () => {
    vi.stubEnv("ENABLE_EXTERNAL_GEOCODING", "false");

    const result = await geocodeAddress({
      address: "Ryga",
      country: "Łotwa"
    });

    expect(result.source).toBe("fallback-city-center");
    expect(result.lat).toBeGreaterThan(56);
    expect(result.lng).toBeGreaterThan(24);
  });

  it("supports deterministic fallback geocoding for all european countries", async () => {
    vi.stubEnv("ENABLE_EXTERNAL_GEOCODING", "false");

    for (const country of EUROPEAN_COUNTRIES) {
      const result = await geocodeAddress({
        address: "MiastoTestoweXYZ",
        country: country.name
      });

      expect(Number.isFinite(result.lat)).toBe(true);
      expect(Number.isFinite(result.lng)).toBe(true);
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  getEuropeanCountryNameByCode,
  getEuropeanCountrySuggestions,
  isEuropeanCountry,
  resolveEuropeanCountryCode,
  resolveEuropeanCountryName
} from "@/lib/locations/european-countries";

describe("european country helpers", () => {
  it("resolves full country names and aliases to ISO code", () => {
    expect(resolveEuropeanCountryCode("Polska")).toBe("PL");
    expect(resolveEuropeanCountryCode("Niemcy")).toBe("DE");
    expect(resolveEuropeanCountryCode("netherlands")).toBe("NL");
    expect(resolveEuropeanCountryCode("Wielka Brytania")).toBe("GB");
    expect(resolveEuropeanCountryCode("Węgry")).toBe("HU");
    expect(resolveEuropeanCountryCode("Łotwa")).toBe("LV");
  });

  it("returns undefined for non-european countries", () => {
    expect(resolveEuropeanCountryCode("Brazylia")).toBeUndefined();
    expect(isEuropeanCountry("Brazylia")).toBe(false);
  });

  it("returns country names from codes", () => {
    expect(getEuropeanCountryNameByCode("PL")).toBe("Polska");
    expect(resolveEuropeanCountryName("GB")).toBe("Wielka Brytania");
  });

  it("suggests countries by typed prefix", () => {
    const suggestions = getEuropeanCountrySuggestions("po", 5);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0]).toBe("Polska");
  });

  it("supports diacritics and plain-text input equally", () => {
    expect(resolveEuropeanCountryCode("Słowacja")).toBe("SK");
    expect(resolveEuropeanCountryCode("Slowacja")).toBe("SK");
    expect(resolveEuropeanCountryCode("Włochy")).toBe("IT");
    expect(resolveEuropeanCountryCode("Wlochy")).toBe("IT");
  });
});

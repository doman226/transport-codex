import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fallbackFuelPrice,
  getFuelPrice,
  parseFuelEurPerLiter
} from "@/lib/fuel/fuel-provider";

describe("fuel provider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns manual ON fuel price when provided", async () => {
    const result = await getFuelPrice({ fuelType: "on", manualPrice: 7.2 });

    expect(result.fuelType).toBe("on");
    expect(result.fuelPricePlnPerLiter).toBe(7.2);
    expect(result.source).toBe("manual");
    expect(result.fallbackUsed).toBe(false);
  });

  it("returns manual PB95 fuel price when provided", async () => {
    const result = await getFuelPrice({ fuelType: "pb95", manualPrice: 7.8 });

    expect(result.fuelType).toBe("pb95");
    expect(result.fuelPricePlnPerLiter).toBe(7.8);
    expect(result.source).toBe("manual");
    expect(result.fallbackUsed).toBe(false);
  });

  it("uses fallback when external fuel provider is disabled", async () => {
    vi.stubEnv("ENABLE_EXTERNAL_FUEL", "false");
    const result = await getFuelPrice({ fuelType: "on" });

    expect(result.fallbackUsed).toBe(true);
    expect(result.source).toBe("fallback-static");
  });

  it("creates explicit fallback fuel object", () => {
    const fallback = fallbackFuelPrice("on", "test-reason", 6.4);

    expect(fallback.fuelPricePlnPerLiter).toBe(6.4);
    expect(fallback.fallbackUsed).toBe(true);
    expect(fallback.message).toContain("test-reason");
  });

  it("parses ON (diesel) EUR value from public feed html", () => {
    const sampleHtml = `
      <div>DIESEL</div>
      <div>&euro;1.427</div>
      <div>[ UPDATED: 2026-03-02 ]</div>
    `;

    const parsed = parseFuelEurPerLiter(sampleHtml, "on");
    expect(parsed).toBe(1.427);
  });

  it("parses PB95 EUR value from public feed html", () => {
    const sampleHtml = `
      <div>PREMIUM UNLEADED 95</div>
      <div>&euro;1.571</div>
      <div>[ UPDATED: 2026-03-02 ]</div>
    `;

    const parsed = parseFuelEurPerLiter(sampleHtml, "pb95");
    expect(parsed).toBe(1.571);
  });
});

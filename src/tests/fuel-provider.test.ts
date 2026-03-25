import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fallbackFuelPrice,
  getDieselPrice,
  parseDieselEurPerLiter
} from "@/lib/fuel/fuel-provider";

describe("fuel provider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns manual fuel price when provided", async () => {
    const result = await getDieselPrice(7.2);

    expect(result.dieselPricePlnPerLiter).toBe(7.2);
    expect(result.source).toBe("manual");
    expect(result.fallbackUsed).toBe(false);
  });

  it("uses fallback when external fuel provider is disabled", async () => {
    vi.stubEnv("ENABLE_EXTERNAL_FUEL", "false");
    const result = await getDieselPrice();

    expect(result.fallbackUsed).toBe(true);
    expect(result.source).toBe("fallback-static");
  });

  it("creates explicit fallback fuel object", () => {
    const fallback = fallbackFuelPrice("test-reason", 6.4);

    expect(fallback.dieselPricePlnPerLiter).toBe(6.4);
    expect(fallback.fallbackUsed).toBe(true);
    expect(fallback.message).toContain("test-reason");
  });

  it("parses diesel EUR value from public feed html", () => {
    const sampleHtml = `
      <div>DIESEL</div>
      <div>&euro;1.427</div>
      <div>[ UPDATED: 2026-03-02 ]</div>
    `;

    const parsed = parseDieselEurPerLiter(sampleHtml);
    expect(parsed).toBe(1.427);
  });
});

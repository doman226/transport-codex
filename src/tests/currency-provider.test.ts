import { afterEach, describe, expect, it, vi } from "vitest";
import { fallbackCurrencyRate, getPlnToEurRate } from "@/lib/currencies/currency-provider";

describe("currency provider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("converts PLN to EUR using manual rate without fallback", async () => {
    const result = await getPlnToEurRate(4.2);

    expect(result.plnToEurRate).toBe(4.2);
    expect(result.source).toBe("manual");
    expect(result.fallbackUsed).toBe(false);
  });

  it("uses fallback when external currency provider is disabled", async () => {
    vi.stubEnv("ENABLE_EXTERNAL_CURRENCY", "false");
    const result = await getPlnToEurRate();

    expect(result.fallbackUsed).toBe(true);
    expect(result.source).toBe("fallback-static");
  });

  it("creates explicit fallback object", () => {
    const fallback = fallbackCurrencyRate("test-reason", 4.33);

    expect(fallback.plnToEurRate).toBe(4.33);
    expect(fallback.fallbackUsed).toBe(true);
    expect(fallback.message).toContain("test-reason");
  });
});

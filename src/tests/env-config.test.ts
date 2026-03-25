import { afterEach, describe, expect, it, vi } from "vitest";
import { getEnvValidationResult } from "@/lib/config/env";

describe("env config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses defaults when values are missing", () => {
    vi.stubEnv("ENABLE_EXTERNAL_ROUTING", undefined);
    vi.stubEnv("ROUTING_PROVIDER", undefined);

    const { env } = getEnvValidationResult();
    expect(env.enableExternalRouting).toBe(false);
    expect(env.routingProvider).toBe("ors-hgv");
  });

  it("warns when ORS routing is enabled without api key", () => {
    vi.stubEnv("ENABLE_EXTERNAL_ROUTING", "true");
    vi.stubEnv("ROUTING_PROVIDER", "ors-hgv");
    vi.stubEnv("ORS_API_KEY", "");

    const { warnings } = getEnvValidationResult();
    expect(warnings.some((warning) => warning.includes("ORS_API_KEY"))).toBe(true);
  });

  it("warns and falls back for invalid numeric values", () => {
    vi.stubEnv("HTTP_TIMEOUT_MS", "abc");

    const { env, warnings } = getEnvValidationResult();
    expect(env.httpTimeoutMs).toBe(12000);
    expect(warnings.some((warning) => warning.includes("HTTP_TIMEOUT_MS"))).toBe(true);
  });
});

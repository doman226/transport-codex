import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithRetry, HttpRequestError } from "@/lib/http/http-client";

describe("http client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("retries transient errors and eventually returns response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("temporary", {
          status: 503
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      );

    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("HTTP_RETRIES", "1");

    const response = await fetchWithRetry("https://example.com/data");
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws HttpRequestError on non-retriable status", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("bad request", {
        status: 400
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("HTTP_RETRIES", "3");

    await expect(fetchWithRetry("https://example.com/data")).rejects.toBeInstanceOf(
      HttpRequestError
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

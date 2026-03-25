import { getAppEnv } from "@/lib/config/env";

export class HttpRequestError extends Error {
  readonly status?: number;
  readonly code: "http_error" | "timeout" | "network_error";

  constructor(message: string, input: {
    code: "http_error" | "timeout" | "network_error";
    status?: number;
  }) {
    super(message);
    this.name = "HttpRequestError";
    this.code = input.code;
    this.status = input.status;
  }
}

interface HttpRequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const isRetriableStatus = (status: number): boolean =>
  status === 408 || status === 425 || status === 429 || status >= 500;

const toHttpRequestError = (error: unknown): HttpRequestError => {
  if (error instanceof HttpRequestError) {
    return error;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return new HttpRequestError("Request timeout", { code: "timeout" });
  }

  if (error instanceof Error) {
    return new HttpRequestError(error.message, { code: "network_error" });
  }

  return new HttpRequestError("Unknown network error", { code: "network_error" });
};

export const fetchWithRetry = async (
  input: string | URL,
  init?: HttpRequestOptions
): Promise<Response> => {
  const env = getAppEnv();
  const timeoutMs = init?.timeoutMs ?? env.httpTimeoutMs;
  const retries = init?.retries ?? env.httpRetries;
  const maxAttempts = Math.max(1, retries + 1);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        return response;
      }

      const requestError = new HttpRequestError(
        `HTTP ${response.status}`,
        {
          code: "http_error",
          status: response.status
        }
      );

      if (!isRetriableStatus(response.status) || attempt >= maxAttempts) {
        throw requestError;
      }
    } catch (error) {
      clearTimeout(timeout);
      const requestError = toHttpRequestError(error);
      const canRetry =
        attempt < maxAttempts &&
        (requestError.code === "timeout" ||
          requestError.code === "network_error" ||
          (requestError.status ? isRetriableStatus(requestError.status) : false));

      if (!canRetry) {
        throw requestError;
      }
    }

    const retryDelayMs = Math.min(300 * 2 ** (attempt - 1), 1500);
    await sleep(retryDelayMs);
  }

  throw new HttpRequestError("Unknown HTTP error", { code: "network_error" });
};

export const fetchJson = async <T>(
  input: string | URL,
  init?: HttpRequestOptions
): Promise<T> => {
  const response = await fetchWithRetry(input, init);
  return (await response.json()) as T;
};

export const fetchText = async (
  input: string | URL,
  init?: HttpRequestOptions
): Promise<string> => {
  const response = await fetchWithRetry(input, init);
  return await response.text();
};

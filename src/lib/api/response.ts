import { NextResponse } from "next/server";

const REQUEST_ID_HEADER = "x-request-id";

export const getRequestId = (request: Request): string =>
  request.headers.get(REQUEST_ID_HEADER) ?? crypto.randomUUID();

export const apiJson = <T>(
  requestId: string,
  data: T,
  status = 200
): NextResponse<T> =>
  NextResponse.json(data, {
    status,
    headers: {
      [REQUEST_ID_HEADER]: requestId,
      "Cache-Control": "no-store"
    }
  });

export const apiError = (
  requestId: string,
  input: {
    status: number;
    message: string;
    details?: unknown;
  }
): NextResponse<{ message: string; requestId: string; details?: unknown }> =>
  NextResponse.json(
    {
      message: input.message,
      requestId,
      details: input.details
    },
    {
      status: input.status,
      headers: {
        [REQUEST_ID_HEADER]: requestId,
        "Cache-Control": "no-store"
      }
    }
  );

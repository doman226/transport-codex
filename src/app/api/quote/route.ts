import { ZodError } from "zod";
import { apiError, apiJson, getRequestId } from "@/lib/api/response";
import { calculateTransportQuote } from "@/lib/quotations/quote-service";
import { quoteInputSchema } from "@/lib/validation/quote-schema";

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const payload = await request.json();
    const input = quoteInputSchema.parse(payload);
    const result = await calculateTransportQuote(input);

    return apiJson(requestId, result, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(requestId, {
        status: 400,
        message: "Niepoprawne dane formularza.",
        details: error.flatten()
      });
    }

    const reason = error instanceof Error ? error.message : "Nieznany błąd serwera.";
    return apiError(requestId, { status: 500, message: reason });
  }
}

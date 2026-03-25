import { apiJson, getRequestId } from "@/lib/api/response";
import { suggestAddresses } from "@/lib/routes/geocoding-provider";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";
    const country = url.searchParams.get("country") ?? "PL";
    const limitParam = Number(url.searchParams.get("limit") ?? "5");

    const suggestions = await suggestAddresses({
      query,
      country,
      limit: Number.isFinite(limitParam) ? limitParam : 5
    });

    return apiJson(requestId, { items: suggestions }, 200);
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Unknown suggestion error";
    return apiJson(requestId, { items: [], message: reason }, 200);
  }
}

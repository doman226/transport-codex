import { apiJson, getRequestId } from "@/lib/api/response";
import { DEFAULT_VEHICLES } from "@/lib/vehicles/default-vehicles";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  return apiJson(
    requestId,
    DEFAULT_VEHICLES.filter((vehicle) => vehicle.active),
    200
  );
}

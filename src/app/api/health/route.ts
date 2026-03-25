import { getEnvValidationResult } from "@/lib/config/env";
import { prisma } from "@/lib/db/prisma";
import { apiJson, getRequestId } from "@/lib/api/response";

type CheckStatus = "ok" | "warn" | "error" | "skipped";

interface CheckResult {
  status: CheckStatus;
  message?: string;
}

const checkDatabase = async (withDbCheck: boolean): Promise<CheckResult> => {
  if (!withDbCheck) {
    return {
      status: "skipped",
      message: "DB healthcheck disabled (HEALTHCHECK_WITH_DB=false)."
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown DB error";
    return {
      status: "error",
      message
    };
  }
};

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const { env, warnings } = getEnvValidationResult();

  const db = await checkDatabase(env.healthcheckWithDb);
  const config: CheckResult =
    warnings.length > 0
      ? {
          status: "warn",
          message: warnings.join(" ")
        }
      : { status: "ok" };

  const checks = {
    config,
    database: db
  };

  const hasError = Object.values(checks).some((check) => check.status === "error");
  const hasWarn = Object.values(checks).some((check) => check.status === "warn");
  const status: "ok" | "degraded" | "error" = hasError
    ? "error"
    : hasWarn
      ? "degraded"
      : "ok";

  return apiJson(
    requestId,
    {
      status,
      timestamp: new Date().toISOString(),
      checks,
      environment: {
        nodeEnv: env.nodeEnv,
        routingProvider: env.routingProvider,
        integrations: {
          geocoding: env.enableExternalGeocoding,
          routing: env.enableExternalRouting,
          currency: env.enableExternalCurrency,
          fuel: env.enableExternalFuel
        }
      },
      warnings
    },
    status === "error" ? 503 : 200
  );
}

import { calculateCostBreakdown } from "@/lib/calculators/cost-calculator";
import { getPlnToEurRate } from "@/lib/currencies/currency-provider";
import { getDieselPrice } from "@/lib/fuel/fuel-provider";
import { geocodeAddress } from "@/lib/routes/geocoding-provider";
import { calculateRoute } from "@/lib/routes/routing-provider";
import { estimateTollCost } from "@/lib/routes/toll-provider";
import { findVehicleById } from "@/lib/vehicles/default-vehicles";
import type { QuoteInput, QuoteResult } from "@/types/quote";

const buildRouteForCalculation = (
  route: QuoteResult["route"],
  manualDistanceKm?: number
): QuoteResult["route"] => {
  if (!manualDistanceKm || manualDistanceKm <= 0) {
    return route;
  }

  const ratio = route.distanceKm > 0 ? manualDistanceKm / route.distanceKm : 1;
  const durationMin = route.durationMin * ratio;
  const messagePrefix = route.message ? `${route.message} ` : "";

  return {
    ...route,
    distanceKm: manualDistanceKm,
    durationMin,
    message: `${messagePrefix}Użyto ręcznie wpisanego dystansu do kalkulacji.`
  };
};

export const calculateTransportQuote = async (
  input: QuoteInput
): Promise<QuoteResult> => {
  const vehicle = findVehicleById(input.vehicleTypeId);
  if (!vehicle) {
    throw new Error("Nie znaleziono konfiguracji pojazdu.");
  }

  const [loadLocation, unloadLocation] = await Promise.all([
    geocodeAddress({
      address: input.loadAddress,
      country: input.loadCountry
    }),
    geocodeAddress({
      address: input.unloadAddress,
      country: input.unloadCountry
    })
  ]);

  const routeBase = await calculateRoute({
    start: { lat: loadLocation.lat, lng: loadLocation.lng },
    end: { lat: unloadLocation.lat, lng: unloadLocation.lng }
  });
  const route = buildRouteForCalculation(routeBase, input.manualDistanceKm);

  const [fuel, currency] = await Promise.all([
    getDieselPrice(input.manualFuelPricePln),
    getPlnToEurRate(input.manualExchangeRate)
  ]);

  const toll = estimateTollCost({
    distanceKm: route.distanceKm,
    transportType: input.transportType,
    loadCountry: input.loadCountry,
    unloadCountry: input.unloadCountry,
    vehicle,
    manualTollCostPln: input.manualTollCostPln
  });

  const breakdown = calculateCostBreakdown({
    vehicle,
    transportType: input.transportType,
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    fuelPricePlnPerLiter: fuel.dieselPricePlnPerLiter,
    tollCostPlnOverride: toll.amountPln,
    marginType: input.marginType,
    marginValue:
      input.marginValue > 0 ? input.marginValue : vehicle.defaultMarginPercent,
    extraOperationalCostPln: input.extraOperationalCostPln,
    isOversize: input.isOversize,
    requiresPermit: input.requiresPermit,
    requiresCrane: input.requiresCrane,
    exchangeRatePlnToEur: currency.plnToEurRate
  });

  const warnings = {
    vehicleLengthExceeded: input.loadLengthM > vehicle.maxLengthM,
    vehiclePayloadExceeded: input.loadWeightKg > vehicle.payloadKg
  };

  return {
    createdAt: new Date().toISOString(),
    vehicle,
    input,
    route,
    loadLocation,
    unloadLocation,
    fuel,
    currency,
    toll,
    breakdown,
    warnings
  };
};

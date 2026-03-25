import { z } from "zod";

const optionalPositiveNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().positive().optional()
);

export const quoteInputSchema = z.object({
  customerName: z.string().trim().max(120).optional(),
  loadAddress: z.string().trim().min(3, "Podaj adres zaladunku."),
  unloadAddress: z.string().trim().min(3, "Podaj adres rozladunku."),
  loadCountry: z.string().trim().min(2, "Podaj kraj startu."),
  unloadCountry: z.string().trim().min(2, "Podaj kraj dostawy."),
  transportType: z.enum(["domestic", "international"]),
  vehicleTypeId: z.string().trim().min(1, "Wybierz pojazd."),
  loadWeightKg: z.coerce.number().positive("Masa musi byc dodatnia."),
  loadLengthM: z.coerce.number().positive("Dlugosc musi byc dodatnia."),
  itemsCount: z.coerce.number().int().positive("Liczba sztuk musi byc dodatnia."),
  isOversize: z.boolean().default(false),
  requiresPermit: z.boolean().default(false),
  requiresCrane: z.boolean().default(false),
  marginType: z.enum(["percent", "amount"]),
  marginValue: z.coerce.number().min(0, "Marza nie moze byc ujemna."),
  fuelType: z.enum(["on", "pb95"]).default("on"),
  extraOperationalCostPln: z.coerce
    .number()
    .min(0, "Koszt dodatkowy nie moze byc ujemny."),
  manualDistanceKm: optionalPositiveNumber,
  manualTollCostPln: optionalPositiveNumber,
  manualFuelPricePln: optionalPositiveNumber,
  manualExchangeRate: optionalPositiveNumber
});

export type QuoteInputDto = z.infer<typeof quoteInputSchema>;

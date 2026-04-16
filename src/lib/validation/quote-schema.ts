import { z } from "zod";
import { isEuropeanCountry } from "@/lib/locations/european-countries";

const optionalPositiveNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().positive().optional()
);

export const quoteInputSchema = z.object({
  customerName: z.string().trim().max(120).optional(),
  loadAddress: z.string().trim().min(3, "Podaj adres załadunku."),
  unloadAddress: z.string().trim().min(3, "Podaj adres rozładunku."),
  loadCountry: z
    .string()
    .trim()
    .min(2, "Podaj kraj startu.")
    .refine(isEuropeanCountry, "Wybierz kraj europejski z listy."),
  unloadCountry: z
    .string()
    .trim()
    .min(2, "Podaj kraj dostawy.")
    .refine(isEuropeanCountry, "Wybierz kraj europejski z listy."),
  transportType: z.enum(["domestic", "international"]),
  vehicleTypeId: z.string().trim().min(1, "Wybierz pojazd."),
  loadWeightKg: z.coerce.number().positive("Masa musi być dodatnia."),
  loadLengthM: z.coerce.number().positive("Długość musi być dodatnia."),
  itemsCount: z.coerce.number().int().positive("Liczba sztuk musi być dodatnia."),
  isOversize: z.boolean().default(false),
  requiresPermit: z.boolean().default(false),
  requiresCrane: z.boolean().default(false),
  marginType: z.enum(["percent", "amount"]),
  marginValue: z.coerce.number().min(0, "Marża nie może być ujemna."),
  fuelType: z.enum(["on", "pb95"]).default("on"),
  extraOperationalCostPln: z.coerce
    .number()
    .min(0, "Koszt dodatkowy nie może być ujemny."),
  manualDistanceKm: optionalPositiveNumber,
  manualTollCostPln: optionalPositiveNumber,
  manualFuelPricePln: optionalPositiveNumber,
  manualExchangeRate: optionalPositiveNumber
});

export type QuoteInputDto = z.infer<typeof quoteInputSchema>;

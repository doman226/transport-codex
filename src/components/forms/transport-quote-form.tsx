"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AddressAutocompleteInput } from "@/components/forms/address-autocomplete-input";
import { CountryAutocompleteInput } from "@/components/forms/country-autocomplete-input";
import { CostBreakdown } from "@/components/pricing/cost-breakdown";
import { resolveEuropeanCountryCode } from "@/lib/locations/european-countries";
import { quoteInputSchema } from "@/lib/validation/quote-schema";
import { DEFAULT_VEHICLES } from "@/lib/vehicles/default-vehicles";
import type { QuoteResult } from "@/types/quote";
import type { VehicleType } from "@/types/vehicles";

const RouteMap = dynamic(
  () => import("@/components/map/route-map").then((module) => module.RouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-[24px] border border-brand-300/30 bg-brand-900/80 text-sm text-brand-50">
        Ładowanie mapy...
      </div>
    )
  }
);

type QuoteFormValues = z.input<typeof quoteInputSchema>;

const inputClassName =
  "mt-2 w-full rounded-[18px] border border-brand-100 bg-white px-4 py-3 text-sm text-brand-900 shadow-[0_8px_22px_-18px_rgba(16,36,95,0.35)] outline-none transition placeholder:text-brand-300 hover:border-brand-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

const sectionClassName = "workspace-panel rounded-[24px] p-4 md:p-5";

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-sm font-semibold text-brand-700">{children}</label>
);

export const TransportQuoteForm = () => {
  const [vehicles, setVehicles] = useState<VehicleType[]>(DEFAULT_VEHICLES);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultVehicle = useMemo(() => vehicles[0], [vehicles]);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteInputSchema),
    defaultValues: {
      customerName: "",
      loadAddress: "",
      unloadAddress: "",
      loadCountry: "Polska",
      unloadCountry: "Polska",
      transportType: "domestic",
      vehicleTypeId: DEFAULT_VEHICLES[0]?.id,
      loadWeightKg: 12000,
      loadLengthM: 8,
      itemsCount: 1,
      isOversize: false,
      requiresPermit: false,
      requiresCrane: false,
      marginType: "percent",
      marginValue: DEFAULT_VEHICLES[0]?.defaultMarginPercent ?? 12,
      fuelType: "on",
      extraOperationalCostPln: 0,
      manualDistanceKm: undefined,
      manualTollCostPln: undefined,
      manualFuelPricePln: undefined,
      manualExchangeRate: undefined
    }
  });

  const watchedVehicleTypeId = form.watch("vehicleTypeId");
  const watchedLoadCountry = form.watch("loadCountry");
  const watchedUnloadCountry = form.watch("unloadCountry");

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles");
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as VehicleType[];
        if (!payload.length) {
          return;
        }

        setVehicles(payload);
        const currentVehicle = form.getValues("vehicleTypeId");
        if (!currentVehicle) {
          form.setValue("vehicleTypeId", payload[0].id);
          form.setValue("marginValue", payload[0].defaultMarginPercent);
        }
      } catch {
        // fallback to local vehicle list
      }
    };

    void loadVehicles();
  }, [form]);

  const selectedVehicle = useMemo(
    () =>
      vehicles.find((vehicle) => vehicle.id === watchedVehicleTypeId) ??
      defaultVehicle,
    [defaultVehicle, vehicles, watchedVehicleTypeId]
  );

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);
    setApiError(null);

    const loadCountryCode = resolveEuropeanCountryCode(values.loadCountry);
    const unloadCountryCode = resolveEuropeanCountryCode(values.unloadCountry);

    if (!loadCountryCode || !unloadCountryCode) {
      setApiError("Wybierz kraj startu i dostawy z listy krajów europejskich.");
      setLoading(false);
      return;
    }

    const normalizedValues = {
      ...values,
      loadCountry: loadCountryCode,
      unloadCountry: unloadCountryCode,
      transportType:
        loadCountryCode === "PL" &&
        unloadCountryCode === "PL"
          ? "domestic"
          : "international"
    };

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(normalizedValues)
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as { message?: string };
        throw new Error(errorPayload.message ?? "Nie udało się policzyć wyceny.");
      }

      const result = (await response.json()) as QuoteResult;
      setQuote(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Wystąpił nieznany błąd.";
      setApiError(message);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.08fr)_minmax(600px,0.92fr)]">
      <section className="workspace-panel rounded-[28px] p-5 md:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-brand-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
              Formularz operacyjny
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-brand-900">Nowa wycena</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-600">
              Uzupełnij te same dane trasy i ładunku co dotychczas. Zmienił się wyłącznie
              wygląd oraz sposób wykorzystania szerokości ekranu.
            </p>
          </div>
          <p className="rounded-full border border-accent-500/40 bg-accent-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
            Ten sam flow
          </p>
        </header>

        <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
          <section className={sectionClassName}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-500">
              Dane podstawowe
            </h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Label>
                Nazwa klienta (opcjonalnie)
                <input
                  className={inputClassName}
                  placeholder="np. Steel-Mont"
                  {...form.register("customerName")}
                />
              </Label>
              <Label>
                Typ pojazdu
                <select
                  className={inputClassName}
                  {...form.register("vehicleTypeId")}
                  onChange={(event) => {
                    form.setValue("vehicleTypeId", event.target.value);
                    const vehicle = vehicles.find((item) => item.id === event.target.value);
                    if (vehicle && form.getValues("marginType") === "percent") {
                      form.setValue("marginValue", vehicle.defaultMarginPercent);
                    }
                  }}
                >
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </option>
                  ))}
                </select>
              </Label>
            </div>
          </section>

          <section className={sectionClassName}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-500">
              Trasa i przewóz
            </h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Controller
                control={form.control}
                name="loadAddress"
                render={({ field }) => (
                  <AddressAutocompleteInput
                    label="Adres załadunku"
                    placeholder="np. Poznań, ul. Przemysłowa 1"
                    value={field.value ?? ""}
                    countryCode={resolveEuropeanCountryCode(watchedLoadCountry) ?? "PL"}
                    className={inputClassName}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="unloadAddress"
                render={({ field }) => (
                  <AddressAutocompleteInput
                    label="Adres rozładunku"
                    placeholder="np. Białystok, ul. Produkcyjna 4"
                    value={field.value ?? ""}
                    countryCode={resolveEuropeanCountryCode(watchedUnloadCountry) ?? "PL"}
                    className={inputClassName}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <Controller
                control={form.control}
                name="loadCountry"
                render={({ field }) => (
                  <CountryAutocompleteInput
                    label="Kraj startu"
                    placeholder="np. Polska"
                    value={field.value ?? ""}
                    className={inputClassName}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="unloadCountry"
                render={({ field }) => (
                  <CountryAutocompleteInput
                    label="Kraj dostawy"
                    placeholder="np. Niemcy"
                    value={field.value ?? ""}
                    className={inputClassName}
                    onChange={field.onChange}
                  />
                )}
              />
              <Label>
                Typ przewozu
                <select className={inputClassName} {...form.register("transportType")}>
                  <option value="domestic">Krajowy</option>
                  <option value="international">Międzynarodowy</option>
                </select>
              </Label>
              <Label>
                Liczba sztuk
                <input
                  type="number"
                  min={1}
                  className={inputClassName}
                  {...form.register("itemsCount", { valueAsNumber: true })}
                />
              </Label>
            </div>
          </section>

          <section className={sectionClassName}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-500">
              Ładunek i wycena
            </h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Label>
                Waga ładunku [kg]
                <input
                  type="number"
                  min={1}
                  className={inputClassName}
                  {...form.register("loadWeightKg", { valueAsNumber: true })}
                />
              </Label>
              <Label>
                Długość elementów [m]
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  className={inputClassName}
                  {...form.register("loadLengthM", { valueAsNumber: true })}
                />
              </Label>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-5">
              <Label>
                Marża
                <select className={inputClassName} {...form.register("marginType")}>
                  <option value="percent">Procent [%]</option>
                  <option value="amount">Kwota [PLN]</option>
                </select>
              </Label>
              <Label>
                Wartość marży
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className={inputClassName}
                  {...form.register("marginValue", { valueAsNumber: true })}
                />
              </Label>
              <Label>
                Dodatkowy koszt operacyjny [PLN]
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className={inputClassName}
                  {...form.register("extraOperationalCostPln", { valueAsNumber: true })}
                />
              </Label>
              <Label>
                Ręczny dystans [km]
                <input
                  type="number"
                  min={1}
                  step={0.1}
                  className={inputClassName}
                  placeholder="opcjonalnie"
                  {...form.register("manualDistanceKm", {
                    setValueAs: (value) => (value === "" ? undefined : Number(value))
                  })}
                />
              </Label>
              <Label>
                Ręczna opłata drogowa [PLN]
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className={inputClassName}
                  placeholder="opcjonalnie"
                  {...form.register("manualTollCostPln", {
                    setValueAs: (value) => (value === "" ? undefined : Number(value))
                  })}
                />
              </Label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Label>
                Rodzaj paliwa
                <select className={inputClassName} {...form.register("fuelType")}>
                  <option value="on">ON (diesel)</option>
                  <option value="pb95">PB95</option>
                </select>
              </Label>
              <Label>
                Ręczna cena paliwa [PLN/l]
                <input
                  type="number"
                  min={0.1}
                  step={0.01}
                  className={inputClassName}
                  placeholder="opcjonalnie"
                  {...form.register("manualFuelPricePln", {
                    setValueAs: (value) => (value === "" ? undefined : Number(value))
                  })}
                />
              </Label>
              <Label>
                Ręczny kurs EUR/PLN
                <input
                  type="number"
                  min={0.1}
                  step={0.0001}
                  className={inputClassName}
                  placeholder="opcjonalnie"
                  {...form.register("manualExchangeRate", {
                    setValueAs: (value) => (value === "" ? undefined : Number(value))
                  })}
                />
              </Label>
            </div>
          </section>

          <section className={sectionClassName}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-500">
              Opcje dodatkowe
            </h3>
            <div className="mt-3 grid gap-2 text-sm text-brand-700">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-brand-300 text-accent-500 focus:ring-accent-100"
                  {...form.register("isOversize")}
                />
                Ładunek ponadgabarytowy
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-brand-300 text-accent-500 focus:ring-accent-100"
                  {...form.register("requiresPermit")}
                />
                Wymaga zezwolenia
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-brand-300 text-accent-500 focus:ring-accent-100"
                  {...form.register("requiresCrane")}
                />
                Wymaga HDS / dźwigu
              </label>
            </div>
          </section>

          {Object.keys(form.formState.errors).length > 0 ? (
            <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Sprawdź formularz: część pól zawiera niepoprawne dane.
            </div>
          ) : null}

          {apiError ? (
            <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-[20px] border border-brand-700 bg-gradient-to-r from-brand-700 via-brand-700 to-brand-900 px-6 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-[0_18px_34px_-20px_rgba(16,36,95,0.72)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Liczenie wyceny..." : "Oblicz wycenę"}
          </button>
        </form>

        {selectedVehicle ? (
          <aside className="mt-4 rounded-[22px] border border-brand-100 bg-gradient-to-r from-brand-50 to-white px-4 py-3 text-sm text-brand-900">
            <p className="font-semibold uppercase tracking-[0.12em] text-brand-600">
              Parametry wybranego pojazdu
            </p>
            <p className="mt-2 leading-6">
              Ładowność: {selectedVehicle.payloadKg} kg | Maks. długość:{" "}
              {selectedVehicle.maxLengthM} m | Spalanie:{" "}
              {selectedVehicle.avgFuelConsumptionPer100Km} l/100 km
            </p>
          </aside>
        ) : null}
      </section>

      <section className="flex flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
        {quote ? (
          <>
            <section className="workspace-panel-dark rounded-[28px] p-4">
              <RouteMap
                geometry={quote.route.geometry}
                start={{
                  lat: quote.loadLocation.lat,
                  lng: quote.loadLocation.lng
                }}
                end={{
                  lat: quote.unloadLocation.lat,
                  lng: quote.unloadLocation.lng
                }}
              />
            </section>

            <CostBreakdown quote={quote} />

            <section className="workspace-panel-dark rounded-[28px] p-5 text-white">
              <h3 className="text-lg font-semibold">Status danych</h3>
              <ul className="mt-3 space-y-2 text-sm text-brand-50/88">
                <li>
                  Trasa: {quote.route.source}
                  {quote.route.fallbackUsed ? " (fallback)" : ""}
                </li>
                <li>
                  Geokodowanie start: {quote.loadLocation.source}
                  {quote.loadLocation.fallbackUsed ? " (fallback)" : ""}
                </li>
                <li>
                  Geokodowanie cel: {quote.unloadLocation.source}
                  {quote.unloadLocation.fallbackUsed ? " (fallback)" : ""}
                </li>
                <li>
                  Paliwo: {quote.fuel.source}
                  {quote.fuel.fallbackUsed ? " (fallback)" : ""}
                </li>
                <li>
                  Opłaty drogowe: {quote.toll.source}
                  {quote.toll.fallbackUsed ? " (fallback)" : ""}
                </li>
                <li>
                  Kurs waluty: {quote.currency.source}
                  {quote.currency.fallbackUsed ? " (fallback)" : ""}
                </li>
              </ul>

              {(quote.route.message ||
                quote.loadLocation.message ||
                quote.unloadLocation.message ||
                quote.fuel.message ||
                quote.toll.message ||
                quote.currency.message) && (
                <div className="mt-4 rounded-[20px] border border-accent-500/45 bg-accent-500/10 p-4 text-xs leading-5 text-brand-50">
                  <p>{quote.route.message}</p>
                  <p>{quote.loadLocation.message}</p>
                  <p>{quote.unloadLocation.message}</p>
                  <p>{quote.fuel.message}</p>
                  <p>{quote.toll.message}</p>
                  <p>{quote.currency.message}</p>
                </div>
              )}

              {(quote.warnings.vehicleLengthExceeded ||
                quote.warnings.vehiclePayloadExceeded) && (
                <div className="mt-4 rounded-[20px] border border-red-300/70 bg-red-500/12 p-4 text-xs leading-5 text-red-100">
                  {quote.warnings.vehicleLengthExceeded && (
                    <p>Długość ładunku przekracza parametr wybranego pojazdu.</p>
                  )}
                  {quote.warnings.vehiclePayloadExceeded && (
                    <p>Masa ładunku przekracza ładowność wybranego pojazdu.</p>
                  )}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="workspace-panel-dark flex min-h-[680px] items-center justify-center rounded-[28px] border border-brand-300/20 p-8 text-center text-sm leading-6 text-brand-50/82">
            Wynik wyceny i wieksza mapa pojawia sie tutaj po wyslaniu formularza.
          </div>
        )}
      </section>
    </div>
  );
};

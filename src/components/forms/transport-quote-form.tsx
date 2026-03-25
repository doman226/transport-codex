"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AddressAutocompleteInput } from "@/components/forms/address-autocomplete-input";
import { CostBreakdown } from "@/components/pricing/cost-breakdown";
import { quoteInputSchema } from "@/lib/validation/quote-schema";
import { DEFAULT_VEHICLES } from "@/lib/vehicles/default-vehicles";
import type { QuoteResult } from "@/types/quote";
import type { VehicleType } from "@/types/vehicles";

const RouteMap = dynamic(
  () => import("@/components/map/route-map").then((module) => module.RouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        Ladowanie mapy...
      </div>
    )
  }
);

type QuoteFormValues = z.input<typeof quoteInputSchema>;

const inputClassName =
  "mt-1 w-full rounded-xl border border-slate-300/90 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 shadow-[0_1px_0_rgba(255,255,255,0.8)] outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

const sectionClassName =
  "rounded-2xl border border-slate-200/90 bg-white/75 p-4 md:p-5";

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-sm font-medium text-slate-700">{children}</label>
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
      loadCountry: "PL",
      unloadCountry: "PL",
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

    const normalizedValues = {
      ...values,
      transportType:
        values.loadCountry.toUpperCase() === "PL" &&
        values.unloadCountry.toUpperCase() === "PL"
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
        throw new Error(errorPayload.message ?? "Nie udalo sie policzyc wyceny.");
      }

      const result = (await response.json()) as QuoteResult;
      setQuote(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Wystapil nieznany blad.";
      setApiError(message);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
      <section className="glass-card rounded-[28px] p-5 md:p-7">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Nowa wycena</h2>
            <p className="mt-1 text-sm text-slate-600">
              Uzupelnij dane trasy i ladunku, a system policzy wynik z pelnym
              rozbiciem kosztow.
            </p>
          </div>
          <p className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
            Formularz MVP
          </p>
        </header>

        <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
          <section className={sectionClassName}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
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
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Trasa i przewoz
            </h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Controller
                control={form.control}
                name="loadAddress"
                render={({ field }) => (
                  <AddressAutocompleteInput
                    label="Adres zaladunku"
                    placeholder="np. Poznan, ul. Przemyslowa 1"
                    value={field.value ?? ""}
                    countryCode={watchedLoadCountry ?? "PL"}
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
                    label="Adres rozladunku"
                    placeholder="np. Bialystok, ul. Produkcyjna 4"
                    value={field.value ?? ""}
                    countryCode={watchedUnloadCountry ?? "PL"}
                    className={inputClassName}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <Label>
                Kraj startu
                <input className={inputClassName} {...form.register("loadCountry")} />
              </Label>
              <Label>
                Kraj dostawy
                <input className={inputClassName} {...form.register("unloadCountry")} />
              </Label>
              <Label>
                Typ przewozu
                <select className={inputClassName} {...form.register("transportType")}>
                  <option value="domestic">Krajowy</option>
                  <option value="international">Miedzynarodowy</option>
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
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Ladunek i wycena
            </h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Label>
                Waga ladunku [kg]
                <input
                  type="number"
                  min={1}
                  className={inputClassName}
                  {...form.register("loadWeightKg", { valueAsNumber: true })}
                />
              </Label>
              <Label>
                Dlugosc elementow [m]
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  className={inputClassName}
                  {...form.register("loadLengthM", { valueAsNumber: true })}
                />
              </Label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-5">
              <Label>
                Marza
                <select className={inputClassName} {...form.register("marginType")}>
                  <option value="percent">Procent [%]</option>
                  <option value="amount">Kwota [PLN]</option>
                </select>
              </Label>
              <Label>
                Wartosc marzy
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
                Reczny dystans [km]
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
                Reczna oplata drogowa [PLN]
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

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Label>
                Reczna cena paliwa [PLN/l]
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
                Reczny kurs EUR/PLN
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
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Opcje dodatkowe
            </h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" {...form.register("isOversize")} />
                Ladunek ponadgabarytowy
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" {...form.register("requiresPermit")} />
                Wymaga zezwolenia
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" {...form.register("requiresCrane")} />
                Wymaga HDS / dzwigu
              </label>
            </div>
          </section>

          {Object.keys(form.formState.errors).length > 0 ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Sprawdz formularz: czesc pol zawiera niepoprawne dane.
            </div>
          ) : null}

          {apiError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {apiError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-brand-700 to-brand-900 px-5 py-3 text-sm font-semibold tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Liczenie wyceny..." : "Oblicz wycene"}
          </button>
        </form>

        {selectedVehicle ? (
          <aside className="mt-4 rounded-xl border border-brand-100 bg-brand-50/70 p-3 text-sm text-brand-900">
            <p className="font-semibold">Parametry wybranego pojazdu</p>
            <p className="mt-1">
              Ladownosc: {selectedVehicle.payloadKg} kg | Maks. dlugosc:{" "}
              {selectedVehicle.maxLengthM} m | Spalanie:{" "}
              {selectedVehicle.avgFuelConsumptionPer100Km} l/100 km
            </p>
          </aside>
        ) : null}
      </section>

      <section className="flex flex-col gap-4 xl:sticky xl:top-6 xl:self-start">
        {quote ? (
          <>
            <section className="glass-card rounded-[24px] p-3">
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

            <section className="glass-card rounded-[24px] p-4">
              <h3 className="text-lg font-semibold text-slate-900">Status danych</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
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
                  Oplaty drogowe: {quote.toll.source}
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
                <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
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
                <div className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                  {quote.warnings.vehicleLengthExceeded && (
                    <p>Dlugosc ladunku przekracza parametr wybranego pojazdu.</p>
                  )}
                  {quote.warnings.vehiclePayloadExceeded && (
                    <p>Masa ladunku przekracza ladownosc wybranego pojazdu.</p>
                  )}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="glass-card flex min-h-[360px] items-center justify-center rounded-[24px] border border-dashed p-6 text-center text-sm text-slate-600">
            Wynik wyceny pojawi sie tutaj po wyslaniu formularza.
          </div>
        )}
      </section>
    </div>
  );
};

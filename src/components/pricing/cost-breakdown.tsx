import {
  formatCurrency,
  formatDistanceKm,
  formatMinutesAsHours
} from "@/lib/shared/formatters";
import type { QuoteResult } from "@/types/quote";

interface CostBreakdownProps {
  quote: QuoteResult;
}

const Row = ({
  label,
  value,
  emphasized = false
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) => (
  <div
    className={`flex items-center justify-between rounded-[18px] px-4 py-3 text-sm ${
      emphasized
        ? "bg-brand-500/22 text-white"
        : "border border-white/10 bg-white/4 text-brand-50"
    }`}
  >
    <span className={emphasized ? "font-medium" : "text-brand-50/82"}>{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

export const CostBreakdown = ({ quote }: CostBreakdownProps) => {
  const { breakdown, route, fuel, currency } = quote;
  const fuelLabel = fuel.fuelType === "pb95" ? "PB95" : "ON";

  return (
    <section className="workspace-panel-dark rounded-[28px] p-5 text-white">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-semibold">Rozbicie kosztów</h3>
          <p className="mt-1 text-sm text-brand-50/75">
            Dystans: {formatDistanceKm(route.distanceKm)} | Czas:{" "}
            {formatMinutesAsHours(route.durationMin)}
          </p>
        </div>
        <div className="rounded-full border border-accent-500/40 bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-100">
          Wynik netto
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <Row label="Koszt paliwa" value={formatCurrency(breakdown.fuelCostPln, "PLN")} />
        <Row
          label="Koszt opłat drogowych"
          value={formatCurrency(breakdown.tollCostPln, "PLN")}
        />
        <Row
          label="Koszt pracy kierowcy"
          value={formatCurrency(breakdown.driverCostPln, "PLN")}
        />
        <Row
          label="Koszt stały pojazdu"
          value={formatCurrency(breakdown.fixedVehicleCostPln, "PLN")}
        />
        <Row label="Koszt postoju" value={formatCurrency(breakdown.stopCostPln, "PLN")} />
        <Row
          label="Koszty dodatkowe"
          value={formatCurrency(breakdown.extraCostPln, "PLN")}
        />
        <Row label="Marża" value={formatCurrency(breakdown.marginAmountPln, "PLN")} />
        <Row
          label="Suma netto PLN"
          value={formatCurrency(breakdown.totalNetPln, "PLN")}
          emphasized
        />
        <Row
          label="Suma netto EUR"
          value={formatCurrency(breakdown.totalNetEur, "EUR")}
          emphasized
        />
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-white/4 p-4 text-xs leading-5 text-brand-50/82">
        <p>
          Paliwo ({fuelLabel}): {fuel.source} ({formatCurrency(fuel.fuelPricePlnPerLiter, "PLN")} / l)
        </p>
        <p className="mt-1">
          Kurs EUR/PLN: {currency.source} ({currency.plnToEurRate.toFixed(2)}) z dnia{" "}
          {currency.date.slice(0, 10)}
        </p>
      </div>
    </section>
  );
};

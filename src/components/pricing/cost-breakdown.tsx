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
    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
      emphasized
        ? "bg-slate-900 text-white"
        : "border border-slate-200 bg-white/75 text-slate-800"
    }`}
  >
    <span>{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

export const CostBreakdown = ({ quote }: CostBreakdownProps) => {
  const { breakdown, route, fuel, currency } = quote;

  return (
    <section className="glass-card rounded-[24px] p-4">
      <h3 className="text-xl font-semibold text-slate-900">Rozbicie kosztów</h3>
      <p className="mt-1 text-xs text-slate-500">
        Dystans: {formatDistanceKm(route.distanceKm)} | Czas:{" "}
        {formatMinutesAsHours(route.durationMin)}
      </p>

      <div className="mt-3 grid gap-2">
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

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600">
        <p>
          Paliwo: {fuel.source} ({formatCurrency(fuel.dieselPricePlnPerLiter, "PLN")} / l)
        </p>
        <p>
          Kurs EUR/PLN: {currency.source} ({currency.plnToEurRate.toFixed(2)}) z dnia{" "}
          {currency.date.slice(0, 10)}
        </p>
      </div>
    </section>
  );
};

import { TransportQuoteForm } from "@/components/forms/transport-quote-form";

const featureCards = [
  {
    title: "Wycena A do B w kilka minut",
    description:
      "Adresy, pojazd, ładunek i marża w jednym formularzu bez przechodzenia między ekranami."
  },
  {
    title: "Pełne rozbicie kosztów",
    description:
      "Paliwo, opłaty drogowe, kierowca, koszty stałe, dopłaty i wynik końcowy w PLN i EUR."
  },
  {
    title: "Odporność na brak API",
    description:
      "Bezpieczne fallbacki pozwalają działać nawet gdy zewnętrzne usługi chwilowo nie odpowiadają."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
      <section className="glass-card relative overflow-hidden rounded-[28px] p-6 md:p-8">
        <div className="pointer-events-none absolute right-0 top-0 h-36 w-44 rounded-bl-[80px] bg-gradient-to-br from-brand-100/85 to-transparent" />

        <div className="relative z-10">
          <p className="inline-flex items-center rounded-full border border-brand-100 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            MVP wyceny transportu
          </p>

          <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Kalkulator kosztów transportu elementów stalowych
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700 md:text-base">
            Pracujemy nad narzędziem, które łączy planowanie trasy, kalkulację
            kosztów i podgląd mapy w jednym, czytelnym panelu dla handlowca i
            logistyki.
          </p>
        </div>

        <div className="relative z-10 mt-6 grid gap-3 md:grid-cols-3">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm"
            >
              <h2 className="text-sm font-semibold text-slate-900 md:text-base">
                {feature.title}
              </h2>
              <p className="mt-2 text-xs leading-5 text-slate-600 md:text-sm">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <TransportQuoteForm />
    </main>
  );
}

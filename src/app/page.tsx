import Image from "next/image";
import { TransportQuoteForm } from "@/components/forms/transport-quote-form";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full px-3 py-3 sm:px-4 lg:px-5 xl:px-6">
      <div className="workspace-shell rounded-[34px] p-3 md:p-4">
        <section className="relative overflow-hidden rounded-[30px] border border-brand-300/35 bg-gradient-to-r from-brand-700 via-brand-700 to-brand-900 px-5 py-5 text-white md:px-8 md:py-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 opacity-35">
            <div className="h-full w-full bg-[linear-gradient(116deg,transparent_0%,transparent_48.8%,rgba(255,255,255,0.16)_49%,rgba(255,255,255,0.16)_49.6%,transparent_49.8%,transparent_100%)] bg-[length:180px_180px]" />
          </div>
          <div className="pointer-events-none absolute -bottom-10 left-10 h-20 w-72 rounded-full bg-brand-300/20 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-16 w-[48%] -translate-x-1/2 rounded-full bg-accent-500/14 blur-2xl" />

          <div className="relative grid gap-6 lg:grid-cols-[384px_minmax(0,1fr)] lg:items-stretch">
            <div className="flex">
              <div className="flex min-h-[290px] w-full max-w-[384px] items-start rounded-[28px] border border-white/65 bg-white px-6 py-8 shadow-[0_28px_50px_-30px_rgba(3,8,25,0.7)] md:min-h-[384px]">
                <Image
                  src="/intra-logo.png"
                  alt="Intra BV"
                  width={700}
                  height={340}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center lg:pl-8">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-brand-100/82 lg:text-left">
                Kalkulator transportu
              </p>
              <div className="mt-6 flex justify-center lg:mt-8">
                <div className="inline-flex max-w-full flex-col items-center">
                  <h1 className="text-center text-[clamp(3rem,8vw,5.8rem)] font-semibold uppercase leading-[0.98] tracking-[0.12em] text-white sm:tracking-[0.14em] xl:tracking-[0.18em]">
                    TRANSINTRABV
                  </h1>
                  <span className="mt-5 h-[10px] w-full rounded-full bg-accent-500/95" />
                </div>
              </div>

              <div className="mt-12 border-t border-white/55" />
            </div>
          </div>
        </section>

        <div className="mt-3 rounded-[30px] bg-brand-900/88 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-brand-900/88 px-5 py-4 md:px-8">
            <h2 className="text-2xl font-semibold text-white">Nowa wycena transportu</h2>
            <p className="text-sm font-medium text-brand-100/88">widok roboczy na pelna szerokosc</p>
          </div>

          <div className="mt-3 rounded-[24px] bg-gradient-to-b from-brand-50 to-[#edf3ff] px-4 py-5 md:px-6 md:py-6">
            <TransportQuoteForm />
          </div>
        </div>
      </div>
    </main>
  );
}

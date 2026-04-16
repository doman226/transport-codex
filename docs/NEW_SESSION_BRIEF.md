# New Session Brief (transport-codex)

## 1) Co to za projekt
- Aplikacja web do wyceny transportu elementow stalowych.
- Stack: Next.js 14 + TypeScript + Tailwind + Prisma + Vitest.
- Formularz liczy trase, koszty (paliwo, oplaty, kierowca, marza), wynik PLN/EUR i pokazuje mape.

## 2) Gdzie jest deploy
- Netlify site: `https://intratrans.netlify.app`
- Repo GitHub: `https://github.com/doman226/transport-codex`

## 3) Co jest juz zrobione
- Sprint 0: stabilna baza (env config, healthcheck, retry/timeout HTTP, CI).
- Integracje fallback (geocoding, routing, currency, fuel).
- Autocomplete adresow + poprawki geokodowania miedzynarodowego.
- Dodany wybor paliwa: `ON` i `PB95` (domyslnie `ON`).

## 4) Co jest teraz "in progress"
- Poprawka paliwa PB95:
  - parser rozszerzony o etykiety `EURO 95` i `EUROSUPER 95`,
  - dodatkowo estymacja PB95 = ON + 0.35 PLN/l, gdy feed nie zwroci PB95.
- Lokalnie sa NIEzpushowane zmiany:
  - `src/lib/fuel/fuel-provider.ts`
  - `src/tests/fuel-provider.test.ts`

## 5) Co zrobic na start nowej sesji
1. Otworzyc ten plik i przeczytac.
2. Sprawdzic status:
   - `git status`
3. Jesli mamy kontynuowac PB95:
   - sprawdzic lokalnie: `npm run lint && npm test`
   - commit + push
   - redeploy Netlify (Clear cache and deploy site)
4. Potem przejsc do redesignu UI pod kolory firmy Intra BV.

## 6) Szybki prompt do nowej sesji
`Przeczytaj najpierw docs/NEW_SESSION_BRIEF.md i kontynuuj od punktu 5.`

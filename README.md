# Transport Codex MVP

Aplikacja webowa do wyceny kosztów transportu elementów stalowych.

Projekt realizuje MVP zgodnie z:
- `AGENTS.md`
- `docs/PROJECT_SPEC.md`
- `docs/IMPLEMENTATION_PLAN.md`

## Deploy (GitHub + Netlify)

Krok po kroku:
- `docs/DEPLOY_NETLIFY.md`

Repo ma gotowa konfiguracje:
- `netlify.toml`

## Co działa teraz

1. Formularz wyceny:
- adres załadunku i rozładunku,
- autocomplete adresów i miejscowości,
- typ pojazdu i parametry ładunku,
- ręczne nadpisania: dystans, paliwo, kurs, opłaty drogowe.

2. Kalkulacja kosztów:
- paliwo, opłaty drogowe, kierowca, koszt stały, postój, koszty dodatkowe,
- marża (procent lub kwota),
- wynik netto w PLN i EUR.

3. Trasa i mapa:
- geokodowanie,
- wyznaczanie trasy,
- podgląd trasy na mapie OpenStreetMap (Leaflet),
- dystans i czas przejazdu.

4. Fallbacki i status źródeł:
- fallback geokodowania, trasy, kursu walut i paliwa,
- jawny status źródeł danych i komunikaty ostrzegawcze.

## Sprint 0 (Tydzień 1) - stabilna baza produkcyjna

Wdrożony zakres jest opisany w:
- `docs/SPRINT_0_WEEK1.md`

Najważniejsze elementy:
- centralna walidacja env (`src/lib/config/env.ts`),
- wspólny klient HTTP z timeout/retry (`src/lib/http/http-client.ts`),
- healthcheck (`GET /api/health`),
- `x-request-id` w odpowiedziach API,
- bazowe nagłówki bezpieczeństwa (`next.config.mjs`),
- skrypt jakości `npm run check`,
- workflow CI (`.github/workflows/ci.yml`).

## Założenia biznesowe (MVP)

Ponieważ dokumentacja nie zawiera pełnych stawek operacyjnych, użyto wartości przykładowych w:
- `src/lib/vehicles/default-vehicles.ts`
- `src/lib/settings/default-settings.ts`

Przykładowe wartości fallback:
- paliwo: `6.85 PLN/l`
- kurs EUR/PLN: `4.35`

Te wartości należy traktować jako robocze i zastąpić docelowymi stawkami firmowymi.

## Stack technologiczny

- Next.js 14 (App Router)
- TypeScript 5
- Tailwind CSS
- React Hook Form + Zod
- Prisma + PostgreSQL
- Leaflet + OpenStreetMap
- Vitest

## Uruchomienie lokalne (Windows PowerShell)

1. Wejdź do katalogu projektu:

```powershell
cd C:\Users\doman\Documents\transport-codex
```

2. Zainstaluj zależności:

```powershell
npm install
```

3. Utwórz plik `.env`:

```powershell
Copy-Item .env.example .env
```

4. Uzupełnij `.env` (minimum `DATABASE_URL`; opcjonalnie `ORS_API_KEY`).

5. Wygeneruj Prisma Client:

```powershell
npm run prisma:generate
```

6. Wykonaj migrację:

```powershell
npm run prisma:migrate -- --name init
```

7. Zasil bazę danymi startowymi:

```powershell
npm run prisma:seed
```

8. Uruchom aplikację:

```powershell
npm run dev
```

9. Otwórz:
- [http://localhost:3000](http://localhost:3000)

10. Sprawdź healthcheck:
- [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Jakość i testy

Szybki pełny check:

```powershell
npm run check
```

Oddzielnie:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

## Integracje API i konfiguracja

Kluczowe zmienne:
- `ENABLE_EXTERNAL_GEOCODING`
- `ENABLE_EXTERNAL_ROUTING`
- `ENABLE_EXTERNAL_CURRENCY`
- `ENABLE_EXTERNAL_FUEL`
- `ROUTING_PROVIDER` (`osrm` lub `ors-hgv`)
- `ORS_API_KEY`
- `FUEL_API_ENDPOINT` (opcjonalnie)
- `HTTP_TIMEOUT_MS`
- `HTTP_RETRIES`
- `HEALTHCHECK_WITH_DB`

Przykład routingu ciężarowego (ORS):

```env
ENABLE_EXTERNAL_ROUTING="true"
ROUTING_PROVIDER="ors-hgv"
ORS_API_KEY="twoj-klucz-ors"
```

Jeśli `ORS_API_KEY` nie jest ustawiony, aplikacja automatycznie przełączy trasowanie na OSRM i pokaże ostrzeżenie.

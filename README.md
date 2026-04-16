# Transport Codex

Kalkulator kosztow transportu dla Intra B.V. Aplikacja pomaga szybko przygotowac wycene przewozu elementow stalowych: liczy trase, koszt paliwa, oplaty drogowe, koszt kierowcy, marze oraz wynik netto w PLN i EUR.

Live demo: [https://intratrans.netlify.app](https://intratrans.netlify.app)

## Co robi aplikacja

- obsluguje formularz wyceny na jednym ekranie,
- wyznacza trase i pokazuje ja na mapie OpenStreetMap,
- geokoduje adresy zaladunku i rozladunku,
- wspiera pelne nazwy krajow europejskich z podpowiedziami,
- obsluguje polskie znaki w formularzu i wyszukiwaniu,
- pokazuje pelne rozbicie kosztow,
- przelicza wynik na PLN i EUR,
- ma fallbacki dla geokodowania, routingu, paliwa i kursu walut,
- pokazuje status zrodel danych i ostrzezenia dla operatora.

## Aktualny zakres MVP

W obecnej wersji dziala:

- formularz wyceny transportu A-B,
- kilka typow pojazdow z domyslnymi parametrami,
- przewoz krajowy i miedzynarodowy,
- reczne nadpisanie dystansu, paliwa, kursu i oplat drogowych,
- walidacja danych formularza,
- mapa trasy i panel kosztowy,
- testy jednostkowe dla kalkulacji i providerow.

Poza MVP lub w dalszych etapach:

- historia wycen,
- zapis ofert do bazy jako glowny flow biznesowy,
- eksport PDF,
- panel administracyjny,
- role i uprawnienia.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Prisma
- PostgreSQL
- Leaflet + OpenStreetMap
- Vitest

## Szybki start

### Windows - najszybciej

W katalogu projektu jest launcher:

```bat
start-app.bat
```

Po dwukliku albo uruchomieniu z `cmd` skrypt:

- przejdzie do katalogu projektu,
- utworzy `.env` z `.env.example`, jesli go brakuje,
- zrobi `npm install`, jesli nie ma `node_modules`,
- uruchomi `npm run dev`.

Jesli okno zamknie sie zbyt szybko, odpal skrypt z terminala:

```powershell
cd C:\Users\doman\Documents\transport-codex
.\start-app.bat
```

### Recznie

```powershell
cd C:\Users\doman\Documents\transport-codex
npm install
Copy-Item .env.example .env
npm run dev
```

Po starcie otworz:

- [http://localhost:3000](http://localhost:3000)
- [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Czy baza danych jest wymagana

Nie do podstawowego liczenia wyceny w obecnym MVP.

Domyslny `.env.example` ma:

- `HEALTHCHECK_WITH_DB=false`
- wszystkie integracje zewnetrzne ustawione domyslnie na `false`

To oznacza, ze formularz, kalkulacja i fallbacki moga dzialac lokalnie bez pelnej konfiguracji bazy i zewnetrznych API.

Baza danych bedzie potrzebna, jesli chcesz pracowac nad Prisma, migracjami albo kolejnymi modulami opartymi o zapis danych.

## Skrypty

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm test
npm run test:watch
npm run check
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run build:netlify
```

Najwazniejsze:

- `npm run check` odpala `lint`, `typecheck`, `test` i `build`
- `npm run build:netlify` robi `prisma generate` i build pod deploy

## Konfiguracja `.env`

Pelny przyklad jest w [`.env.example`](C:\Users\doman\Documents\transport-codex\.env.example).

Najwazniejsze zmienne:

- `DATABASE_URL`
- `ENABLE_EXTERNAL_GEOCODING`
- `ENABLE_EXTERNAL_ROUTING`
- `ENABLE_EXTERNAL_CURRENCY`
- `ENABLE_EXTERNAL_FUEL`
- `ROUTING_PROVIDER`
- `ORS_API_KEY`
- `HEALTHCHECK_WITH_DB`
- `HTTP_TIMEOUT_MS`
- `HTTP_RETRIES`

Dostepne endpointy i cache sa rowniez konfigurowalne:

- `NOMINATIM_ENDPOINT`
- `OSRM_ENDPOINT`
- `ORS_HGV_ENDPOINT`
- `CURRENCY_API_ENDPOINT`
- `FUEL_API_ENDPOINT`
- `CURRENCY_CACHE_TTL_MIN`
- `FUEL_CACHE_TTL_MIN`

### Przyklad routingu ciezarowego ORS

```env
ENABLE_EXTERNAL_ROUTING="true"
ROUTING_PROVIDER="ors-hgv"
ORS_API_KEY="twoj-klucz-ors"
```

Jesli `ORS_API_KEY` nie jest ustawiony, aplikacja przejdzie na fallback i zasygnalizuje to w statusie danych.

## Testy i jakosc

Szybki pelny check:

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

## Deploy

Projekt jest przygotowany pod Netlify.

- konfiguracja: [`netlify.toml`](C:\Users\doman\Documents\transport-codex\netlify.toml)
- instrukcja wdrozenia: [`docs/DEPLOY_NETLIFY.md`](C:\Users\doman\Documents\transport-codex\docs\DEPLOY_NETLIFY.md)

Aktualny deploy:

- [https://intratrans.netlify.app](https://intratrans.netlify.app)

## Struktura projektu

- [`src/app`](C:\Users\doman\Documents\transport-codex\src\app) - App Router, strona glowna i API routes
- [`src/components`](C:\Users\doman\Documents\transport-codex\src\components) - formularze, mapa, panel kosztow
- [`src/lib`](C:\Users\doman\Documents\transport-codex\src\lib) - logika biznesowa, providery, config i helpery
- [`src/tests`](C:\Users\doman\Documents\transport-codex\src\tests) - testy jednostkowe
- [`prisma`](C:\Users\doman\Documents\transport-codex\prisma) - schema i seed
- [`docs`](C:\Users\doman\Documents\transport-codex\docs) - specyfikacja i plan implementacji

## Dokumentacja projektu

- [`AGENTS.md`](C:\Users\doman\Documents\transport-codex\AGENTS.md)
- [`docs/PROJECT_SPEC.md`](C:\Users\doman\Documents\transport-codex\docs\PROJECT_SPEC.md)
- [`docs/IMPLEMENTATION_PLAN.md`](C:\Users\doman\Documents\transport-codex\docs\IMPLEMENTATION_PLAN.md)
- [`docs/NEW_SESSION_BRIEF.md`](C:\Users\doman\Documents\transport-codex\docs\NEW_SESSION_BRIEF.md)
- [`docs/SPRINT_0_WEEK1.md`](C:\Users\doman\Documents\transport-codex\docs\SPRINT_0_WEEK1.md)

## Uwagi

- W repo sa fallbacki, bo projekt nie moze zakladac stalej dostepnosci publicznych API.
- Parametry kosztowe pojazdow i ustawien sa obecnie robocze i powinny zostac dostrojone pod dane firmowe.
- Przy zmianach w kalkulacji warto uruchamiac `npm test` i `npm run check`.

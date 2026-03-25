# Sprint 0 (Tydzień 1) - Stabilna baza produkcyjna

## Cel

Przygotowanie projektu MVP do stabilnej pracy na środowisku testowym/produkcyjnym:
- przewidywalna konfiguracja środowiska,
- odporne wywołania do zewnętrznych API,
- szybka diagnostyka stanu aplikacji,
- podstawowe zabezpieczenia HTTP,
- automatyczna kontrola jakości w CI.

## Zakres wdrożony

1. Centralna konfiguracja środowiska:
- `src/lib/config/env.ts`
- walidacja i normalizacja zmiennych środowiskowych,
- ostrzeżenia konfiguracyjne (np. `ROUTING_PROVIDER=ors-hgv` bez `ORS_API_KEY`).

2. Stabilny klient HTTP:
- `src/lib/http/http-client.ts`
- timeout, retry z backoff, obsługa błędów transportowych,
- wspólny mechanizm dla providerów: geokodowanie, routing, paliwo, waluty.

3. Spójna warstwa API:
- `src/lib/api/response.ts`
- `x-request-id` w odpowiedziach,
- ujednolicone odpowiedzi błędów w `/api/quote`.

4. Healthcheck:
- `src/app/api/health/route.ts`
- status `ok | degraded | error`,
- kontrola konfiguracji i opcjonalnie bazy (`HEALTHCHECK_WITH_DB`).

5. Bezpieczeństwo nagłówków:
- `next.config.mjs`
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.

6. Jakość i CI:
- nowe skrypty: `npm run typecheck`, `npm run check`,
- workflow: `.github/workflows/ci.yml`,
- nowe testy:
  - `src/tests/env-config.test.ts`
  - `src/tests/http-client.test.ts`

## Kryteria ukończenia Sprintu 0

1. Aplikacja uruchamia się lokalnie bez ręcznych poprawek kodu.
2. Błędna konfiguracja env daje czytelne ostrzeżenia.
3. Integracje zewnętrzne nie zawieszają procesu przy timeoutach.
4. Endpoint `/api/health` zwraca status gotowości.
5. `npm run check` przechodzi lokalnie.
6. CI uruchamia lint, typecheck, testy i build.

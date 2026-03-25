# Deploy na Netlify (dla zespolu)

Ten dokument prowadzi krok po kroku:
1. GitHub repo,
2. podpiecie projektu do Netlify,
3. ustawienie zmiennych srodowiskowych,
4. nadanie dostepu wspolpracownikom.

## 1) Przygotowanie repozytorium GitHub

1. Utworz nowe repo na GitHub (np. `transport-codex`).
2. W katalogu projektu wykonaj:

```powershell
cd C:\Users\doman\Documents\transport-codex
git init
git add .
git commit -m "Initial MVP + Sprint 0"
git branch -M main
git remote add origin https://github.com/<twoj-user-lub-org>/transport-codex.git
git push -u origin main
```

## 2) Podpiecie repo do Netlify

1. Zaloguj sie do Netlify.
2. Wybierz `Add new site` -> `Import an existing project`.
3. Wybierz `GitHub` i autoryzuj dostep.
4. Wybierz repo `transport-codex`.
5. Build settings:
- Build command: zaciagnie z `netlify.toml` (`npm run build:netlify`)
- Publish directory: zaciagnie z `netlify.toml` (`.next`)

## 3) Zmienne srodowiskowe w Netlify

W Netlify: `Site configuration` -> `Environment variables`.

Ustaw co najmniej:
- `NODE_ENV=production`
- `ENABLE_EXTERNAL_GEOCODING=true`
- `ENABLE_EXTERNAL_ROUTING=true`
- `ENABLE_EXTERNAL_CURRENCY=true`
- `ENABLE_EXTERNAL_FUEL=true`
- `ROUTING_PROVIDER=ors-hgv`
- `ORS_API_KEY=<twoj_klucz_ors>`
- `HEALTHCHECK_WITH_DB=false`

Opcjonalnie:
- `FUEL_API_ENDPOINT=<wlasny_endpoint_paliwa>`
- `DATABASE_URL=<postgres_url>` (przyda sie pod kolejne sprinty)

Wazne:
- Kluczy API nie trzymamy w repo.
- Klucze trzymamy tylko w Netlify Environment Variables.

## 4) Dostep dla wspolpracownikow

1. GitHub:
- dodaj wspolpracownikow do repo (lub do organizacji),
- ustaw role (Write/Maintain/Admin wg potrzeb).

2. Netlify:
- wejdzi w Team settings,
- zapros wspolpracownikow do teamu,
- nadaj role (Owner/Developer/Reviewer).

Dobra praktyka:
- kod i PR-y przez GitHub,
- deploy automatyczny po mergu do `main`,
- branch deploye / deploy previews do testow.

## 5) Jak zespol pracuje po wdrozeniu

1. Kazda osoba pracuje na branchu.
2. Tworzy PR do `main`.
3. Netlify tworzy deploy preview dla PR.
4. Po mergu do `main` idzie produkcyjny deploy automatycznie.

## 6) Szybki test po wdrozeniu

Po pierwszym deployu sprawdz:
- strona glowna laduje sie poprawnie,
- formularz liczy wycene,
- mapa renderuje trase,
- endpoint health:
  - `https://<twoj-netlify-url>/api/health`

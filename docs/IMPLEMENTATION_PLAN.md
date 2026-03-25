# Plan wdrożenia v1

## 1. Co budować najpierw

Najpierw budujemy wersję, która liczy trasę i koszty dla jednego kursu od punktu A do punktu B. Bez tego każda dalsza funkcja będzie tylko dodatkiem do niegotowego fundamentu.

## 2. Kolejność prac

### Krok 1. Fundament projektu

1. Utwórz aplikację Next.js z TypeScript.
2. Dodaj Tailwind CSS.
3. Dodaj Prisma i PostgreSQL.
4. Utwórz podstawowe modele: VehicleType, Quote, Settings.
5. Dodaj seed z przykładowymi pojazdami.

### Krok 2. Formularz wyceny

1. Dodaj formularz nowej wyceny.
2. Dodaj walidację pól.
3. Dodaj wybór pojazdu.
4. Dodaj pola ładunku i kosztów dodatkowych.

### Krok 3. Integracja mapy

1. Dodaj mapę Leaflet.
2. Dodaj geokodowanie adresu startu i końca.
3. Dodaj wyznaczanie trasy.
4. Zapisz dystans i czas.

### Krok 4. Silnik kalkulacji

1. Zaimplementuj czyste funkcje kalkulacyjne.
2. Oblicz koszt paliwa.
3. Oblicz koszt kierowcy.
4. Oblicz koszt stały pojazdu.
5. Oblicz koszt opłat drogowych.
6. Oblicz marżę.
7. Zwróć pełne rozbicie kosztów.

### Krok 5. Waluty

1. Dodaj pobieranie kursu EUR/PLN.
2. Dodaj zapis daty kursu.
3. Dodaj ręczne nadpisanie kursu.
4. Dodaj prezentację wyniku w dwóch walutach.

### Krok 6. Zapis wycen

1. Zapisz wycenę w bazie.
2. Dodaj listę historii wycen.
3. Dodaj podgląd szczegółów.

### Krok 7. Eksport PDF

1. Dodaj szablon wydruku.
2. Dodaj eksport PDF z podsumowaniem wyceny.

## 3. Sugestie integracyjne

### 3.1 Mapy

Na start użyj Leaflet z OpenStreetMap jako podkładu mapy.

### 3.2 Routing

Stwórz interfejs `RoutingProvider`, aby można było podmienić źródło trasy bez przepisywania aplikacji.

### 3.3 Geokodowanie

Stwórz interfejs `GeocodingProvider` i osobny adapter dla używanego źródła.

### 3.4 Waluty

Stwórz interfejs `CurrencyProvider` z metodą pobrania kursu i daty publikacji.

### 3.5 Paliwo

Stwórz interfejs `FuelProvider`. Nawet jeśli na początku cena paliwa będzie wpisywana ręcznie, architektura ma być gotowa pod automatyzację.

## 4. Struktura katalogów

```text
transport-pricing-app/
  AGENTS.md
  docs/
    PROJECT_SPEC.md
    IMPLEMENTATION_PLAN.md
  prisma/
    schema.prisma
    seed.ts
  src/
    app/
      page.tsx
      quotes/
      settings/
      api/
    components/
      forms/
      map/
      pricing/
      ui/
    lib/
      calculators/
      providers/
      validation/
      formatters/
    server/
      services/
      repositories/
    types/
    tests/
  .env.example
  README.md
```

## 5. Najważniejsze decyzje projektowe

1. Wszystkie obliczenia wykonuj po stronie serwera oraz ewentualnie powielaj podgląd po stronie klienta.
2. Nie uzależniaj kalkulatora od jednego dostawcy map lub walut.
3. Każdą cenę i kurs zapisuj razem z datą pobrania.
4. Użytkownik musi móc poprawić wartości ręcznie.
5. Historia wycen jest obowiązkowa już na wczesnym etapie.

## 6. Co warto od razu przewidzieć

1. Cenniki dla różnych klientów.
2. Własne stawki dla przewozów krajowych i międzynarodowych.
3. Dodatkowe kraje i waluty.
4. Obsługę wielu odcinków trasy.
5. Załączniki do wycen.
6. Import danych klientów.

## 7. Pierwszy prompt do Codexa

```md
Zbuduj MVP aplikacji webowej do wyceny kosztów transportu elementów stalowych zgodnie z dokumentami AGENTS.md oraz docs/PROJECT_SPEC.md.

Zakres pierwszego etapu:
1. Next.js + TypeScript + Tailwind + Prisma + PostgreSQL.
2. Modele VehicleType, Quote i Settings.
3. Formularz nowej wyceny.
4. Wybór typu pojazdu: firanka, platforma, niskopodwozie.
5. Pola adresu załadunku i rozładunku.
6. Mapa z trasą, dystansem i czasem przejazdu.
7. Kalkulacja kosztu paliwa, kierowcy, kosztu stałego, opłat drogowych i marży.
8. Wynik w PLN i EUR.
9. Zapis wyceny do bazy.
10. Czytelny interfejs do późniejszej rozbudowy.

Zasady:
1. Integracje zewnętrzne zamykaj w adapterach.
2. Dodaj przykładowe dane seed.
3. Dodaj testy dla kalkulatora kosztów.
4. Przygotuj .env.example.
5. Opisz jak uruchomić projekt lokalnie.
```

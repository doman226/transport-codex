# AGENTS.md

## Cel repozytorium

Budujemy platformę webową do wyceny kosztów transportu elementów stalowych. System ma liczyć koszt przewozu różnymi pojazdami, pokazywać trasę na mapie, szacować koszt paliwa, opłat drogowych i pracy kierowcy oraz prezentować wynik w PLN i EUR.

## Zasady pracy dla Codexa

1. Zawsze pracuj etapami i najpierw buduj MVP.
2. Nie zgaduj danych biznesowych. Jeżeli brakuje parametrów kosztowych, dodaj ustawienia konfiguracyjne i sensowne wartości domyślne oznaczone jako przykładowe.
3. Oddziel logikę biznesową od warstwy interfejsu.
4. Każdą integrację z zewnętrznym API zamykaj w osobnym adapterze.
5. Nie wpisuj kluczy API do kodu. Używaj zmiennych środowiskowych.
6. Przy każdej zmianie dodawaj lub aktualizuj testy jednostkowe dla kalkulatora kosztów.
7. Każdy koszt licz jako osobny komponent i pokazuj użytkownikowi pełne rozbicie.
8. W przypadku braku danych z API pokaż komunikat i zastosuj bezpieczny fallback.
9. Koduj w TypeScript po stronie frontendu i backendu, o ile w dokumentacji projektu nie wskazano inaczej.
10. Zanim dodasz nową bibliotekę, sprawdź czy podobna funkcja nie istnieje już w projekcie.

## Preferowana architektura

1. Frontend: Next.js + TypeScript.
2. Backend API: Next.js Route Handlers albo osobny serwis Node.js w TypeScript.
3. Baza danych: PostgreSQL.
4. Mapa: Leaflet z podkładem OpenStreetMap.
5. Geokodowanie: adapter geocoding provider.
6. Wyznaczanie tras: adapter routing provider.
7. Kursy walut: adapter currency provider.
8. Paliwo: adapter fuel provider z ręcznym nadpisaniem.

## Etapy realizacji

1. Zbuduj strukturę projektu i modele danych.
2. Dodaj formularz wyceny transportu.
3. Dodaj mapę i wyznaczanie trasy.
4. Dodaj silnik kalkulacji kosztów.
5. Dodaj waluty PLN i EUR.
6. Dodaj zapis ofert i historii wycen.
7. Dodaj eksport PDF.
8. Dodaj role użytkowników i ustawienia administracyjne.

## Priorytety MVP

1. Jeden formularz wyceny.
2. Obsługa kilku typów pojazdów.
3. Adres startowy i docelowy.
4. Liczba kilometrów, czas przejazdu i podgląd trasy.
5. Koszt paliwa, koszt kierowcy, koszt drogi, marża i cena końcowa.
6. Wynik w PLN i EUR.
7. Możliwość ręcznej korekty danych.

## Wymagania jakościowe

1. Formularze muszą walidować dane wejściowe.
2. Wszystkie wartości pieniężne zaokrąglaj do dwóch miejsc po przecinku.
3. Wszystkie wartości masy i długości przechowuj w ustandaryzowanych jednostkach.
4. Zadbaj o responsywność widoku.
5. Zadbaj o czytelny podział na moduły: vehicles, routes, pricing, currencies, fuel, quotations, settings.

## Minimalne testy

1. Obliczenie kosztu dla trasy krajowej.
2. Obliczenie kosztu dla trasy międzynarodowej.
3. Przeliczenie PLN na EUR.
4. Fallback przy braku kursu waluty.
5. Fallback przy braku ceny paliwa.
6. Różne konfiguracje pojazdów.

## Czego nie robić na starcie

1. Nie buduj od razu rozbudowanego TMS.
2. Nie dodawaj optymalizacji wielu punktów dostawy w pierwszej wersji.
3. Nie opieraj logiki biznesowej wyłącznie na jednej zewnętrznej usłudze.
4. Nie zakładaj, że publiczne darmowe API będzie zawsze dostępne.

## Definicja ukończenia MVP

MVP jest gotowe, gdy użytkownik może wprowadzić dane trasy i ładunku, wybrać pojazd, zobaczyć przebieg na mapie, otrzymać rozbicie kosztów oraz zapisać lub wyeksportować wycenę.

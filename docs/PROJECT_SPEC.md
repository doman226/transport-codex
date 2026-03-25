# Specyfikacja projektu

## 1. Nazwa robocza

Kalkulator kosztów transportu elementów stalowych.

## 2. Cel biznesowy

System ma umożliwiać szybkie i powtarzalne liczenie kosztu dostawy elementów stalowych różnymi typami pojazdów. Narzędzie ma ograniczyć ręczne liczenie kosztów, przyspieszyć przygotowanie oferty i ujednolicić sposób kalkulacji w firmie.

## 3. Główne przypadki użycia

### 3.1 Handlowiec

Handlowiec wpisuje miejsce załadunku i rozładunku, wybiera typ pojazdu, określa parametry ładunku i otrzymuje gotową wycenę w PLN i EUR.

### 3.2 Logistyka

Pracownik logistyki sprawdza długość trasy, czas przejazdu, proponowany typ pojazdu oraz ograniczenia przewozowe.

### 3.3 Manager

Manager analizuje historię wycen, porównuje marże i aktualizuje parametry kosztowe.

## 4. Zakres MVP

### 4.1 Dane wejściowe

1. Adres załadunku.
2. Adres rozładunku.
3. Kraj startu i kraju dostawy.
4. Typ pojazdu.
5. Typ przewozu: krajowy lub międzynarodowy.
6. Waga ładunku.
7. Długość elementów.
8. Liczba sztuk.
9. Czy ładunek ponadgabarytowy.
10. Czy wymagane zezwolenia.
11. Czy potrzebny rozładunek HDS lub dźwig.
12. Waluta oferty: PLN lub EUR.
13. Marża procentowa lub kwotowa.

### 4.2 Typy pojazdów

1. Firanka.
2. Platforma.
3. Naczepa niskopodwoziowa.
4. Zestaw przestrzenny.
5. Solówka.
6. Pojazd specjalny.

Każdy typ pojazdu powinien mieć własne parametry:

1. Ładowność.
2. Maksymalna długość ładunku.
3. Średnie spalanie na 100 km.
4. Koszt kierowcy za dzień lub godzinę.
5. Średnia prędkość operacyjna.
6. Koszt kilometra stały.
7. Koszt postoju.
8. Koszt opłat drogowych.
9. Domyślna marża.

### 4.3 Wynik kalkulacji

System pokazuje:

1. Liczbę kilometrów.
2. Szacowany czas przejazdu.
3. Trasę na mapie.
4. Koszt paliwa.
5. Koszt opłat drogowych.
6. Koszt pracy kierowcy.
7. Koszt amortyzacji i koszt stały pojazdu.
8. Koszty dodatkowe.
9. Marżę.
10. Cenę końcową netto w PLN.
11. Cenę końcową netto w EUR.
12. Datę kursu walutowego.
13. Źródło danych paliwowych i walutowych.

## 5. Logika kalkulacji

### 5.1 Wzór bazowy

Koszt całkowity netto =

koszt paliwa + koszt opłat drogowych + koszt kierowcy + koszt stały pojazdu + koszt postoju + koszt dodatkowy + marża

### 5.2 Koszt paliwa

Koszt paliwa =

(kilometry / 100) × średnie spalanie × cena paliwa

### 5.3 Koszt kierowcy

Koszt kierowcy może być liczony według jednej z metod:

1. Stawka za dzień.
2. Stawka za godzinę.
3. Stawka za kilometr.

### 5.4 Koszty dodatkowe

Koszty dodatkowe obejmują na przykład:

1. Zezwolenia.
2. Pilotowanie.
3. Dźwig lub HDS.
4. Prom.
5. Opłaty graniczne.
6. Nocleg.
7. Dopłatę za ładunek ponadnormatywny.

## 6. Moduły systemu

### 6.1 Moduł mapy i trasy

Funkcje:

1. Geokodowanie adresów.
2. Wyznaczanie trasy.
3. Prezentacja trasy na mapie.
4. Odczyt dystansu i czasu przejazdu.
5. Obsługa alternatywnej trasy w przyszłości.

### 6.2 Moduł kalkulacji

Funkcje:

1. Obliczanie kosztów bazowych.
2. Obliczanie kosztów dodatkowych.
3. Wyliczanie marży.
4. Przeliczanie walut.
5. Zwracanie pełnego rozbicia ceny.

### 6.3 Moduł administracyjny

Funkcje:

1. Edycja typów pojazdów.
2. Edycja spalania.
3. Edycja domyślnych kosztów.
4. Edycja stawek kierowcy.
5. Edycja opłat dodatkowych.
6. Ustawienie domyślnego źródła walut.
7. Ustawienie domyślnego źródła cen paliwa.

### 6.4 Moduł wycen

Funkcje:

1. Zapis wyceny.
2. Odczyt historii.
3. Klonowanie wyceny.
4. Eksport PDF.
5. Eksport do Excel w dalszym etapie.

## 7. Dane zewnętrzne

### 7.1 Kursy walut

System powinien pobierać kurs EUR/PLN automatycznie i zapisywać datę kursu. Musi też umożliwiać ręczne nadpisanie kursu.

### 7.2 Ceny paliwa

System powinien mieć architekturę providerów cen paliwa. Pierwsza wersja ma wspierać:

1. Cenę automatyczną z wybranego źródła.
2. Ręczne wpisanie ceny przez użytkownika.
3. Fallback na ostatnią zapisaną cenę.

### 7.3 Trasy i geokodowanie

System powinien pobierać współrzędne punktów, wyznaczać trasę i zapisywać dystans oraz czas przejazdu.

## 8. Model danych

### 8.1 VehicleType

1. id
2. name
3. payloadKg
4. maxLengthM
5. avgFuelConsumptionPer100Km
6. costPerKm
7. driverCostPerHour
8. driverCostPerDay
9. tollCostPerKm
10. defaultMarginPercent
11. active

### 8.2 Quote

1. id
2. createdAt
3. customerName
4. loadAddress
5. unloadAddress
6. loadLat
7. loadLng
8. unloadLat
9. unloadLng
10. distanceKm
11. durationMin
12. vehicleTypeId
13. loadWeightKg
14. loadLengthM
15. itemsCount
16. isOversize
17. requiresPermit
18. requiresCrane
19. currency
20. exchangeRate
21. fuelPrice
22. fuelCost
23. tollCost
24. driverCost
25. fixedVehicleCost
26. extraCost
27. marginAmount
28. totalNet
29. notes

### 8.3 Settings

1. id
2. defaultCurrency
3. defaultFuelSource
4. defaultCurrencySource
5. companyName
6. companyAddress
7. vatRate
8. updatedAt

## 9. Widoki aplikacji

### 9.1 Dashboard

1. Ostatnie wyceny.
2. Najczęściej wybierane pojazdy.
3. Szybki przycisk nowej wyceny.

### 9.2 Nowa wycena

1. Formularz danych.
2. Wybór pojazdu.
3. Podgląd mapy.
4. Panel kalkulacji.
5. Panel wyniku.

### 9.3 Historia wycen

1. Lista.
2. Filtrowanie.
3. Wyszukiwanie.
4. Duplikowanie.
5. Eksport.

### 9.4 Ustawienia

1. Pojazdy.
2. Koszty.
3. Waluty.
4. Paliwa.
5. Integracje.

## 10. Walidacje biznesowe

1. Jeżeli długość ładunku przekracza parametr pojazdu, pokaż ostrzeżenie.
2. Jeżeli masa przekracza ładowność, zablokuj kalkulację albo zasugeruj inny pojazd.
3. Jeżeli API trasy nie zwróci wyniku, pozwól wpisać kilometry ręcznie.
4. Jeżeli cena paliwa nie jest dostępna, pokaż ostatnią zapisaną cenę i oznacz ją jako zastępczą.
5. Jeżeli kurs waluty nie jest dostępny, pokaż możliwość ręcznego wpisania kursu.

## 11. Technologie rekomendowane

### 11.1 Frontend

1. Next.js.
2. TypeScript.
3. Tailwind CSS.
4. React Hook Form.
5. Zod.
6. Leaflet.

### 11.2 Backend

1. Next.js Route Handlers lub Express.
2. TypeScript.
3. Prisma.
4. PostgreSQL.

### 11.3 Testy

1. Vitest.
2. Playwright.

## 12. Roadmapa

### Etap 1

1. Formularz wyceny.
2. Typy pojazdów.
3. Mapa i trasa.
4. Koszty podstawowe.
5. PLN i EUR.

### Etap 2

1. Historia wycen.
2. PDF.
3. Panel administracyjny.
4. Logowanie użytkowników.

### Etap 3

1. Wielopunktowe trasy.
2. Zaawansowane opłaty drogowe.
3. Cenniki klientów.
4. Integracja z CRM lub ERP.

## 13. Kryteria akceptacji MVP

1. Użytkownik może stworzyć wycenę od zera w mniej niż 3 minuty.
2. System pokazuje dystans, czas i trasę.
3. System pokazuje rozbicie kosztów.
4. System pokazuje wynik w PLN i EUR.
5. System zapisuje wycenę w bazie.
6. System działa poprawnie dla co najmniej trzech typów pojazdów.

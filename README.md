# Mapy zagrożeń OSP

Interaktywna mapa do wspólnej pracy pięciu jednostek OSP gminy Świątniki Górne.

**Działająca aplikacja:** https://foc-mapy-osp-2026.karhuz.chatgpt.site

## Dla strażaków

Wybierz swoją OSP, kategorię zagrożenia, wskaż miejsce na mapie, dodaj opis i wybierz **Zapisz zgłoszenie**. Uczestnicy nie muszą zakładać kont. Dostępne są punkty, obszary, odcinki, wspólne notatki i zestawienie CSV.

Jednostki: OSP Ochojno, OSP Olszowice, OSP Rzeszotary, OSP Świątniki Górne i OSP Wrząsowice.

## Kod a zgłoszenia

To repozytorium przechowuje kod i oryginalne mapy. Zgłoszenia, notatki, wersje wpisów i sesje uczestników są zapisywane w osobnej bazie D1 działającej aplikacji. Dane warsztatowe ani klucze dostępu nie są dołączone do repozytorium. Skopiowanie kodu nie kopiuje ani nie usuwa danych.

Uczestnik może poprawiać własne zgłoszenia w swojej sesji przeglądarki. Koordynator zalogowany przez ChatGPT może zarządzać zgłoszeniami wszystkich jednostek. Weryfikacja tożsamości koordynatora należy do hostingu; parametr `COORDINATOR_EMAIL` jest ustawiany poza kodem.

## Edycja i publikacja

Kod można edytować bezpośrednio na GitHubie lub w edytorze. Zmiana w repozytorium nie publikuje automatycznie obecnej strony. Procedurę wdrażania i ograniczenia opisuje [DEPLOYMENT.md](DEPLOYMENT.md).

## Uruchomienie lokalne

Wymagane: Node.js 22.13 lub nowszy i pnpm 11.25.0 (wersja jest określona w `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Zwykły klon korzysta z profilu `portable`. Lokalna baza D1 jest oddzielna od produkcyjnej. Przed testowaniem zapisu zastosuj lokalnie migrację z katalogu `drizzle`, zgodnie z konfiguracją środowiska Wrangler. Nigdy nie uruchamiaj testów na bazie warsztatowej.

## Kontrole

```sh
pnpm test
pnpm typecheck
pnpm build
```

Testy integracyjne używają tymczasowej bazy SQLite oraz dwóch sesji uczestników. Sprawdzają między innymi trwałość zapisu po ponownym otwarciu bazy, własność zgłoszeń, konflikty równoczesnych zmian, usuwanie i cofanie, uprawnienia koordynatora oraz walidację danych.

## Oryginalne mapy i daty

Pliki PNG w `public/maps` wyodrębniono bez zmian z aktualnej wersji prezentacji źródłowej. Ich oryginalne rozdzielczości, sumy SHA-256 i informacje źródłowe zachowano w `source-maps.json`. Widok interaktywny pomija wyłącznie otoczenie planszy; geografia, orientacja i proporcje obrazu pozostają zachowane. Pełne oryginalne plansze są dostępne z aplikacji.

Podkłady są archiwalne: studium z 2013 r., mapa podkładowa z 2000 r. Szczegółowe daty i źródła są dostępne w aplikacji oraz w pliku źródeł. Współrzędne zgłoszeń to ułamki położenia na obrazie, a nie współrzędne GPS. Kadr nie wyznacza rejonu OSP.

Materiał roboczy do warsztatów OSP  
Podkład mapowy: oficjalne materiały Gminy Świątniki Górne

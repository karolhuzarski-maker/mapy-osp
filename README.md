# Mapa zagrożeń i zasobów OSP

Interaktywne mapy do samodzielnego zgłaszania zagrożeń, zasobów i ważnych punktów przez strażaków pięciu jednostek OSP gminy Świątniki Górne. Wyniki zbiera koordynator.

**Działająca aplikacja:** https://karolhuzarski-maker.github.io/mapy-osp/

## Dla strażaków

Wybierz swoją OSP, kategorię oznaczenia, wskaż miejsce na mapie i wybierz **Wyślij zgłoszenie**. Opis jest opcjonalny; warto dopisać, co dokładnie występuje w tym miejscu i kiedy. Uczestnicy nie muszą zakładać kont. Dostępne są punkty, obszary, odcinki, własne notatki i zestawienie CSV.

Zagrożenia: P — podtopienia, O — osuwiska, W — wiatr i drzewa, A — awarie, D — utrudnienia drogowe, I — inne zagrożenie. Zasoby i ważne punkty: H — hydrant, U — ujęcie wody, Z — inny zasób / własny punkt. Przy H/U warto opisać dostęp i znany stan; samo zgłoszenie nie potwierdza sprawności. Przy Z warto wyjaśnić, co oznacza punkt, w czym może pomóc i jak do niego dotrzeć.

Każdy uczestnik widzi wyłącznie swoje zgłoszenia i notatki, a koordynator ma dostęp do wszystkich wyników. Zapis zgłoszenia od razu przekazuje je koordynatorowi. Zwykły link do OSP nie udostępnia wpisów autora.

Mapa uczestnika jest przypisana do sesji w tej przeglądarce, ważnej 30 dni. Na wspólnym urządzeniu użyj **Nowy uczestnik**, zanim rozpocznie pracę kolejna osoba. Ta funkcja uruchamia nowy, pusty zestaw map wszystkich OSP; wcześniejsze zgłoszenia pozostają u koordynatora. Wyczyszczenie danych przeglądarki lub wygaśnięcie sesji kończy możliwość edycji starych zgłoszeń przez uczestnika, ale nie usuwa ich z bazy.

Jednostki: OSP Ochojno, OSP Olszowice, OSP Rzeszotary, OSP Świątniki Górne i OSP Wrząsowice.

## Kod a zgłoszenia

To repozytorium przechowuje kod i oryginalne mapy. Zgłoszenia, notatki, wersje wpisów i sesje uczestników są zapisywane w osobnej bazie D1 działającej aplikacji. Dane warsztatowe ani klucze dostępu nie są dołączone do repozytorium. Skopiowanie kodu nie kopiuje ani nie usuwa danych.

Uczestnik może poprawiać własne zgłoszenia w swojej sesji przeglądarki. Koordynator zalogowany przez ChatGPT może zarządzać zgłoszeniami wszystkich jednostek. Weryfikacja tożsamości koordynatora należy do hostingu; parametr `COORDINATOR_EMAIL` jest ustawiany poza kodem.

## Edycja i publikacja

Kod można edytować bezpośrednio na GitHubie lub w edytorze. Zapis zmian do `main` uruchamia testy, budowanie i publikację widoku mapy w GitHub Pages. Serwer API i baza danych działają osobno w istniejącym projekcie Sites; zmiany kodu serwera wymagają jego osobnego wdrożenia. Szczegóły opisuje [DEPLOYMENT.md](DEPLOYMENT.md).

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
pnpm build:pages
```

Testy integracyjne używają tymczasowej bazy SQLite i niezależnych sesji uczestników. Sprawdzają izolację zgłoszeń, liczników i notatek, aktualizację istniejącej bazy bez utraty danych, trwałość zapisu, konflikty zmian, usuwanie i cofanie, uprawnienia koordynatora oraz zgłoszenia z pustym lub krótkim opisem. Test klienta sprawdza zmianę uczestnika, spóźnione odpowiedzi oraz błędy przechowywania sesji.

## Oryginalne mapy i daty

Pliki PNG w `public/maps` wyodrębniono bez zmian z aktualnej wersji prezentacji źródłowej. Ich oryginalne rozdzielczości, sumy SHA-256 i informacje źródłowe zachowano w `source-maps.json`. Widok interaktywny pomija wyłącznie otoczenie planszy; geografia, orientacja i proporcje obrazu pozostają zachowane. Pełne oryginalne plansze są dostępne z aplikacji.

Podkłady są archiwalne: studium z 2013 r., mapa podkładowa z 2000 r. Szczegółowe daty i źródła są dostępne w aplikacji oraz w pliku źródeł. Współrzędne zgłoszeń to ułamki położenia na obrazie, a nie współrzędne GPS. Kadr nie wyznacza rejonu OSP.

Materiał roboczy do warsztatów OSP  
Podkład mapowy: oficjalne materiały Gminy Świątniki Górne

# Publikowanie mapy OSP

## Adres dla strażaków

https://karolhuzarski-maker.github.io/mapy-osp/

Widok mapy działa w GitHub Pages. Nie przekierowuje użytkownika na inną domenę. Zapis i odczyt zgłoszeń odbywa się przez API istniejącej aplikacji: `https://foc-mapy-osp-2026.karhuz.chatgpt.site/api/map`.

## Automatyczna publikacja widoku

Zmiana w `main` uruchamia `.github/workflows/checks.yml`. Workflow instaluje zależności, wykonuje testy, sprawdza typy, buduje część serwerową do kontroli zgodności i buduje widok statyczny poleceniem `pnpm build:pages`. Udane wykonanie publikuje katalog `dist-pages` w GitHub Pages. Pull requesty uruchamiają kontrole bez publikowania.

Źródło Pages w ustawieniach repozytorium musi być ustawione na **GitHub Actions**. Nie jest potrzebna własna domena ani konfiguracja DNS.

## API i baza danych

Zgłoszenia, notatki i sesje uczestników pozostają w bazie D1 istniejącego projektu Sites. GitHub Pages nie przechowuje danych warsztatowych. Widok korzysta z tokenu sesji w nagłówku `X-OSP-Session`; nie wymaga zewnętrznych cookies. API dopuszcza żądania przeglądarkowe wyłącznie z własnej domeny i `https://karolhuzarski-maker.github.io`. Dostęp koordynatora przez nagłówki platformy jest wyłączony dla żądań z innej domeny. Wejście koordynatora prowadzi do istniejącej aplikacji i jej logowania.

Zmiany serwera (`app/api`, `lib/map-service.ts`, `lib/map-http.ts`, migracje bazy) nie są publikowane do Sites przez workflow Pages. Trzeba zlecić ich wdrożenie w ChatGPT Work do istniejącego projektu wskazanego w `.openai/hosting.json`. Należy zachować ten sam projekt, aby korzystać z obecnej bazy i adresu API. Sekrety i uprawnienia wdrażania pozostają poza repozytorium.

Pliki migracji opisują schemat, ale nie zawierają zgłoszeń. Samo sklonowanie repozytorium nie kopiuje ani nie usuwa danych. Testy korzystają z oddzielnej tymczasowej bazy SQLite.

## Samodzielny hosting serwera

Przed uruchomieniem poza Sites trzeba skonfigurować Cloudflare Workers, bazę D1 i bezpieczne uwierzytelnianie koordynatora. Nie można ufać nagłówkom tożsamości przysłanym przez użytkownika. Migracja produkcyjnej bazy wymaga kopii danych i sprawdzenia uprawnień.

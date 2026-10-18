# Publikowanie zmian i ciągłość danych

## Stan po przeniesieniu kodu

- Kod jest przechowywany w repozytorium `karolhuzarski-maker/mapy-osp`.
- Działająca aplikacja pozostaje pod adresem https://foc-mapy-osp-2026.karhuz.chatgpt.site.
- Zgłoszenia i notatki pozostają w bazie D1 tego samego projektu Sites. Przeniesienie kodu nie jest migracją bazy.
- Zmiany w `main` same nie publikują strony. Kontrole w GitHub Actions nie stanowią wdrożenia produkcyjnego.

## Publikacja z pomocą ChatGPT Work

1. Wskaż to repozytorium i zleć wdrożenie zmian do istniejącej mapy OSP.
2. Agent pobiera wybrany commit, wykonuje testy i buduje aplikację.
3. Publikacja musi aktualizować istniejący projekt Sites wskazany w `.openai/hosting.json`. Nie należy tworzyć nowego projektu, jeżeli celem jest zachowanie tej samej bazy i adresu.
4. Po publikacji sprawdź zapis i odczyt zgłoszeń. Próby techniczne usuń po weryfikacji.

Metadane `.openai/hosting.json` identyfikują istniejący projekt i powiązanie `DB`; nie są hasłem ani kluczem. Uprawnienia wdrażania i sekrety są obsługiwane poza repozytorium.

## Samodzielny hosting i automatyczne wdrożenia

Samo GitHub Pages nie uruchamia serwerowej części aplikacji ani bazy D1. Przed uruchomieniem poza Sites trzeba skonfigurować hosting Cloudflare Workers, bazę D1 i bezpieczne uwierzytelnienie koordynatora. Obecna konfiguracja korzysta z zaufanych nagłówków i punktów logowania udostępnianych przez Sites — poza tą platformą nie można traktować nagłówków wysłanych przez użytkownika jako dowodu tożsamości.

Automatyczna publikacja z GitHuba wymaga autoryzowanego połączenia z wybranym hostingiem. W tym repozytorium nie ma kluczy do hostingu ani eksportu danych produkcyjnych. Przed właściwą migracją należy wykonać kopię bazy, przenieść schemat i rekordy oraz zweryfikować uprawnienia. Samo zastosowanie plików migracji tworzy schemat, ale nie przenosi istniejących zgłoszeń.

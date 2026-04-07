# Frontend

React + TypeScript + Vite frontend med search-first UX, enkel komponentstruktur og direkte integration mod .NET backend. V1 fokuserer på praktisk værdi: hurtig søgning, lav visuel støj og tydelig feedback.

## V1 funktioner

- stor søgeflade til hele artikelbasen
- filtre på område, type, tag, shopping list, status og lagerstatus
- tydelige match-signaler for lignende eller mulige dubletter
- hurtig opret og redigér af artikler
- forslag til lignende artikler før gem
- separat shopping workspace med inline lageropdatering
- toasts, loading-states, error-states og tomme visninger
- light, dark og system theme

## Struktur

- `src/pages`: sidekompositioner
- `src/components/layout`: app-shell og header
- `src/components/navigation`: navigation og theme switcher
- `src/components/articles`: søgepanel, kort, grid og editor-form
- `src/components/shopping`: shopping workspace og kompakt preview
- `src/components/forms`: små formularbyggesten
- `src/components/feedback`: toasts, dialogs og status-kort
- `src/services`: API-kald og søgeindsigter
- `src/theme`: theme provider og hook
- `src/types`: delte typer
- `src/styles`: global styling og design tokens

Strukturen er holdt flad og simpel. Der er ingen global state manager eller UI-framework i V1.

## Lokal opstart

### Krav

- Node.js
- npm
- backend kørende på `http://localhost:5080`

### Start frontend

```bash
cd frontend
npm install
npm run dev
```

Udviklingsserveren kører på `http://localhost:5173`.
Frontend kalder altid relative `/api` endpoints. I dev proxyer Vite `/api` til backend på `http://localhost:5080`.

## Docker

Frontend bruger en enkel multi-stage Dockerfile i [frontend/Dockerfile](frontend/Dockerfile):

1. bygger Vite app
2. serverer statiske filer med Nginx

Nginx-konfigurationen i [frontend/nginx.conf](frontend/nginx.conf) gør to ting:

- serverer SPA på `/`
- proxyer `/api` videre til backend-containeren (`http://backend:8080`)

Der bruges ingen frontend build-env for API base URL. Frontend kalder `/api`, og Nginx proxyer videre til backend-containeren.

Kør samlet løsning fra roden:

```bash
docker-compose up --build
```

Frontend er derefter tilgængelig på `<http://localhost:8080>`.

## Hvordan frontend bruges i V1

### Inventory view

- søg og filtrér i eksisterende artikler
- se match-signaler og hurtige handlinger på hvert kort
- opret eller redigér artikler i højre side
- få forslag til lignende artikler før gem

### Shopping view

- se alle lagerartikler markeret til indkøb
- opdatér beholdning direkte i listen
- ryd en vare manuelt hvis den ikke længere skal købes

## Loading, fejl og tomme visninger

- første load viser en enkel status-visning i stedet for tom skærm
- refresh under søgning vises uden at skjule eksisterende data
- netværksfejl forsøger at give mere konkrete beskeder fra backend
- tomme visninger forklarer næste naturlige handling

## Theme

Appen understøtter:

- `system`
- `light`
- `dark`

Når `system` er valgt, følger UI brugerens aktuelle OS-theme. Den aktuelle afledte tilstand vises i headeren, så det er tydeligt hvad der faktisk bruges.

## Bemærkning om lokal miljøblokering

På denne maskine har Vite/esbuild tidligere været blokeret af lokal policy. Kildekoden og editor-diagnostik er valideret, men hvis `npm run dev` eller `npm run build` fejler lokalt, er det sandsynligvis miljøet og ikke app-koden.

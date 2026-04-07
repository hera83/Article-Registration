# Backend

Lille .NET 10 Web API til Article Registration. Backend bruger SQLite, EF Core, minimal API-endpoints og et enkelt service-lag. Målet er en sund V1 med lav kompleksitet og tydelig adfærd.

## V1 funktioner

- artikelregister med opret, læs, opdater, arkiver og genaktiver
- søgning på navn, tags, mærke, model og note
- simple filtre på område, type, shopping list, status og lagerstatus
- områder og tags som lette lookup-data til formularer og filtre
- indkøbslisteflow til lagerartikler
- automatisk fjernelse fra indkøbslisten når beholdning sættes over `0`
- seed-data så appen er brugbar fra første start

## Arkitektur

- `Domain`: entiteter og enums
- `Data`: `AppDbContext`, EF-konfigurationer, migrationer og seed-data
- `Services`: forretningslogik, validering og enkel logging
- `Endpoints`: HTTP-ruter og fælles fejlrespons for V1
- `App_Data`: SQLite databasefil oprettes her automatisk

Der er bevidst ikke tilføjet CQRS, mediator, events eller ekstra lag. Minimal API + services er nok til denne version.

## Domænemodel

### Entiteter

- `Article`: almindelige artikler og lagerartikler
- `Area`: ét område pr. artikel
- `Tag`: globale tags på tværs af områder
- `ArticleTag`: join-tabel til mange-til-mange mellem artikler og tags

### Bevidste V1-valg

- ingen pris, økonomi eller indkøbshistorik
- ingen avanceret lokationsstruktur ud over `TypicalLocation`
- beholdning giver kun mening for lagerartikler
- sletning er ikke med; arkivering er den sikre standard

## API-overblik

### Artikler

- `GET /api/articles`
- `GET /api/articles/{id}`
- `POST /api/articles`
- `PUT /api/articles/{id}`
- `PATCH /api/articles/{id}/quantity`
- `PATCH /api/articles/{id}/archive`
- `PATCH /api/articles/{id}/reactivate`

### Søgning og filtre

`GET /api/articles` understøtter:

- `query`
- `articleType`
- `area`
- `tag`
- `onShoppingList`
- `status`
- `stockStatus`

Søgningen er stadig enkel i V1, men matcher nu praktisk på flere ord og flere felter uden tung søgemotor.

### Lookups

- `GET /api/areas`
- `POST /api/areas`
- `GET /api/tags?q=...`
- `POST /api/tags`

Områder og tags kan oprettes direkte for at holde frontend enkel. Navne håndteres case-insensitivt.

### Indkøbsliste og lager

- `GET /api/articles/shopping-list`
- `PATCH /api/articles/{id}/shopping-list`
- `DELETE /api/articles/{id}/shopping-list`
- `PATCH /api/articles/{id}/run-out`
- `PATCH /api/articles/{id}/restock`

Indkøbslisten er bevidst ikke et separat subsystem. Den er et hurtigt arbejdsflow oven på artikeldata.

## Validering og fejl

- services afviser ugyldige request-data med klare fejlbeskeder
- endpoints returnerer enkle valideringsfejl og standardiserede not found-responser
- uventede fejl returneres som almindelige problem-responser
- service-laget logger meningsfulde ændringer som oprettelse, opdatering, restock og nye lookups

## Lokal opstart

### Krav

- .NET SDK 10

### Start backend

```bash
cd backend/ArticleRegistration.Api
dotnet run
```

API kører lokalt på `http://localhost:5080`.

Swagger er tilgængelig i development på `http://localhost:5080/swagger`.

## Docker

Backend har en enkel multi-stage Dockerfile i [backend/ArticleRegistration.Api/Dockerfile](backend/ArticleRegistration.Api/Dockerfile).

I Compose køres backend med:

- port mapping `5000:8080`
- miljøvariabler:
  - `ASPNETCORE_ENVIRONMENT=Production`
  - `ASPNETCORE_URLS=http://+:8080`
  - `ConnectionStrings__ArticleRegistration=Data Source=App_Data/article-registration.db`
- volume til SQLite: `backend-data:/app/App_Data`

Ved container-opstart oprettes `App_Data`, migrationer anvendes, og databasen bliver klar automatisk.

Kør samlet løsning fra roden:

```bash
docker-compose up --build
```

Backend er derefter tilgængelig på `http://localhost:5000` (Swagger: `http://localhost:5000/swagger`).

## Hvordan databasen oprettes

Connection string ligger i `appsettings.json` og peger på:

```text
App_Data/article-registration.db
```

Ved opstart sker dette automatisk:

1. `App_Data` mappen oprettes hvis den mangler
2. EF Core migrationer anvendes via `Database.Migrate()`
3. seed-data indsættes via model-seeding

Der er derfor ikke behov for ekstra setup for at få en lokal database i gang.

Hvis du vil køre migrationer manuelt senere, kan du stadig bruge EF Core CLI fra projektmappen.

## Seed-data i V1

Ved første start oprettes blandt andet:

- områder som `IT`, `Homelab`, `Auto`, `Vaerksted`, `El`, `VVS`
- tags som `netvaerk`, `cat6`, `rj45`, `homelab`, `server`, `olie`, `renault`, `vaerktoej`
- eksempelartikler til netværk, homelab, auto, værktøj og installation

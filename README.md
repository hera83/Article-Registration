# Artikelregistrering

En lille, hurtig webapp til at holde styr på **artikler, indkøbslister, områder og tags** — bygget med React, Vite, Tailwind og shadcn/ui.

Projektet er bygget i [Lovable](https://lovable.dev) og kører som standard mod **Lovable Cloud** (managed Postgres + auth). Det kan også køres **fuldt self-hosted** på din egen server med Docker — uden Lovable, uden Supabase, kun Postgres + en lille Fastify-API.

---

## Funktioner

- 📝 Opret, redigér og slet artikler med titel, beskrivelse, type, område og tags
- 🔎 Hurtig søgning og filtrering på type, område og tags
- 🏷️ Tag-autocomplete baseret på eksisterende tags (godt for stavefejl)
- 🛒 Indkøbsliste med noter
- 🌗 Lyst/mørkt tema
- 📱 Responsivt design

---

## To driftsformer

| Mode | Standard? | Backend | Hvornår |
|---|---|---|---|
| **Hosted (Lovable)** | ✅ | Lovable Cloud (managed Postgres) | Når du arbejder i Lovable eller bruger den hostede preview/published version |
| **Local self-hosted** | — | PostgreSQL + bundlet Fastify-API i Docker | Når du selv vil hoste det på din egen server |

UI'et er identisk i begge modes. Skiftet sker via en **DataAdapter** (`src/data/`) — hooks kalder aldrig Supabase eller `fetch` direkte.

> 📘 Detaljeret self-hosted dokumentation: se [LOCAL_SETUP.md](./LOCAL_SETUP.md).

---

## Hosted mode (Lovable)

Du behøver ikke gøre noget. Åbn projektet i Lovable, og det kører.

- **Preview URL**: opdateres automatisk i Lovable
- **Backend**: Lovable Cloud (Postgres + auth) — administreres fra Lovable-projektet
- **Deploy**: tryk *Publish* i Lovable

Lokal udvikling mod hosted backend:

```bash
npm install
npm run dev
```

Åbn <http://localhost:8080>. `.env` med Lovable Cloud-variabler genereres automatisk af Lovable.

---

## Local self-hosted mode — installation

Med Docker får du **én container** med frontend + API + en separat Postgres-container. Ingen Supabase, ingen Lovable, ingen cloud-afhængigheder.

### Krav

- **Docker** 24+ med `docker compose`-pluginnet
- En fri port på serveren (default `8080`)

### 1. Hent koden

```bash
git clone <din-repo-url> artikelregistrering
cd artikelregistrering
```

### 2. Lav en `.env.local`

```bash
cp .env.local.example .env.local
```

Åbn `.env.local` og **skift som minimum `POSTGRES_PASSWORD`**:

```env
POSTGRES_USER=app
POSTGRES_PASSWORD=skift-mig-til-noget-stærkt
POSTGRES_DB=artikelregistrering
APP_PORT=8080
```

| Variabel | Beskrivelse |
|---|---|
| `POSTGRES_USER` | Brugernavn til den lokale Postgres |
| `POSTGRES_PASSWORD` | **Skift altid denne** |
| `POSTGRES_DB` | Databasenavn |
| `APP_PORT` | Hvilken port på værten appen eksponeres på |

### 3. Byg og start

```bash
docker compose -f docker-compose.local.yml --env-file .env.local up --build -d
```

Første kørsel tager 1–3 minutter (bygger frontend + backend). Containeren:

1. Starter Postgres 16 med en persistent volume (`db-data`)
2. Kører SQL-migrationer fra `server/sql/` (idempotent)
3. Serverer REST-API'et på `/api/*`
4. Serverer den byggede React-app på alt andet

### 4. Åbn appen

<http://localhost:8080> (eller hvilken `APP_PORT` du valgte).

### Logs

```bash
docker compose -f docker-compose.local.yml logs -f app
docker compose -f docker-compose.local.yml logs -f db
```

### Opdatér til ny version

```bash
git pull
docker compose -f docker-compose.local.yml --env-file .env.local up --build -d
```

Migrationer i `server/sql/` køres automatisk ved boot.

### Stop / fjern

```bash
# Stop, behold data
docker compose -f docker-compose.local.yml down

# Stop og slet databasen også
docker compose -f docker-compose.local.yml down -v
```

### Backup af databasen

```bash
docker compose -f docker-compose.local.yml exec db \
  pg_dump -U app artikelregistrering > backup-$(date +%F).sql
```

Restore:

```bash
cat backup-2026-05-04.sql | docker compose -f docker-compose.local.yml exec -T db \
  psql -U app -d artikelregistrering
```

### Kør bag en reverse proxy (Caddy / Nginx / Traefik)

Appen lytter på `APP_PORT` (default `8080`) over rent HTTP. Sæt din reverse proxy til at terminere TLS og proxy'e til `http://localhost:8080`.

Eksempel — Caddy:

```caddy
artikler.eksempel.dk {
    reverse_proxy localhost:8080
}
```

---

## Udvikling uden Docker (local mode)

To terminaler:

```bash
# Terminal 1: backend
cd server
npm install
DATABASE_URL=postgres://app:app@localhost:5432/artikelregistrering npm run migrate
DATABASE_URL=postgres://app:app@localhost:5432/artikelregistrering npm run dev
```

```bash
# Terminal 2: frontend mod den lokale backend
VITE_DATA_MODE=rest VITE_API_URL=http://localhost:3001/api npm run dev
```

---

## Projektstruktur

```
.
├── src/
│   ├── components/      # UI-komponenter (shadcn/ui + custom)
│   ├── pages/           # Sider (Index, ShoppingList, Settings, NotFound)
│   ├── hooks/           # React Query-hooks (useArticles, useAreas, useTags)
│   ├── data/            # ⭐ DataAdapter — vælger Supabase eller REST
│   │   ├── types.ts
│   │   ├── supabase-adapter.ts
│   │   ├── rest-adapter.ts
│   │   └── index.ts
│   ├── lib/             # Hjælpefunktioner
│   └── integrations/    # Auto-genereret Supabase-klient (rør ikke)
├── server/              # Self-hosted Fastify-backend (kun local mode)
│   ├── src/             # API + migrations runner
│   └── sql/             # SQL-skemamigrations
├── Dockerfile           # Multi-stage build: frontend + backend → 1 image
├── docker-compose.local.yml
├── .env.local.example
└── LOCAL_SETUP.md       # Detaljeret self-hosted guide
```

---

## Tech stack

- **Frontend**: React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui, React Query, React Router
- **Hosted backend**: Lovable Cloud (Postgres)
- **Self-hosted backend**: Fastify + `pg` + PostgreSQL 16
- **Containerisering**: Docker + Docker Compose

---

## Bidrag og Lovable

Ændringer lavet i Lovable bliver automatisk committet til repoet. Du kan også arbejde lokalt og pushe — Lovable synker den anden vej. Self-hosted opsætningen påvirker ikke Lovable-workflowet.

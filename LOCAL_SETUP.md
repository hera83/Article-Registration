# Self-hosted (local) mode

This project supports two completely separate runtime modes:

| Mode | Default? | Backend | Activated by |
|---|---|---|---|
| **Hosted / Lovable** | ✅ yes | Supabase (managed by Lovable Cloud) | nothing — works out of the box in Lovable |
| **Local self-hosted** | no | PostgreSQL + bundled TypeScript API | `VITE_DATA_MODE=rest` at build time |

The frontend talks to a small **DataAdapter** (`src/data/`). Hooks never call
Supabase or `fetch` directly, so swapping backend is a one-line change.

---

## Running locally with Docker Compose

Requirements: Docker 24+ with the `compose` plugin.

```bash
cp .env.local.example .env.local
# edit .env.local — at minimum set POSTGRES_PASSWORD

docker compose -f docker-compose.local.yml --env-file .env.local up --build -d
```

Then open <http://localhost:3001>.

What happens:

1. `db` — PostgreSQL 16 with a persistent volume (`db-data`).
2. `app` — single container that:
   - runs `server/sql/*.sql` migrations on boot (idempotent),
   - serves the REST API on `/api/*`,
   - serves the built React app for everything else.

Logs:

```bash
docker compose -f docker-compose.local.yml logs -f app
```

Tear down (keep data):

```bash
docker compose -f docker-compose.local.yml down
```

Tear down (drop data too):

```bash
docker compose -f docker-compose.local.yml down -v
```

---

## Running the backend without Docker

```bash
cd server
npm install
DATABASE_URL=postgres://app:app@localhost:5432/artikelregistrering npm run migrate
DATABASE_URL=postgres://app:app@localhost:5432/artikelregistrering npm run dev
```

Then run the frontend in another terminal pointing at it:

```bash
VITE_DATA_MODE=rest VITE_API_URL=http://localhost:3001/api npm run dev
```

---

## Environment variables

### Frontend (build time, Vite)

| Variable | Default | Description |
|---|---|---|
| `VITE_DATA_MODE` | `supabase` | `supabase` (hosted) or `rest` (self-hosted) |
| `VITE_API_URL` | `/api` | Base URL of the REST API in `rest` mode |

### Backend (runtime)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — (required) | Postgres connection string |
| `PORT` | `3001` | Port to listen on |
| `HOST` | `0.0.0.0` | Bind address |
| `STATIC_DIR` | `<app>/server/public` | Folder with the built frontend (optional) |
| `PG_POOL_MAX` | `10` | Max DB pool connections |

---

## Why this architecture?

- **Hosted mode is untouched.** `VITE_DATA_MODE` defaults to `supabase`, and
  the Supabase adapter contains the exact same calls that previously lived
  inline in the hooks. Lovable preview, deploy and Cloud all keep working.
- **No self-hosted Supabase.** The local stack is just Postgres + a small
  Fastify API — no GoTrue, PostgREST, Realtime, Storage, Studio or Kong.
  Far fewer moving parts to operate on your server.
- **One container in production.** The Dockerfile bakes the built React app
  into the API image, so the frontend ships from the same Fastify process.
  Less to deploy, less to break, no CORS in production.
- **Adapter, not fork.** Both modes share UI, hooks, types and React Query
  cache keys. Adding a new endpoint means adding it once to
  `DataAdapter` and implementing it in both adapters.

---

## Schema parity

`server/sql/001_init.sql` is the source of truth for local mode and mirrors
the Supabase schema (`areas`, `tags`, `articles`, `article_tags`, the
`article_type` enum, and the `updated_at` trigger). Keep them in sync when
you add columns.

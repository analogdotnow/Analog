## Cursor Cloud specific instructions

### Overview

Analog is an open-source calendar app. Monorepo with Turborepo + Bun workspaces: one Next.js 16 app (`apps/web`) and many shared packages under `packages/` and `tooling/`.

### Docker image fix

The `docker-compose.yml` references `bitnami/postgresql:15` which is no longer available on Docker Hub. In the Cloud Agent environment, it has been replaced with `postgres:15` (official image). If you see `manifest unknown` errors from `docker compose up`, ensure the image is set to `postgres:15`.

### Starting services

1. **Docker containers** (PostgreSQL, Redis, Upstash Redis HTTP proxy): `docker compose up -d` — wait for `analog_db` to be healthy before proceeding.
2. **Database schema**: `bun run db:push` — pushes Drizzle schema to PostgreSQL. Only needed after schema changes or fresh DB.
3. **Dev server**: `bun run dev` — starts Next.js 16 with Turbopack on port 3000.

### Key commands

See `package.json` scripts. Summary:
- `bun run lint` — ESLint across all packages (0 errors expected, warnings are OK)
- `bun run type-check` — TypeScript type checking across all packages
- `bun run format` — Prettier formatting
- `bun run db:studio` — Drizzle Studio for database inspection
- `bun run docker:down` / `bun run docker:clean` — stop/clean Docker containers

### Environment variables

`.env` is created from `.env.example`. Most optional vars can be left blank in dev (env validation is skipped when `NODE_ENV !== "production"`). The required minimum for the app to start:
- `DATABASE_URL` — defaults to `postgresql://postgres:postgres@localhost:5432/analog_db`
- `BETTER_AUTH_SECRET` — generate with `openssl rand -hex 32`
- `BETTER_AUTH_URL` — `http://localhost:3000`
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — defaults point to local Docker proxy

### Authentication

Google OAuth (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`) is required to actually sign in. Without it, the app loads the landing page and login page but sign-in won't complete. These are injected as environment secrets — when present, write them into `.env` before starting the dev server. A test Google account (added as a test user in the OAuth consent screen) is needed to complete the sign-in flow.

### Composio API key gotcha

`COMPOSIO_API_KEY` is marked optional in the env schema, but `packages/ai/src/lib/composio.ts` eagerly instantiates `new Composio(...)` at module load time. This module is imported by the tRPC root router, so if the key is missing, **all** tRPC API calls (`calendars.list`, `user.me`, `events.list`) crash with 500. Set `COMPOSIO_API_KEY=placeholder` in `.env` to prevent this. The placeholder won't enable AI features, but it lets the tRPC router load.

### Notes

- The project uses `bun` as package manager (lockfile: `bun.lock`, config: `bunfig.toml` with hoisted linker). The user prefers `bun` commands except for `install` at the root.
- React Compiler is used (`"use memo"` directive) — do not add `useCallback`/`useMemo` manually.
- No test suite exists in this repo; the user has stated "don't write tests".

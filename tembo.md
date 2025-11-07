# Analog Monorepo Documentation

This document serves as the technical source of truth for the Analog monorepo, covering architecture, structure, dependencies, workflows, and configuration requirements.

## Table of Contents

- [Overview](#overview)
- [Monorepo Structure](#monorepo-structure)
- [Tech Stack](#tech-stack)
- [Development Setup](#development-setup)
- [Environment Variables](#environment-variables)
- [Scripts and Commands](#scripts-and-commands)
- [Database Management](#database-management)
- [Authentication & Authorization](#authentication--authorization)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)

## Overview

Analog is an open-source calendar application built with modern web technologies. The project uses a Turborepo monorepo structure with Bun as the package manager and runtime.

**Key Characteristics:**
- **Package Manager**: Bun 1.3.0
- **Monorepo Tool**: Turborepo 2.5.6
- **Primary Framework**: Next.js 15.5.6
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with OAuth providers (Google, Microsoft, Zoom)

## Monorepo Structure

The repository is organized into three main workspace categories:

### Apps (`apps/`)

- **`web/`** – Main Next.js application
  - Frontend web interface built with React 19.1.1
  - Uses Next.js App Router with Turbopack in development
  - Runs on port 3000 by default

### Packages (`packages/`)

Core functionality organized into focused packages:

- **`ai/`** – AI integration utilities and providers
- **`api/`** – tRPC API router definitions and endpoints
  - Exports: root router, tRPC utilities, interfaces, OpenAPI schema
  - Includes MCP (Model Context Protocol) support via trpc-to-mcp
- **`auth/`** – Authentication configuration and utilities
  - Client-side and server-side auth exports
  - Better Auth integration with Drizzle adapter
  - OAuth provider configurations
- **`db/`** – Database schema and client
  - Drizzle ORM schemas and migrations
  - PostgreSQL connection management
- **`env/`** – Environment variable validation using @t3-oss/env-nextjs
- **`google-calendar/`** – Google Calendar API integration
- **`google-maps-places/`** – Google Maps Places API wrapper
- **`google-maps-routes/`** – Google Maps Routes API wrapper
- **`google-people/`** – Google People API integration
- **`google-tasks/`** – Google Tasks API integration
- **`meeting-links/`** – Meeting link detection and parsing (@analog/meeting-links)
- **`providers/`** – Unified provider interfaces and implementations
- **`schemas/`** – Shared Zod validation schemas
- **`temporal/`** – Temporal API utilities and date/time handling
- **`timezone-coordinates/`** – Timezone and coordinate utilities

### Tooling (`tooling/`)

- **`eslint-config/`** – Shared ESLint configuration
- **`typescript-config/`** – Shared TypeScript configuration

## Tech Stack

### Frontend
- **Framework**: Next.js 15.5.6 with React 19.1.1
- **Styling**: Tailwind CSS v4.1.12 with @tailwindcss/postcss
- **UI Components**:
  - Radix UI primitives (alert-dialog, avatar, checkbox, dialog, dropdown-menu, etc.)
  - shadcn/ui component patterns
  - Ariakit for accessible components
- **State Management**:
  - Jotai 2.13.1 for atomic state
  - TanStack Query 5.90.5 for server state
- **Forms**: TanStack Form 1.19.3 with Zod validation
- **Animations**: Motion 12.23.12
- **Icons**: Heroicons, Lucide React, Remixicon, Simple Icons

### Backend
- **API Layer**: tRPC 11.5.0 with OpenAPI support (trpc-to-openapi)
- **Database**:
  - PostgreSQL (via Docker, Bitnami image v15)
  - Drizzle ORM 0.44.6
  - Drizzle Kit 0.31.4 for migrations
- **Authentication**: Better Auth 1.3.28
  - OAuth providers: Google, Microsoft, Zoom
  - Session management with Upstash Redis
- **Caching**: Upstash Redis with @upstash/redis and @upstash/ratelimit
- **AI Integration**:
  - Vercel AI SDK 5.0.76
  - OpenAI SDK integration (@ai-sdk/openai)
  - Composio Core 0.1.52 for AI tool orchestration
- **Date/Time**:
  - Temporal API polyfill (temporal-polyfill 0.3.0)
  - temporal-zod for validation
  - rrule-temporal for recurrence rules
  - @internationalized/date
  - date-fns, chrono-node

### Developer Experience
- **TypeScript**: 5.9.2
- **Linting**: ESLint 9.38.0 with typescript-eslint
- **Formatting**: Prettier 3.6.2 with sort-imports and Tailwind plugins
- **Monorepo**: Turborepo 2.5.6 with caching and parallel execution
- **Runtime**: Bun 1.3.0
- **Development**: Turbopack for fast HMR

### External Services
- **Error Tracking**: Sentry (@sentry/nextjs 10.20.0)
- **Analytics**: Simple Analytics (via @simpleanalytics/next)
- **CMS**: Marble Blog API integration
- **APIs**:
  - Google Calendar API
  - Google Maps API (Places, Routes)
  - Google People API
  - Google Tasks API
  - Microsoft Graph API (@microsoft/microsoft-graph-client)
  - Zoom API
- **AI/Automation**:
  - Composio API for AI agent actions
  - Firecrawl API for web scraping (@mendable/firecrawl-js)
  - Browserbase API for browser automation (@browserbasehq/sdk)

### Unique Features
- **Desktop Support**: ToDesktop integration (@todesktop/client-core)
- **Rich Text Editing**: Tiptap 2.26.1 with mention support
- **Natural Language Parsing**: chrono-node for date/time extraction
- **Offline Support**: Dexie (IndexedDB wrapper) with React hooks
- **Virtual Scrolling**: TanStack Virtual for performance

## Development Setup

### Prerequisites

1. **Bun** (v1.3.0 or compatible)
   - Install: https://bun.sh/docs/installation

2. **Docker Desktop** (for PostgreSQL and Redis)
   - Install: https://www.docker.com/products/docker-desktop/

3. **Node.js** (for tooling compatibility if needed)

### Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/analogdotnow/analog.git
cd analog

# 2. Install dependencies
bun install

# 3. Copy environment variables
cp .env.example .env

# 4. Configure .env file
# - Set BETTER_AUTH_SECRET (generate with: openssl rand -hex 32)
# - Configure OAuth credentials (see Environment Variables section)

# 5. Start Docker services (PostgreSQL + Redis)
bun run docker:up

# 6. Initialize database
bun run db:push

# 7. Start development server
bun run dev
```

The application will be available at http://localhost:3000.

### OAuth Provider Setup

#### Google OAuth (Required)
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Configure OAuth consent screen and credentials (see [Better Auth Google docs](https://www.better-auth.com/docs/authentication/google))
3. Enable required APIs:
   - Google Calendar API
   - Google People API (for contacts)
   - Google Tasks API (optional)
4. Add test users in OAuth consent screen
5. Set redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add credentials to `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

#### Microsoft OAuth (Optional)
1. Navigate to [Azure Portal](https://portal.azure.com/) → Microsoft Entra ID → App registrations
2. Register application with redirect URI: `http://localhost:3000/api/auth/callback/microsoft`
3. Copy Application (client) ID
4. Create client secret under Certificates & secrets
5. Add API permissions (Microsoft Graph → Delegated):
   - `Calendars.Read`
   - `Calendars.ReadWrite`
   - `User.Read`
   - `offline_access`
6. Add credentials to `.env`:
   ```
   MICROSOFT_CLIENT_ID=your_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret
   ```

#### Zoom OAuth (Optional)
1. Create a Zoom app in [Zoom App Marketplace](https://marketplace.zoom.us/)
2. Configure OAuth with required scopes
3. Add credentials to `.env`:
   ```
   ZOOM_CLIENT_ID=your_client_id
   ZOOM_CLIENT_SECRET=your_client_secret
   ```

#### Google Maps API (Optional)
1. Enable Places API (New) in [Google Cloud API Library](https://console.cloud.google.com/apis/library/places.googleapis.com)
2. Create API key in [Credentials](https://console.cloud.google.com/google/maps-apis/credentials)
3. Add to `.env`:
   ```
   GOOGLE_MAPS_API_KEY=your_api_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
   ```

## Environment Variables

All required environment variables are documented in `.env.example`. Below is a comprehensive reference:

### Core Application
```env
# Database connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/analog_db"

# Better Auth configuration
BETTER_AUTH_SECRET="generate-with-openssl-rand-hex-32"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_TELEMETRY="false"  # Optional: disable telemetry
```

### OAuth Providers
```env
# Google (required for calendar functionality)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Microsoft (optional)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# Zoom (optional)
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
```

### Redis / Caching
```env
# Upstash Redis (for session storage and rate limiting)
UPSTASH_REDIS_REST_URL="http://localhost:8079"
UPSTASH_REDIS_REST_TOKEN="upstash-local-token"

# Redis HTTP proxy configuration (used by serverless-redis-http container)
SRH_MODE=env
SRH_TOKEN="upstash-local-token"
SRH_CONNECTION_STRING="redis://redis:6379"
```

### Optional Services
```env
# Google Maps
GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Analytics
SIMPLE_ANALYTICS_HOSTNAME="localhost"
NEXT_PUBLIC_SIMPLE_ANALYTICS_HOSTNAME="localhost"

# CMS
MARBLE_WORKSPACE_KEY=
MARBLE_API_URL=https://api.marblecms.com

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_DSN=
SENTRY_PROJECT=
SENTRY_ORG=

# API Keys for AI/Automation features
UNKEY_ROOT_KEY=
COMPOSIO_API_KEY=
FIRECRAWL_API_KEY=
BROWSERBASE_API_KEY=

# Deployment (automatically set by Vercel)
VERCEL_URL=
NEXT_PUBLIC_VERCEL_URL=
NEXT_PUBLIC_VERCEL_ENV=
```

### Turbo Environment Variables

All environment variables used in Turbo tasks are declared in `turbo.json`. This ensures proper cache invalidation when env vars change. The following variables affect build and dev tasks:

**Required for builds**: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

**Optional but cached**: All other variables listed in `turbo.json` tasks configuration.

## Scripts and Commands

### Root-level Scripts (package.json)

```bash
# Development
bun run dev              # Start all packages in dev mode with Turbopack
bun run build            # Build all packages for production
bun run start            # Start production build (run build first)

# Code Quality
bun run lint             # Run ESLint across all packages
bun run type-check       # Run TypeScript type checking
bun run format           # Format code with Prettier

# Database
bun run db:generate      # Generate Drizzle migrations from schema
bun run db:migrate       # Run pending migrations
bun run db:push          # Push schema changes directly (dev only)
bun run db:studio        # Open Drizzle Studio (database GUI)

# Docker
bun run docker:up        # Start PostgreSQL and Redis containers
bun run docker:down      # Stop containers
bun run docker:clean     # Stop containers and remove volumes
```

### Package-specific Scripts

Each package may have additional scripts. Common patterns:

```bash
# In any package directory
bun run lint             # Lint this package
bun run type-check       # Type check this package
bun run build            # Build this package (if applicable)
```

### Web App Scripts (apps/web/package.json)

```bash
cd apps/web
bun run dev              # Start Next.js dev server with Turbopack on port 3000
bun run build            # Build Next.js app for production
bun run start            # Start production server
bun run lint             # Run Next.js linting
bun run type-check       # Type check web app
```

## Database Management

### Stack
- **Database**: PostgreSQL 15 (Bitnami Docker image)
- **ORM**: Drizzle ORM 0.44.6
- **Migration Tool**: Drizzle Kit 0.31.4

### Schema Location
Database schemas are defined in `packages/db/src/schema/`.

### Common Database Operations

```bash
# Start database container
bun run docker:up

# Generate migration files from schema changes
bun run db:generate

# Apply migrations to database
bun run db:migrate

# Push schema directly to database (development only - skips migrations)
bun run db:push

# Open Drizzle Studio to browse/edit data
bun run db:studio

# Reset database (WARNING: deletes all data)
bun run docker:clean && bun run docker:up && bun run db:push
```

### Docker Services

The `docker-compose.yml` defines three services:

1. **db** (PostgreSQL)
   - Port: 5432
   - User: postgres
   - Password: postgres
   - Database: analog_db
   - Volume: postgres_data (persists data)

2. **redis** (Redis)
   - Port: 6379
   - Used for session storage and caching

3. **upstash-redis** (HTTP proxy for Redis)
   - Port: 8079
   - Provides HTTP interface to Redis for serverless compatibility
   - Uses serverless-redis-http container

All services are on the `analog_network` bridge network.

### Migration Workflow

1. Modify schemas in `packages/db/src/schema/`
2. Generate migration: `bun run db:generate`
3. Review generated SQL in `packages/db/drizzle/` (if migration files are generated)
4. Apply migration: `bun run db:migrate`
5. Commit schema changes and migration files

For rapid prototyping, use `bun run db:push` to skip migration generation.

## Authentication & Authorization

### Authentication Provider: Better Auth

**Version**: 1.3.28
**Configuration**: `packages/auth/`

Better Auth provides:
- OAuth integration (Google, Microsoft, Zoom)
- Session management with Redis
- CSRF protection
- Token refresh handling

### OAuth Flow

1. User initiates OAuth via provider button
2. Redirects to provider consent screen
3. Provider redirects to callback: `/api/auth/callback/{provider}`
4. Better Auth handles token exchange and session creation
5. User session stored in Upstash Redis
6. Access tokens stored for API calls to calendar/contacts services

### Session Management

- Sessions persisted in Redis via Upstash
- Tokens refreshed automatically using refresh tokens
- Session data includes user profile and OAuth tokens

### Scopes

**Google OAuth Scopes** (configured in provider setup):
- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`
- `https://www.googleapis.com/auth/userinfo.profile`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/tasks` (optional)

**Microsoft OAuth Scopes**:
- `User.Read`
- `Calendars.Read`
- `Calendars.ReadWrite`
- `offline_access`

### Security Best Practices

- **Never commit** `.env` file or any files containing secrets
- Rotate `BETTER_AUTH_SECRET` in production environments regularly
- Use environment-specific OAuth credentials (dev vs. production)
- Review OAuth consent screens before publishing
- Enable rate limiting with Upstash Redis (@upstash/ratelimit)

## API Integration

### tRPC API (`packages/api/`)

The application uses tRPC for type-safe API routes.

**Key Features**:
- Type-safe client-server communication
- OpenAPI schema generation (trpc-to-openapi)
- MCP (Model Context Protocol) support (trpc-to-mcp)
- Superjson for advanced serialization (Temporal API support)
- Rate limiting via Upstash

**Exports**:
- `.` → Root router
- `./trpc` → tRPC instance and utilities
- `./interfaces` → TypeScript interfaces
- `./openapi` → OpenAPI schema generator

### External APIs

#### Google APIs
- **Calendar**: `packages/google-calendar/`
- **People**: `packages/google-people/`
- **Tasks**: `packages/google-tasks/`
- **Maps Places**: `packages/google-maps-places/`
- **Maps Routes**: `packages/google-maps-routes/`

OAuth tokens from Better Auth are used for authenticated requests.

#### Microsoft Graph
- **Package**: `@microsoft/microsoft-graph-client`
- **Used for**: Calendar and user data from Microsoft accounts
- **Location**: Integrated in `packages/api/`

#### AI & Automation APIs
- **Composio**: AI agent tool orchestration (`@composio/core`)
- **Firecrawl**: Web scraping and data extraction
- **Browserbase**: Browser automation
- **OpenAI**: AI SDK integration via Vercel AI SDK

### Rate Limiting

Rate limiting is implemented using `@upstash/ratelimit` with Redis.

Configuration in tRPC middleware or API routes:
- Per-user limits
- Per-IP limits for unauthenticated requests
- Token bucket or sliding window algorithms

## Testing

**Note**: Testing infrastructure is not yet fully configured in this repository.

Recommended setup:
- **Unit Tests**: Vitest or Bun's built-in test runner
- **Integration Tests**: Playwright or Cypress
- **E2E Tests**: Playwright with test database

## Deployment

### Recommended Platform: Vercel

The application is optimized for Vercel deployment:
- Next.js native support
- Automatic environment variable management
- Edge function support
- Preview deployments for PRs

### Environment Variables in Production

Ensure all required environment variables from `.env.example` are configured in your deployment platform:

**Critical**:
- `DATABASE_URL` (use production PostgreSQL instance)
- `BETTER_AUTH_SECRET` (unique per environment)
- `BETTER_AUTH_URL` (production domain)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (production OAuth app)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (production Redis)

**OAuth Redirect URIs**: Update OAuth applications with production callback URLs:
- Google: `https://yourdomain.com/api/auth/callback/google`
- Microsoft: `https://yourdomain.com/api/auth/callback/microsoft`
- Zoom: `https://yourdomain.com/api/auth/callback/zoom`

### Database in Production

Options:
1. **Vercel Postgres** (simplest for Vercel deployments)
2. **Supabase** (PostgreSQL with additional features)
3. **Railway** (easy PostgreSQL hosting)
4. **Neon** (serverless PostgreSQL)
5. **AWS RDS / Google Cloud SQL** (enterprise options)

Run migrations after database provisioning:
```bash
bun run db:migrate
```

### Redis in Production

Use **Upstash Redis** (recommended) or any Redis-compatible service with HTTP REST API support.

### Build Process

```bash
# Install dependencies
bun install

# Run migrations
bun run db:migrate

# Build all packages
bun run build

# Start production server
bun run start
```

### Docker Deployment (Alternative)

For self-hosted deployments, create a `Dockerfile` for the web app:
- Base image: oven/bun
- Copy workspace and install dependencies
- Build app
- Serve with `bun run start`

## Security Considerations

### Secrets Management
- **Never commit** secrets to version control
- Use `.env.example` as a template only
- Rotate secrets regularly in production
- Use different OAuth apps for dev/staging/prod

### OAuth Security
- Review OAuth scopes carefully (principle of least privilege)
- Add authorized redirect URIs only for trusted domains
- Enable "Internal" app mode until ready for public use
- Monitor OAuth token usage and revocations

### Rate Limiting
- Implement rate limiting on all public API endpoints
- Use Upstash Redis for distributed rate limiting
- Configure per-user and per-IP limits

### Database Security
- Use strong passwords for PostgreSQL in production
- Enable SSL connections for database
- Restrict database access to application servers only
- Regular backups and disaster recovery plan

### Dependency Security
- Run `bun audit` regularly to check for vulnerabilities
- Keep dependencies updated (especially security patches)
- Review dependency changes in PRs carefully

### Input Validation
- All user inputs validated with Zod schemas (see `packages/schemas/`)
- Sanitize inputs in tRPC procedures
- Use prepared statements (Drizzle ORM handles this)

### Error Handling
- Sentry integration for error tracking
- Never expose sensitive information in error messages
- Log security-relevant events (auth failures, rate limit hits)

### CORS and CSP
- Configure CORS appropriately for API endpoints
- Set Content Security Policy headers in production
- Use `server-only` package to prevent client-side imports of server code

### Monitoring
- Enable Sentry for production error tracking
- Monitor OAuth token usage and failures
- Set up alerts for suspicious activity (rapid auth attempts, etc.)

---

## Contributing

For contribution guidelines, code style, and PR process, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

See [LICENSE](./LICENSE) for license information.

---

**Last Updated**: 2025-11-07
**Repository**: https://github.com/analogdotnow/analog
**Maintainers**: Analog team

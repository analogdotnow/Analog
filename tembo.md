# Project Context

Analog is an open-source calendar application built with Next.js, TypeScript, and modern web technologies. It integrates with Google Calendar, Microsoft Calendar, and Zoom, providing a unified calendar experience with AI-powered features.

## Tech Stack

- **Frontend**: Next.js 15.5 (React 19), TypeScript, Tailwind CSS v4, shadcn/ui components
- **Backend**: tRPC for type-safe APIs, Drizzle ORM with PostgreSQL
- **Authentication**: Better Auth with OAuth providers (Google, Microsoft, Zoom)
- **State Management**: Jotai, TanStack Query, XState
- **Package Manager**: Bun 1.3.0
- **Monorepo**: Turborepo with workspace packages
- **AI**: Vercel AI SDK with OpenAI integration

## Monorepo Structure

This is a Turborepo monorepo with the following workspace organization:

- **apps/web** - Main Next.js application (runs on port 3000)
- **packages/ai** - AI integrations (Composio, Browserbase, Firecrawl) for enhanced AI features
- **packages/api** - tRPC API layer with routers for all features
- **packages/auth** - Better Auth configuration and OAuth setup
- **packages/db** - Drizzle ORM schema and database utilities
- **packages/env** - Environment variable validation with type safety
- **packages/meeting-links** - Meeting link detection and parsing utilities
- **packages/providers** - Calendar and conferencing provider integrations
- **packages/schemas** - Shared Zod validation schemas
- **packages/temporal** - Temporal (date/time) utilities
- **packages/timezone-coordinates** - Timezone coordinate mapping utilities
- **packages/google-\*** - Generated Google API clients (Calendar, Maps, Tasks, People)
- **tooling/eslint-config** - Shared ESLint configurations
- **tooling/typescript-config** - Shared TypeScript configurations

**IMPORTANT**: When adding features, determine the correct package location based on responsibility:

- UI components and pages go in `apps/web`
- API endpoints go in `packages/api/src/routers`
- Database schema changes go in `packages/db/src/schema`
- Provider integrations go in `packages/providers`
- AI integration tools go in `packages/ai`
- Meeting link parsing utilities go in `packages/meeting-links`
- Timezone utilities go in `packages/timezone-coordinates`

## Setup Commands

```bash
# Install dependencies
bun install

# Database management
bun run docker:up           # Start PostgreSQL in Docker
bun run docker:down         # Stop PostgreSQL
bun run docker:clean        # Stop and remove volumes
bun run db:push             # Push schema changes to database
bun run db:migrate          # Run migrations
bun run db:generate         # Generate migration files
bun run db:studio           # Open Drizzle Studio

# Development
bun run dev                 # Start all development servers (Next.js on :3000)
bun run build               # Build all packages and apps
bun run lint                # Run ESLint across monorepo
bun run type-check          # Run TypeScript type checking
bun run format              # Format code with Prettier
```

## Environment Variables

**IMPORTANT**: Always copy `.env.example` to `.env` before development. Never commit secrets to the repository.

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string (default: `postgresql://postgres:postgres@localhost:5432/analog_db`)
- `BETTER_AUTH_SECRET` - Generate with `openssl rand -hex 32`
- `BETTER_AUTH_URL` - Application URL (default: `http://localhost:3000`)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - Google OAuth credentials with Calendar API enabled

### Optional Variables

- `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` - Microsoft OAuth credentials
- `ZOOM_CLIENT_ID` and `ZOOM_CLIENT_SECRET` - Zoom OAuth credentials
- `GOOGLE_MAPS_API_KEY` - Google Places API key for location features
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` - Redis for caching
- `SENTRY_DSN` - Error tracking with Sentry
- AI-related keys: `COMPOSIO_API_KEY`, `FIRECRAWL_API_KEY`, `BROWSERBASE_API_KEY`

## Code Style Guidelines

### TypeScript

- **Use strict type safety** - Avoid `any`, prefer explicit types
- **Use Zod for runtime validation** - Define schemas in `packages/schemas`
- **Leverage type inference** - Use `typeof` and `$inferSelect` from Drizzle
- **Prefer interfaces for object shapes** - Use `type` for unions and complex types
- **Use const assertions** - For literal types and readonly data

### React & Next.js

- **Use Server Components by default** - Mark Client Components with `"use client"`
- **Prefer functional components with hooks** - No class components
- **Use server actions for mutations** - Leverage Next.js 15 server actions
- **Colocate related code** - Keep components, hooks, and utilities near usage
- **Extract custom hooks** - For reusable stateful logic
- **Use Jotai atoms for client state** - Store in `apps/web/src/atoms`

### Styling

- **Use Tailwind CSS v4** - Follow utility-first approach
- **Use shadcn/ui components** - Extend existing components before creating new ones
- **Follow responsive design patterns** - Mobile-first approach
- **Use CSS variables for theming** - Defined in `globals.css`

### tRPC API Development

- **Create routers in packages/api/src/routers** - One router per domain
- **Use protectedProcedure for authenticated endpoints** - Ensures user session exists
- **Validate inputs with Zod schemas** - Define in `packages/schemas`
- **Return type-safe responses** - Leverage tRPC's type inference
- **Handle errors gracefully** - Use TRPCError with appropriate codes

### Database & Drizzle ORM

- **Define schemas in packages/db/src/schema** - One file per domain
- **Use Drizzle relations** - Define relationships between tables
- **Run `bun run db:generate` after schema changes** - Generate migrations
- **Use `bun run db:push` in development** - Quick schema sync without migrations
- **Use transactions for multiple operations** - Ensure data consistency

### Import Order

Follow the Prettier import sort configuration:

1. Built-in Node.js modules
2. React and Next.js imports
3. Third-party packages
4. Workspace packages (`@repo/*`)
5. Absolute imports (`@/*`)
6. Parent directory imports (`../`)
7. Current directory imports (`./`)

### Formatting

- **Use Prettier** - Run `bun run format` before committing
- **Follow conventional commits** - Format: `type(scope): message`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Examples: `feat(calendar): add recurring event support`, `fix(auth): resolve token refresh issue`

## Architecture Principles

### Separation of Concerns

- **UI layer** (apps/web) handles rendering and user interaction
- **API layer** (packages/api) handles business logic and data fetching
- **Data layer** (packages/db) handles database schema and queries
- **Provider layer** (packages/providers) handles external integrations

### Authentication Flow

1. Users authenticate via Google, Microsoft, or Zoom OAuth
2. Better Auth manages sessions and account linking
3. OAuth tokens stored in database for API access
4. Supports multiple linked accounts per user
5. API requests use session from Better Auth

### Calendar Integration

- **Multi-provider support** - Google Calendar, Microsoft Calendar, Zoom
- **Unified API** - Provider-specific logic abstracted in `packages/providers`
- **Event synchronization** - Fetch and display events from all connected calendars
- **Bidirectional sync** - Create, update, delete events across providers

### State Management Strategy

- **Server state** - TanStack Query with tRPC integration
- **Client state** - Jotai atoms for UI state and preferences
- **Local storage** - Dexie (IndexedDB) for offline-first features
- **URL state** - nuqs for shareable URL parameters

## Development Workflow

1. **Create feature branch from main** - Format: `feature/your-feature-name`
2. **Make changes and test locally** - Run `bun run dev` and verify changes
3. **Run linting and type checks** - `bun run lint && bun run type-check`
4. **Format code** - `bun run format`
5. **Commit with conventional format** - `feat(scope): description`
6. **Push and create pull request** - Provide clear PR description
7. **Address review feedback** - Make requested changes
8. **Squash commits when merging** - Keep commit history clean

## Common Pitfalls

**IMPORTANT**: Temporal API usage - This project uses `Temporal.PlainDate`, `Temporal.ZonedDateTime` for date handling. Use `temporal-polyfill` and avoid mixing with `Date` objects.

**NOTE**: Next.js 15 caching - Be aware of aggressive caching in Next.js 15. Use `revalidatePath` or `revalidateTag` after mutations.

## Security Guidelines

**CRITICAL**: Never expose API keys or OAuth secrets in client-side code. All sensitive operations must go through tRPC endpoints.

**IMPORTANT**: Validate all user inputs with Zod schemas before database operations or API calls.

**NOTE**: Better Auth handles CSRF protection automatically. Don't disable built-in security features.

**WARNING**: When displaying user-generated content, sanitize HTML to prevent XSS attacks. Use `harden-react-markdown` for markdown rendering.

**IMPORTANT**: API rate limits - Google Calendar API has quotas. Implement caching and batch requests where possible.

## Integration Details

### Google APIs

- **Calendar API** - Primary calendar provider
- **People API** - Contact information and attendee suggestions
- **Maps Places API** - Location autocomplete and place details
- **Maps Routes API** - Travel time calculations

### Microsoft Graph API

- **Calendar API** - Microsoft Calendar integration
- **User API** - Profile information

### Zoom API

- **Meeting API** - Create and manage Zoom meetings
- **Calendar API** - Zoom calendar integration

### AI Features

- Uses Vercel AI SDK with OpenAI models
- Natural language event creation
- Smart scheduling suggestions
- Email parsing for calendar entries

## Additional Notes

- **Package Manager**: Always use Bun, not npm or yarn
- **Runtime**: Use Node.js runtime (not Bun's built-in runtime)
- **Docker Required**: PostgreSQL runs in Docker for local development
- **Redis Optional**: Local development works without Redis (uses HTTP proxy)
- **License**: MIT - Contributions must be compatible

## Useful Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [tRPC Documentation](https://trpc.io/docs)
- [Temporal Polyfill](https://github.com/js-temporal/temporal-polyfill)
- [shadcn/ui Components](https://ui.shadcn.com)

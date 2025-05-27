<p align="center">
  <h1 align="center">Analog</h1>
  <p align="center">The open source calendar that changes everything</p>
</p>

## Getting Started

To get Analog up and running on your local machine, follow these steps:

### Prerequisites

Ensure you have the following installed:

- **Bun**: A fast JavaScript runtime, package manager, bundler, and test runner.
  - [Installation Guide](https://bun.sh/docs/installation)
- **Docker Desktop**: For running the PostgreSQL database.
  - [Installation Guide](https://www.docker.com/products/docker-desktop/)

### Setup

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/jeanmeijer/analog.git
    cd analog
    ```

2.  **Install dependencies**:

    ```bash
    bun install
    ```

3.  **Configure environment variables**:
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    Then, open the newly created `.env` file. You will find default values for `DATABASE_URL` and `BETTER_AUTH_URL`. You need to set the following:
    - `BETTER_AUTH_SECRET`: Generate a secure secret by running `openssl rand -hex 32` in your terminal.
    - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`:
      1.  Create a Google project in the [Google Cloud Console](https://console.cloud.google.com/).
      2.  Follow [step 1 in the Better Auth documentation](https://www.better-auth.com/docs/authentication/google) to set up Google OAuth credentials.
      3.  Enable the Google Calendar API by visiting [Google Cloud Console APIs](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com) and enabling it for your project.

### Database Setup

Analog uses PostgreSQL with Drizzle ORM. You can run the database using Docker:

1.  **Start the PostgreSQL database container**:

    ```bash
    bun run docker:up
    ```

    This command uses `docker-compose.yml` to spin up a PostgreSQL container.

2.  **Run database migrations**:
    Once the database container is running and healthy, apply the migrations:
    ```bash
    bun run db:migrate
    ```

### Running the Application

After setting up the environment and database, you can start the development server:

```bash
bun run dev
```

The application should now be accessible in your browser, typically at `http://localhost:3000`.

## Tech Stack

- **Web**: Next.js, TypeScript, Tailwind v4, Bun, tRPC, TanStack Query, shadcn/ui
- **Database**: Drizzle with PostgreSQL
- **Authentication**: Better Auth for Google OAuth

## Features

WIP.

## Roadmap

WIP.

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to this project.

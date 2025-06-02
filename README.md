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
      3.  **Configure Authorized Redirect URIs**: In your Google OAuth app settings, add these redirect URIs for both web and desktop authentication:
          ```
          http://localhost:3000/api/auth/callback/google
          http://localhost:8080/
          http://localhost:8081/
          http://localhost:8082/
          http://localhost:8083/
          http://localhost:8084/
          ```
          The `localhost:3000` URI is for web authentication, while the `localhost:8080-8084` URIs are for desktop app authentication (which opens in your default browser).
      4.  Enable the Google Calendar API by visiting [Google Cloud Console APIs](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com) and enabling it for your project.

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

### Desktop Application (Optional)

Analog also includes a Tauri-based desktop application for a native experience:

```bash
bun run tauri:dev
```

The desktop app provides the same functionality as the web version, with the benefit of:
- **External browser authentication**: OAuth flows open in your default browser instead of in-app
- **Native desktop integration**: System tray, global shortcuts, and native notifications
- **Better performance**: Native WebView for faster rendering

**Note**: The desktop app requires the same Google OAuth redirect URIs configured above (`localhost:8080-8084`) for authentication to work properly.

## Tech Stack

- **Web**: Next.js, TypeScript, Tailwind v4, Bun, tRPC, TanStack Query, shadcn/ui
- **Desktop**: Tauri with Rust backend, external browser OAuth
- **Database**: Drizzle with PostgreSQL
- **Authentication**: Better Auth for Google OAuth

## Features

WIP.

## Roadmap

WIP.

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to this project.

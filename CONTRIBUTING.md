# Contributing to Analog

Thank you for your interest in contributing to Analog! We aim to make the contribution process simple and straightforward.

## Getting Started

1. **Fork the repository**

   - Visit [Analog repository](https://github.com/jeanmeijer/analog)
   - Click the "Fork" button in the top right
   - Clone your fork locally:

     ```bash
     git clone https://github.com/YOUR-USERNAME/analog.git
     cd analog
     ```

   - Add upstream remote:

     ```bash
     git remote add upstream https://github.com/jeanmeijer/analog.git
     ```

2. **Set up your development environment**

```bash
 # Install dependencies
 bun i

 # Set up environment variables
 cp .env.example .env

 # Populate .env
 see below

 # Start development server
 bun dev
```

### Populate env

- **BETTER_AUTH_SECRET**

  - Generate a 32 character string:
    ```bash
    openssl rand -hex 32
    ```
  - Add to your `.env` file:
    ```env
    BETTER_AUTH_SECRET=your_generated_secret_here
    ```

- **GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET**

  - Create a Google project in the cloud console. Follow [step 1 in better auth docs](https://www.better-auth.com/docs/authentication/google)
  - Or follow these steps:
    1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
    2. Click on **Create** to start a new project, or select an existing project if you have one.
    3. Once your project is selected, go to the left sidebar and select **APIs & Services > Credentials**.
    4. Click **+ CREATE CREDENTIALS** and choose **OAuth client ID**.
    5. If prompted, configure the consent screen (set the app name, user support email, and developer contact info).
    6. For application type, select **Web application**.
    7. Set an appropriate name (e.g., "Analog Local Dev").
    8. Under **Authorized JavaScript origins**, add:
       - `http://localhost:3000`
    9. Under **Authorized redirect URIs**, add:
       - `http://localhost:3000/api/auth/callback/google`
    10. Click **Create**. You will be shown your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
    11. Copy these values and add them to your `.env` file:
        ```env
        GOOGLE_CLIENT_ID=your_client_id_here
        GOOGLE_CLIENT_SECRET=your_client_secret_here
        ```

- **Configure OAuth Scopes and Enable APIs**

  1.  In the Google Cloud Console, go to the left sidebar and click on **Data Access** or navigate directly to [OAuth Scopes](https://console.cloud.google.com/auth/scopes).
  2.  Next, navigate to the [APIs & Services Library](https://console.cloud.google.com/apis/library?).
  3.  In the search box, search for and enable the following APIs:
      - **Gmail API**
      - **Google Calendar API**
  4.  Click on **Add or remove scopes**.
  5.  Add the following scopes:
      - `email`
      - `profile`
      - `openid`
      - `https://mail.google.com/`
      - `https://www.googleapis.com/auth/calendar`
  6.  Click **Apply** to save your changes.

  7.  After enabling these APIs, return to the [OAuth Scopes](https://console.cloud.google.com/auth/scopes) page if needed, and ensure the above scopes are added and applied.

## Making Changes

1. Create a new branch for your changes

   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes and test them locally

3. Commit your changes using clear [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) messages

   ```bash
   git commit -m "feat: add new feature"
   ```

4. Keep your fork up to date

   ```bash
   git fetch upstream
   git merge upstream/main
   ```

## Pull Request Process

1. Push changes to your fork

   ```bash
   git push origin feature/your-feature
   ```

2. Visit your fork on GitHub and create a Pull Request
3. Create a PR with a clear description of your changes
4. Wait for review and address any feedback

## Need Help?

If you have questions or need help, please:

- Open an issue
- Comment on the relevant issue or PR

## License

By contributing to Analog, you agree that your contributions will be licensed under its MIT License.

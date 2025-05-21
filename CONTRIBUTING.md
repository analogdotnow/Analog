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

   # Copy environment variables template
   cp .env.example .env
   ```

3. **Configure environment variables**
   - Generate `BETTER_AUTH_SECRET`: Run `openssl rand -hex 32`
   - Set up Google OAuth:
     1. Create a Google project in cloud console. Follow [step 1 in better auth docs](https://www.better-auth.com/docs/authentication/google)
     2. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

4. **Initialize the application**
   ```bash
   # Run database migrations
   bun run db:migrate

   # Start development server
   bun dev
   ```

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

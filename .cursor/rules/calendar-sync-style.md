# Calendar Provider Sync Style

- For `packages/api/src/providers/calendars/*` sync implementations, keep request payloads inline with optional chaining rather than branching trees.
- Treat optional bounds like `timeMin`/`timeMax` as truly optional: omit them when absent instead of throwing or defaulting to defensive errors.
- When applying optional filters or query params, prefer short-circuit expressions (`value && action(value)`) over `if/else` blocks for brevity.
- Ensure both Google and Microsoft providers adhere to this pattern so future calendar providers match the same low-branching style.

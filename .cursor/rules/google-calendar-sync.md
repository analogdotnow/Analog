# Google Calendar Sync Style

- Keep the Google provider's `sync` implementation building the request options inline.
- Prefer direct object properties with optional chaining (e.g. `timeMin?.withTimeZone(...)`) instead of branching `if/else` scaffolding.
- Avoid throwing errors when optional `timeMin`/`timeMax` are absent; the API should gracefully omit those fields.

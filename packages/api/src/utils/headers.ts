export function defaultLanguageCode(headers: Headers) {
  return headers.get("Accept-Language")?.split(",")[0] ?? "en";
}

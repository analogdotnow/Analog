export function defaultLanguageCode(headers: Headers) {
  const lang = headers
    .get("Accept-Language")
    ?.split(",")[0]
    ?.trim()
    .split(";")[0];

  if (!lang) {
    return "en";
  }

  return lang;
}

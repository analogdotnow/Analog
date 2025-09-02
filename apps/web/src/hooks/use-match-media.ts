import * as React from "react";

export function useMatchMedia(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);

    setMatches(media.matches);

    const controller = new AbortController();

    media.addEventListener("change", () => setMatches(media.matches), {
      signal: controller.signal,
    });

    return () => controller.abort();
  }, [query]);

  return matches;
}

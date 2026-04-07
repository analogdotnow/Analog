import { setup } from "rivetkit";

import { counter } from "./counter";

export const registry = setup({
  use: { counter },
});

export type Registry = typeof registry;

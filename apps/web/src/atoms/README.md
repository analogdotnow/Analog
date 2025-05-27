# Jotai Atoms

Always include an "analog-" prefix for persisted atoms.  
Always re-export the atoms in `@/atoms/index.ts`.  
Preferably try to create custom hooks to use atoms (e.g. below).

```typescript
// atoms/user-settings.ts
import { atomWithStorage } from "jotai/utils";

export const userSettingsAtom = atomWithStorage("analog-user-settings", {
  theme: "light",
});

// hooks/use-user-settings.ts
import { useAtom } from "jotai";
import { userSettingsAtom } from "@/atoms/user-settings";

export function useUserSettings() {
  useAtom(userSettingsAtom);
}
```

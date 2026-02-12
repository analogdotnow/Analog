"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import DarkTheme from "@/assets/theme-dark.svg";
import LightTheme from "@/assets/theme-light.svg";
import SystemTheme from "@/assets/theme-system.svg";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Theme {
  value: string;
  name: string;
  icon: React.ElementType;
}

const themes: Theme[] = [
  {
    value: "system",
    name: "System",
    icon: SystemTheme,
  },
  {
    value: "light",
    name: "Light",
    icon: LightTheme,
  },
  {
    value: "dark",
    name: "Dark",
    icon: DarkTheme,
  },
];

export function ThemePicker() {
  const { theme, setTheme } = useTheme();

  const onValueChange = React.useCallback(
    (value: string) => {
      if (!value) {
        return;
      }

      setTheme(value);
    },
    [setTheme],
  );

  return (
    <ToggleGroup
      variant="outline"
      className="gap-x-4 data-[variant=outline]:shadow-none"
      value={[theme ?? "system"]}
      onValueChange={(value: string[]) => onValueChange(value[0]!)}
    >
      {themes.map((theme) => (
        <ThemePickerItem key={theme.value} theme={theme} />
      ))}
    </ToggleGroup>
  );
}

interface ThemePickerItemProps {
  theme: Theme;
}

function ThemePickerItem({ theme }: ThemePickerItemProps) {
  return (
    <ToggleGroupItem
      className="group/theme h-fit flex-1 border-none px-0 hover:bg-transparent data-[state=on]:bg-transparent"
      value={theme.value}
    >
      <div className="relative w-full">
        <theme.icon className="size-full rounded-md ring-offset-popover group-aria-checked/theme:ring-2 group-aria-checked/theme:ring-ring/40 group-aria-checked/theme:ring-offset-4 dark:group-aria-checked/theme:ring-ring" />
        <p className="mt-3 text-sm text-muted-foreground group-aria-checked/theme:text-foreground">
          {theme.name}
        </p>
      </div>
    </ToggleGroupItem>
  );
}

import * as React from "react";
import Image from "next/image";
import { useHotkeys } from "react-hotkeys-hook";

import SubwaySurfersImage from "@/assets/easter-eggs/subway-surfers.webp";

export function SubwaySurfers() {
  const [easterEggSettingsVisible, setEasterEggSettingsVisible] =
    React.useState(false);

  useHotkeys(
    "s+u+r+f",
    () => setEasterEggSettingsVisible(true),
    { keydown: true, keyup: false },
    [],
  );

  useHotkeys(
    "s, u, r, f",
    () => setEasterEggSettingsVisible(false),
    { keydown: false, keyup: true },
    [],
  );

  return (
    easterEggSettingsVisible && (
      <Image
        src={SubwaySurfersImage}
        alt="Subway Surfers Easter Egg"
        className="image-full object-contain select-none"
      />
    )
  );
}

import * as React from "react";
import Image from "next/image";
import { useHotkeys } from "react-hotkeys-hook";

import SubwaySurfersImage from "@/assets/easter-eggs/subway-surfers.webp";

export function SubwaySurfers() {
  const [showEasterEgg, setShowEasterEgg] = React.useState(false);

  useHotkeys(
    "s+u+r+f",
    () => setShowEasterEgg(true),
    { keydown: true, keyup: false },
    [],
  );

  useHotkeys(
    "s, u, r, f",
    () => setShowEasterEgg(false),
    { keydown: false, keyup: true },
    [],
  );

  return (
    showEasterEgg && (
      <Image
        src={SubwaySurfersImage}
        alt="Subway Surfers Easter Egg"
        className="image-full object-contain select-none"
      />
    )
  );
}

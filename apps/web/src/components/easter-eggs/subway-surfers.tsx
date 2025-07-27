import * as React from "react";
import Image from "next/image";

import SubwaySurfersImage from "@/assets/easter-eggs/subway-surfers.webp";

const SHORTCUT_KEYS = ["s", "u", "r", "f"];

export function SubwaySurfers() {
  const [easterEggSettingsVisible, setEasterEggSettingsVisible] =
    React.useState(false);

  const pressed = React.useRef<{ [key: string]: boolean }>({});

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (SHORTCUT_KEYS.includes(key)) {
        pressed.current[key] = true;
        if (SHORTCUT_KEYS.every((k) => pressed.current[k])) {
          setEasterEggSettingsVisible(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (SHORTCUT_KEYS.includes(key)) {
        pressed.current[key] = false;
        setEasterEggSettingsVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

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

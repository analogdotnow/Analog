import Link from "next/link";
import { FullSVGLogo } from "./brand/full-svg-logo";
import { ModeToggle } from "./ui/theme-toggle";

export function Footer() {
  return (
    <header className="flex flex-row w-full py-10 px-2.5">
      <div className="flex flex-row items-center justify-between max-w-7xl w-full mx-auto">
        <FullSVGLogo />

        <div className="flex flex-row gap-2 items-center justify-center text-muted-foreground">
          <Link href="/terms" className="underline underline-offset-2 text-xs md:text-sm">
            Terms os Use
          </Link>
          <Link href="/privacy" className="underline underline-offset-2 text-xs md:text-sm">
            Privacy Policy
          </Link>

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

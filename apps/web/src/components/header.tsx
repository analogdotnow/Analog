import Link from "next/link";
import { FullSVGLogo } from "./brand/full-svg-logo";
import { ModeToggle } from "./ui/theme-toggle";

export function Header() {
  return (
    <header className="fixed flex flex-row w-full py-10 px-2.5 bg-background/5 backdrop-blur-sm border-b border-border/10">
      <div className="flex flex-row items-center justify-between max-w-7xl w-full mx-auto">
          <FullSVGLogo />

        <div className="flex flex-row gap-2 items-center justify-center text-muted-foreground">
          <span>Star us on</span>
          <Link
            href="https://github.com/initjean"
            className="underline text-primary underline-offset-2"
            target="_blank"
          >
            Github
          </Link>

          <span>and follow on</span>
          <Link
            className="underline text-primary underline-offset-2"
            href="https://x.com/initjean"
            target="_blank"
          >
            X (Twitter)
          </Link>

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

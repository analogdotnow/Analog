import { Logo } from "@/components/branding/logo";
import { ModeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-row w-full py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8 bg-background/80 backdrop-blur-md border-b border-border/10">
      <div className="flex flex-row items-center justify-between w-full max-w-7xl mx-auto">
        <Logo />

        <nav className="flex flex-row gap-1.25 items-center justify-center text-muted-foreground">
          <span className="text-sm hidden md:block">Star us on</span>

          <a
            href="https://github.com/jeanmeijer/analog"
            className="underline text-primary underline-offset-2 text-sm hover:text-primary/80 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </a>

          <span className="text-sm hidden md:block">and follow on</span>
          <a
            className="underline text-primary underline-offset-2 text-sm hover:text-primary/80 transition-colors"
            href="https://x.com/analogdotnow"
            target="_blank"
            rel="noopener noreferrer"
          >
            X (Twitter)
          </a>

          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}

import { Logo } from "@/components/branding/logo";
import { ModeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex w-full flex-row border-b border-border/10 bg-background/80 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-row items-center justify-between">
        <Logo />

        <nav className="flex flex-row items-center justify-center gap-1.25 text-muted-foreground">
          <span className="hidden text-sm md:block">Star us on</span>

          <a
            href="https://github.com/jeanmeijer/analog"
            className="text-sm text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </a>

          <span className="hidden text-sm md:block">and follow on</span>
          <a
            className="text-sm text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
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

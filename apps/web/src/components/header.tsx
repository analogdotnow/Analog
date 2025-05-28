import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex w-full flex-row border-b border-border/10 bg-background/80 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-row items-center justify-between">
        <Icons.logo />

        <nav className="flex flex-row items-center justify-center gap-1.5">
          <a
            href="https://github.com/jeanmeijer/analog"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icons.github className="fill-primary" />
          </a>

          <a
            href="https://x.com/analogdotnow"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icons.twitter className="fill-primary" />
          </a>

          <a
            href="https://discord.gg/K3AsABDKUm"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icons.discord className="fill-primary" />
          </a>

          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}

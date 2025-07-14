import Link from "next/link";

import { Discord, GitHub, Logo, Twitter } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme-toggle";

function Nav() {
  return (
    <nav className="flex flex-row items-center justify-center gap-x-6">
      {/* <Button asChild variant="ghost" size="sm">
        <a
          href="https://github.com/jeanmeijer/analog"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHub className="fill-primary" />
          <span className="sr-only">GitHub</span>
        </a>
      </Button> */}

      <div className="flex flex-row items-center justify-center gap-x-2">
      <Button className="hover:bg-transparent dark:hover:bg-transparent" variant="ghost" size="sm" asChild>
        <a
          href="https://x.com/analogdotnow"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Twitter className="fill-primary" />
          <span className="sr-only">Twitter</span>
        </a>
      </Button>

      <Button className="hover:bg-transparent dark:hover:bg-transparent" variant="ghost" size="sm" asChild>
        <a
          href="https://discord.gg/K3AsABDKUm"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Discord className="fill-primary" />
          <span className="sr-only">Discord</span>
        </a>
      </Button>
      </div>

      {/* <ModeToggle /> */}

      <Button className="rounded-lg" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
    </nav>
  );
}
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 mx-auto flex w-full max-w-6xl p-6 backdrop-blur-md md:p-12">
      <div className="flex w-full items-center justify-between">
        <Logo className="h-6" />

        <Nav />
      </div>
    </header>
  );
}

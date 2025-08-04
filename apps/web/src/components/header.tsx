import Link from "next/link";

import { Discord, GitHub, Logo, Twitter } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { URLS } from "@/lib/urls";
import { cn } from "@/lib/utils";

const headerItems = [
  {
    id: 1,
    label: "Github",
    href: URLS.GITHUB,
    icon: GitHub,
  },
  {
    id: 2,
    label: "Twitter",
    href: URLS.TWITTER,
    icon: Twitter,
  },
  {
    id: 3,
    label: "Discord",
    href: URLS.DISCORD,
    icon: Discord,
  },
];

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        "bg-landing-background/80 fixed top-0 right-0 left-0 z-50 flex w-full flex-row border-b border-border/10 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-6 md:px-8 md:py-8",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-row items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="flex flex-row items-center justify-center gap-1.5">
          {headerItems.map((item) => (
            <Button asChild variant="ghost" size="sm" key={item.id}>
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                <item.icon className="fill-primary" />
                <span className="sr-only">{item.label}</span>
              </a>
            </Button>
          ))}

          <ModeToggle />

          {/* TODO: Re-enable login button once we ready to launch */}
          {/* <Button asChild variant="default" size="sm">
            <Link href="/login">Login</Link>
          </Button> */}
        </nav>
      </div>
    </header>
  );
}

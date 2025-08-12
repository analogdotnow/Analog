import Link from "next/link";

import { Discord, GitHub, Logo, Twitter } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { URLS } from "@/lib/urls";
import { cn } from "@/lib/utils";

interface SocialItem {
  id: number;
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface NavigationItem {
  id: number;
  label: string;
  href: string;
}

const socialItems: SocialItem[] = [
  {
    id: 1,
    label: "GitHub",
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

const navigationItems: NavigationItem[] = [
  // {
  //   id: 1,
  //   label: "Blog",
  //   href: "/blog",
  // },
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
      <div className="mx-auto grid w-full max-w-7xl grid-cols-3 items-center">
        <div className="flex justify-start">
          <Link href="/">
            <Logo className="h-6" />
          </Link>
        </div>

        <nav className="flex items-center justify-center">
          <div className="hidden flex-row items-center gap-1 md:flex">
            {navigationItems.map((item) => (
              <Button asChild variant="ghost" size="sm" key={item.id}>
                <Link href={item.href} className="text-sm font-medium">
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </nav>

        <div className="flex items-center justify-end gap-1.5">
          <div className="hidden flex-row items-center gap-1.5 sm:flex">
            {socialItems.map((item) => (
              <Button asChild variant="ghost" size="sm" key={item.id}>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <item.icon className="fill-primary" />
                  <span className="sr-only">{item.label}</span>
                </a>
              </Button>
            ))}
          </div>

          <ModeToggle />

          {/* TODO: Re-enable login button once we ready to launch */}
          {/* <Button asChild variant="default" size="sm">
            <Link href="/login">Login</Link>
          </Button> */}
        </div>
      </div>
    </header>
  );
}

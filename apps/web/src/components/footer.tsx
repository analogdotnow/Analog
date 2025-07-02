import Link from "next/link";

import { Discord, GitHub, Logo, Twitter } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "./sections/home/waitlist-form";

const footerLinks = {
  community: [
    {
      name: "GitHub",
      href: "https://github.com/jeanmeijer/analog",
      icon: GitHub,
    },
    {
      name: "Discord",
      href: "https://discord.gg/K3AsABDKUm",
      icon: Discord,
    },
    {
      name: "Twitter",
      href: "https://x.com/analogdotnow",
      icon: Twitter,
    },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "License", href: "/license" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Brand section */}
          <div>
            <div className="flex items-center space-x-2">
              <Logo className="h-16 w-32" />
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              The open-source calendar that understands your life. Built for
              developers, by developers. Transform your scheduling experience
              with privacy-first design.
            </p>

            {/* Social links */}
            <div className="mt-6 flex space-x-4">
              {footerLinks.community.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <link.icon className="h-5 w-5 fill-primary" />
                  <span className="sr-only">{link.name}</span>
                </Link>
              ))}
            </div>
          </div>
          {/* Newsletter signup */}
          <div className="justify-left items-left flex flex-col gap-4">
            <h3 className="text-md font-semibold text-foreground">
              Join the Waitlist!
            </h3>
            <WaitlistForm alignment="left" />
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-border/50 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>
                © {new Date().getFullYear()} Analog. All rights reserved.
              </span>

              {/* TODO: Add legal links */}
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Made with ❤️ by the Analog team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

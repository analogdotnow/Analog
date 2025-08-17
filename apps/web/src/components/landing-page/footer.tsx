import Link from "next/link";

import { Discord, GitHub, Twitter } from "@/components/icons";
import { Logo } from "@/components/icons/logo";
import { URLS } from "@/lib/urls";

const socialItems = [
  {
    label: "GitHub",
    href: URLS.GITHUB,
    icon: GitHub,
  },
  {
    label: "Twitter",
    href: URLS.TWITTER,
    icon: Twitter,
  },
  {
    label: "Discord",
    href: URLS.DISCORD,
    icon: Discord,
  },
];

const links = [
  // {
  //   group: "Product",
  //   items: [
  //     {
  //       title: "Features",
  //       href: "#",
  //     },
  //     {
  //       title: "Pricing",
  //       href: "#",
  //     },
  //   ],
  // },
  {
    group: "Resources",
    items: [
      {
        title: "Privacy",
        href: "/privacy",
      },
      {
        title: "Terms",
        href: "/terms",
      },
    ],
  },
  {
    group: "Company",
    items: [
      // {
      //   title: "About",
      //   href: "#",
      // },
      {
        title: "Blog",
        href: "/blog",
      },
      // {
      //   title: "Contact",
      //   href: "#",
      // },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white pt-20 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-3 space-y-6">
            <Link href="/" aria-label="go home" className="block size-fit">
              <Logo className="h-6" />
            </Link>
            <div className="flex flex-row items-center gap-8 px-0">
                  {socialItems.map((item) => (
                    <a
                      className="size-4 rounded-full duration-150 hover:opacity-80"
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={item.label}
                    >
                      <item.icon className="fill-primary" />
                      <span className="sr-only">{item.label}</span>
                    </a>
                  ))}
                </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:col-span-2">
            {links.map((link, index) => (
              <div key={index} className="space-y-4 text-sm">
                <span className="block font-medium">{link.group}</span>
                {link.items.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="block text-muted-foreground duration-150 hover:text-primary"
                  >
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 h-1 w-full rounded-full bg-neutral-500/5" />
        <div className="flex flex-wrap items-end justify-between gap-6 py-6">
          <span className="order-last block text-center text-sm text-muted-foreground md:order-first">
            © Analog Interface, All rights reserved
          </span>
          <div className="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last"></div>
        </div>
      </div>
    </footer>
  );
}

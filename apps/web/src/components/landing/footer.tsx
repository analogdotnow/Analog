import Link from "next/link";

import { Logo } from "@/components/icons";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl p-6 md:p-12">
      <div className="flex w-full items-center justify-between">
        <Logo className="h-6 opacity-50" />

        <div className="flex flex-row items-center justify-center gap-2 text-muted-foreground">
          <Link
            href="/terms"
            className="text-xs underline underline-offset-2 md:text-sm"
          >
            Terms of Use
          </Link>
          <Link
            href="/privacy"
            className="text-xs underline underline-offset-2 md:text-sm"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

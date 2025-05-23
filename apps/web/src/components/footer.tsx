import Link from "next/link";
import { Logo } from "./branding/logo";
import { ModeToggle } from "./ui/theme-toggle";

export function Footer() {
  return (
    <footer className="flex flex-row w-full py-10 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8">
      <div className="flex flex-row items-center justify-between max-w-7xl w-full mx-auto">
        <Logo className="opacity-50" />

        <div className="flex flex-row gap-2 items-center justify-center text-muted-foreground">
          {/*<Link*/}
          {/*  href="/terms"*/}
          {/*  className="underline underline-offset-2 text-xs md:text-sm"*/}
          {/*>*/}
          {/*  Terms of Use*/}
          {/*</Link>*/}
          {/*<Link*/}
          {/*  href="/privacy"*/}
          {/*  className="underline underline-offset-2 text-xs md:text-sm"*/}
          {/*>*/}
          {/*  Privacy Policy*/}
          {/*</Link>*/}

          {/* <ModeToggle /> */}
        </div>
      </div>
    </footer>
  );
}

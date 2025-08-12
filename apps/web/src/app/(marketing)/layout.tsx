import type { ReactNode } from "react";

import { Header } from "@/components/landing-page/header";
import { Footer } from "@/components/landing-page/footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-landing-background mx-auto w-full">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

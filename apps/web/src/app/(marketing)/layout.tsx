import type { ReactNode } from "react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-landing-background mx-auto w-full">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

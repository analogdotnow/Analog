import { ReactNode } from "react";

import { Footer } from "@/components/landing-page/footer";
import { Header } from "@/components/landing-page/header";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

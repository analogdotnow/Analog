import { ReactNode } from "react";

import { Footer } from "@/components/landing-page/footer";
import { Header } from "@/components/landing-page/header";

interface LegalLayoutProps {
  children: ReactNode;
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

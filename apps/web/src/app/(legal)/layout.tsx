import { ReactNode } from "react";

import { Header } from "@/components/header";
import { Footer } from "@/components/landing/footer";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header className="sticky top-0" />
      {children}
      <Footer />
    </div>
  );
}

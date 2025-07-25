import { ReactNode } from "react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header className="sticky top-0" />
      {children}
      <Footer />
    </div>
  );
}

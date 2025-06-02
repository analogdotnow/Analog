import type { Metadata } from "next";

import { HybridAuth } from "@/components/auth/hybrid-auth";

export const metadata: Metadata = {
  title: "Sign In - Analog",
};

export default function Page() {
  return <HybridAuth />;
}
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@repo/auth/server";

import { Hero } from "@/components/landing-page/hero";

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/calendar");
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-20 sm:py-28 md:py-32 lg:py-40">
      <main className="flex w-full flex-col items-center justify-center gap-8 md:gap-12">
        <Hero />
      </main>
    </div>
  );
}

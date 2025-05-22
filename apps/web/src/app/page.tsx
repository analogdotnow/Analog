"use client";

import { Hero } from "@/components/sections/home/hero";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 md:gap-12 w-full items-center justify-center px-4 md:px-6">
      <Hero />
    </main>
  );
}

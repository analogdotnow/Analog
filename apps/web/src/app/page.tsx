import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/sections/home/hero";

// Required for tRPC prefetching
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="mx-auto w-full">
      <Header />
      <div className="py-20 sm:py-28 md:py-32 lg:py-40 min-h-[calc(100vh-8rem)]">
        <main className="flex flex-col gap-8 md:gap-12 w-full items-center justify-center">
          <Hero />
        </main>
      </div>
      <Footer />
    </div>
  );
}

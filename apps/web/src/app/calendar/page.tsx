import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@repo/auth/server";

import { CalendarView } from "@/components/calendar-view";

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Auth request timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

export default async function Page() {
  try {
    console.log("[calendar/page] Starting auth session check");
    
    // Add timeout to auth session check
    const session = await withTimeout(
      auth.api.getSession({ headers: await headers() }),
      10000 // 10 second timeout
    );

    console.log("[calendar/page] Auth session check completed");

    if (!session) {
      console.log("[calendar/page] No session found, redirecting to login");
      redirect("/login");
    }

    console.log("[calendar/page] Session found, rendering calendar");

    return (
      <div className="flex h-[calc(100dvh-1rem)]">
        <CalendarView className="grow" />
      </div>
    );
  } catch (error) {
    console.error("[calendar/page] Auth error:", error);
    
    // If auth fails, redirect to login
    redirect("/login");
  }
}

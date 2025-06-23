import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@repo/auth/server";

export default async function AuthDebugPage() {
  const startTime = Date.now();

  // Test basic auth session
  let authTest = null;
  try {
    console.log("[auth-debug] Starting auth session test");
    const session = await auth.api.getSession({ headers: await headers() });
    
    authTest = {
      success: true,
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      sessionId: session?.session?.id,
      timestamp: new Date().toISOString(),
    };
    console.log("[auth-debug] Auth session test completed");
  } catch (error) {
    authTest = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
    console.error("[auth-debug] Auth session test failed:", error);
  }

  // Test environment variables
  const envTest = {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "Set" : "Not set",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set",
    DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Not set",
  };

  // Test database connection
  let dbTest = null;
  try {
    console.log("[auth-debug] Starting database test");
    const { db } = await import("@repo/db");
    const userCount = await db.select().from(db.query.user).limit(1);
    
    dbTest = {
      success: true,
      userCount: userCount.length,
      timestamp: new Date().toISOString(),
    };
    console.log("[auth-debug] Database test completed");
  } catch (error) {
    dbTest = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
    console.error("[auth-debug] Database test failed:", error);
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Information</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Request Info</h2>
          <p><strong>Duration:</strong> {duration}ms</p>
          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Authentication Test</h2>
          <pre className="bg-white p-2 rounded text-sm overflow-auto">
            {JSON.stringify(authTest, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
          <pre className="bg-white p-2 rounded text-sm overflow-auto">
            {JSON.stringify(envTest, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Database Test</h2>
          <pre className="bg-white p-2 rounded text-sm overflow-auto">
            {JSON.stringify(dbTest, null, 2)}
          </pre>
        </div>

        <div className="bg-red-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Auth Issues to Check</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>BETTER_AUTH_SECRET:</strong> Must be set and at least 32 characters</li>
            <li><strong>BETTER_AUTH_URL:</strong> Should point to your domain, not cause circular redirects</li>
            <li><strong>Database Connection:</strong> Must be accessible from Cloudflare Workers</li>
            <li><strong>Token Refresh:</strong> OAuth tokens must be valid and refreshable</li>
            <li><strong>Session Cookies:</strong> Must be properly set and accessible</li>
          </ul>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Common Auth-Based 1101 Causes</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Missing or invalid BETTER_AUTH_SECRET</li>
            <li>Database connection timeout during auth</li>
            <li>OAuth token refresh hanging</li>
            <li>Circular redirects in auth flow</li>
            <li>Session validation taking too long</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 
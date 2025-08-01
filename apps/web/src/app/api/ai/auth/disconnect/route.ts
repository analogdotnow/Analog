import { NextRequest, NextResponse } from "next/server";

import { sessionStore } from "@repo/ai/auth/session-store";

interface DisconnectRequestBody {
  sessionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DisconnectRequestBody = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    await sessionStore.removeClient(sessionId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

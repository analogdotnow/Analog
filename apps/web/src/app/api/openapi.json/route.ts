import { NextResponse } from "next/server";

import { openApiDocument } from "@repo/api/openapi";

export function GET() {
  return NextResponse.json(openApiDocument);
}

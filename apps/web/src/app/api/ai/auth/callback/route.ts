import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Get the base URL for redirects
  const baseUrl = new URL(request.url).origin;

  if (code) {
    // Redirect to main app with auth code
    return NextResponse.redirect(`${baseUrl}/?code=${code}`);
  } else if (error) {
    // Redirect to main app with error
    return NextResponse.redirect(`${baseUrl}/?error=${error}`);
  }

  return new NextResponse("Bad request", { status: 400 });
}

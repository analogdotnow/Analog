import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (code) {
    const html = `
      <html>
        <body>
          <h1>Authorization Successful!</h1>
          <p>You can close this window and return to the app.</p>
          <script>
            // Send the auth code to the parent window
            if (window.opener) {
              window.opener.postMessage({ type: 'oauth-success', code: '${code}' }, '*');
              window.close();
            } else {
              // Fallback: redirect to main app with code
              window.location.href = '/?code=${code}';
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } else if (error) {
    const html = `
      <html>
        <body>
          <h1>Authorization Failed</h1>
          <p>Error: ${error}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'oauth-error', error: '${error}' }, '*');
              window.close();
            } else {
              // Fallback: redirect to main app with error
              window.location.href = '/?error=${error}';
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  return new NextResponse("Bad request", { status: 400 });
}

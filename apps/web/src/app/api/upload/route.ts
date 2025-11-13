import { route, type Router } from "@better-upload/server";
import { toRouteHandler } from "@better-upload/server/adapters/next";
import { aws } from "@better-upload/server/clients";
import { headers } from "next/headers";

import { auth } from "@repo/auth/server";
import { env } from "@repo/env/server";

// Configure the upload router with S3
// The aws() client automatically reads from environment variables:
// - AWS_ACCESS_KEY_ID
// - AWS_SECRET_ACCESS_KEY
// - AWS_REGION
const uploadRouter: Router = {
  client: aws({
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  }),
  bucketName: env.AWS_S3_BUCKET_NAME,
  routes: {
    files: route({
      // Allow any content type
      fileTypes: ["*/*"],
      // Allow multiple files up to 10
      multipleFiles: true,
      maxFiles: 10,
      // Max 100MB per file
      maxFileSize: 100 * 1024 * 1024, // 100MB in bytes
    }),
  },
};

// Generate the route handler with better-upload
const { POST: uploadPOST } = toRouteHandler(uploadRouter);

// Wrap the POST handler with authentication check
export async function POST(request: Request) {
  // Get the session from better-auth
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  // Check if user is authenticated
  if (!session?.user) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to upload files",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  // User is authenticated, proceed with upload
  return uploadPOST(request);
}

import { headers } from "next/headers";
import { RejectUpload, route, type Router } from "@better-upload/server";
import { toRouteHandler } from "@better-upload/server/adapters/next";
import { aws } from "@better-upload/server/clients";

import { auth } from "@repo/auth/server";
import { env } from "@repo/env/server";

const uploadRouter: Router = {
  client: aws({
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  }),
  bucketName: env.AWS_S3_BUCKET_NAME,
  routes: {
    files: route({
      fileTypes: ["*/*"],
      multipleFiles: true,
      maxFiles: 10,
      maxFileSize: 100 * 1024 * 1024, // 100MB in bytes
      onBeforeUpload: async ({ req }) => {
        const headersList = await headers();
        const session = await auth.api.getSession({
          headers: headersList,
        });

        if (!session?.user) {
          throw new RejectUpload("Not logged in!");
        }
      },
    }),
  },
};

export const { POST } = toRouteHandler(uploadRouter);

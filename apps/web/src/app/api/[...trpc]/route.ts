import { createOpenApiFetchHandler } from "trpc-to-openapi";

import { appRouter, createContext } from "@repo/api";

const handler = (req: Request) => {
  return createOpenApiFetchHandler({
    endpoint: "/api",
    req,
    router: appRouter,
    createContext: () => createContext({ headers: req.headers }),
  });
};

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
};

import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite/vector";
import { worker } from "@electric-sql/pglite/worker";

import { IDB_NAME } from "./settings";

worker({
  async init() {
    return new PGlite({
      dataDir: `idb://${IDB_NAME}`,
      extensions: {
        vector,
        // live // results updated when tables change (https://pglite.dev/docs/live-queries)
        // If we use worker, we cannot use "live" here
      },
    });
  },
});

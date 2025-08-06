import { oAuthDiscoveryMetadata } from "better-auth/plugins";

import { auth } from "@repo/auth/server";

export const GET = oAuthDiscoveryMetadata(auth);

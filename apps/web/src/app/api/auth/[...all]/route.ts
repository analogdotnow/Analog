import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@analog/auth/server";

export const { POST, GET } = toNextJsHandler(auth);

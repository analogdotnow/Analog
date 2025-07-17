import { zero } from "./zero";

export async function GET(req: Request) {
  await zero({
    accessToken: "123",
  });
  return JSON.stringify({
    message: "Hello, world!",
  });
}
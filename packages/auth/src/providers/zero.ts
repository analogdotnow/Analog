import { genericOAuth } from "better-auth/plugins";

export const zero = genericOAuth({
  config: [
    {
      providerId: "zero",
      clientId: "",
      clientSecret: "",
      discoveryUrl:
        "https://api.0.email/.well-known/oauth-authorization-server",
    },
  ],
});

import { people } from "@googleapis/people";
import { OAuth2Client } from "google-auth-library";

import { env } from "@repo/env/server";

import { Provider, ProviderConfig } from "./types";

export const GOOGLE_OAUTH_SCOPES = [
  "email",
  "profile",
  "openid",
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/calendar",
];

export class GoogleProvider implements Provider {
  private auth;

  constructor(public config: ProviderConfig) {
    this.auth = new OAuth2Client({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    });

    if (config.auth) {
      this.auth.setCredentials({
        refresh_token: config.auth.refreshToken,
        scope: GOOGLE_OAUTH_SCOPES.join(" "),
      });
    }
  }

  public getScope(): string {
    return GOOGLE_OAUTH_SCOPES.join(" ");
  }

  async getUserInfo() {
    const response = await people({
      version: "v1",
      auth: this.auth,
    }).people.get({
      resourceName: "people/me",
      personFields: "name,photos,emailAddresses",
    });

    return {
      email: response.data.emailAddresses?.[0]?.value ?? "",
      name: response.data.names?.[0]?.displayName ?? "",
      image: response.data.photos?.[0]?.url ?? "",
    };
  }
}

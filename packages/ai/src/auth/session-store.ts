import {
  OAuthClientInformationFull,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { Redis } from "@upstash/redis";

import { env } from "@repo/env/server";

import { MCPOAuthClient } from "./oauth-client";

// Serializable representation of MCPOAuthClient state
interface SerializableClientState {
  serverUrl: string;
  callbackUrl: string;
  // We can't serialize the onRedirect function, so we'll need to reconstruct it
  oauthProviderState?: {
    clientInformation?: OAuthClientInformationFull;
    tokens?: OAuthTokens;
    codeVerifier?: string;
  };
  isConnected?: boolean;
}

// Type-safe access to private properties (since we need to serialize them)
interface MCPOAuthClientInternal {
  serverUrl: string;
  callbackUrl: string;
  client: unknown | null;
  oauthProvider?: {
    _clientInformation?: OAuthClientInformationFull;
    _tokens?: OAuthTokens;
    _codeVerifier?: string;
  } | null;
}

// Redis-based session store for production use
class SessionStore {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  private getSessionKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  async setClient(sessionId: string, client: MCPOAuthClient): Promise<void> {
    try {
      // Extract serializable state from the client using type assertion
      const internalClient = client as unknown as MCPOAuthClientInternal;

      const clientState: SerializableClientState = {
        serverUrl: internalClient.serverUrl,
        callbackUrl: internalClient.callbackUrl,
        oauthProviderState: {
          clientInformation: internalClient.oauthProvider?._clientInformation,
          tokens: internalClient.oauthProvider?._tokens,
          codeVerifier: internalClient.oauthProvider?._codeVerifier,
        },
        isConnected: internalClient.client !== null,
      };

      const key = this.getSessionKey(sessionId);
      // Set with 24 hour expiration
      await this.redis.set(key, JSON.stringify(clientState), {
        ex: 24 * 60 * 60,
      });
    } catch (error) {
      console.error("Failed to store client state:", error);
      throw new Error("Failed to store session");
    }
  }

  async getClient(sessionId: string): Promise<MCPOAuthClient | null> {
    try {
      const key = this.getSessionKey(sessionId);
      const data = await this.redis.get<string>(key);

      if (!data) {
        return null;
      }

      const clientState: SerializableClientState = JSON.parse(data);

      const client = new MCPOAuthClient(
        clientState.serverUrl,
        clientState.callbackUrl,
        (url: string) => {
          // Default onRedirect handler - this will need to be handled at the application level
          console.log(`OAuth redirect required: ${url}`);
        },
      );

      // If we had OAuth state, restore it to the client
      if (clientState.oauthProviderState) {
        const { clientInformation, tokens, codeVerifier } =
          clientState.oauthProviderState;

        // Access the private oauthProvider through type assertion
        // This is a workaround since the properties are private
        const internalClient = client as unknown as MCPOAuthClientInternal;
        const oauthProvider = internalClient.oauthProvider;

        if (oauthProvider && clientInformation) {
          oauthProvider._clientInformation = clientInformation;
        }

        if (oauthProvider && tokens) {
          oauthProvider._tokens = tokens;
        }

        if (oauthProvider && codeVerifier) {
          oauthProvider._codeVerifier = codeVerifier;
        }
      }

      return client;
    } catch (error) {
      console.error("Failed to deserialize client state:", error);
      return null;
    }
  }

  async removeClient(sessionId: string): Promise<void> {
    try {
      const key = this.getSessionKey(sessionId);

      // Get the client first to disconnect it
      const client = await this.getClient(sessionId);
      if (client) {
        client.disconnect();
      }

      await this.redis.del(key);
    } catch (error) {
      console.error("Failed to remove client:", error);
      throw new Error("Failed to remove session");
    }
  }

  generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Helper method to check if a session exists
  async hasSession(sessionId: string): Promise<boolean> {
    try {
      const key = this.getSessionKey(sessionId);
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error("Failed to check session existence:", error);
      return false;
    }
  }

  // Helper method to extend session expiration
  async extendSession(
    sessionId: string,
    ttlSeconds: number = 24 * 60 * 60,
  ): Promise<boolean> {
    try {
      const key = this.getSessionKey(sessionId);
      const result = await this.redis.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      console.error("Failed to extend session:", error);
      return false;
    }
  }

  // Helper method to update OAuth state without recreating the entire client
  async updateClientOAuthState(
    sessionId: string,
    oauthState: SerializableClientState["oauthProviderState"],
  ): Promise<void> {
    try {
      const key = this.getSessionKey(sessionId);
      const data = await this.redis.get<string>(key);

      if (!data) {
        throw new Error("Session not found");
      }

      const clientState: SerializableClientState = JSON.parse(data);
      clientState.oauthProviderState = oauthState;

      await this.redis.set(key, JSON.stringify(clientState), {
        ex: 24 * 60 * 60,
      });
    } catch (error) {
      console.error("Failed to update OAuth state:", error);
      throw new Error("Failed to update session OAuth state");
    }
  }
}

export const sessionStore = new SessionStore();

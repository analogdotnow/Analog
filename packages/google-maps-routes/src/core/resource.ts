// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { GoogleRoutes } from "../client";

export abstract class APIResource {
  protected _client: GoogleRoutes;

  constructor(client: GoogleRoutes) {
    this._client = client;
  }
}

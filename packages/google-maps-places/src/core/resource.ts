// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { GooglePlaces } from "../client";

export abstract class APIResource {
  protected _client: GooglePlaces;

  constructor(client: GooglePlaces) {
    this._client = client;
  }
}

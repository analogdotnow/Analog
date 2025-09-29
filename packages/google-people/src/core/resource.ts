// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { GooglePeople } from '../client';

export abstract class APIResource {
  protected _client: GooglePeople;

  constructor(client: GooglePeople) {
    this._client = client;
  }
}

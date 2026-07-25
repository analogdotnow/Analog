import type { MicrosoftPeople } from "../client";
import { People } from "./people";

export class Users {
  public readonly people: People;

  constructor(private readonly client: MicrosoftPeople) {
    this.people = new People(client);
  }
}

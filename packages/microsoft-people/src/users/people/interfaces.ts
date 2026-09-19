import type {
  MicrosoftPeopleRequestOptions,
  ODataCountResponse,
  Person,
  PersonCollectionResponse,
} from "../../interfaces";

export interface ListPersonInput extends MicrosoftPeopleRequestOptions {
  userId: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
  orderby?: string[];
  select?: string[];
  expand?: string[];
}

export type ListPersonResponse = PersonCollectionResponse;

export interface GetCountInput extends MicrosoftPeopleRequestOptions {
  userId: string;
  search?: string;
  filter?: string;
}

export type GetCountResponse = ODataCountResponse;

export interface GetPersonInput extends MicrosoftPeopleRequestOptions {
  userId: string;
  personId: string;
  select?: string[];
  expand?: string[];
}

export type GetPersonResponse = Person;

import type { MicrosoftPeople } from "../../client";
import type { ListMoreInput } from "../../interfaces";
import type {
  GetCountInput,
  GetCountResponse,
  GetPersonInput,
  GetPersonResponse,
  ListPersonInput,
  ListPersonResponse,
} from "./interfaces";

export class People {
  constructor(private readonly client: MicrosoftPeople) {}

  async list(params: ListPersonInput): Promise<ListPersonResponse> {
    return this.client.get<ListPersonResponse>(
      `/users/${encodeURIComponent(params.userId)}/people`,
      {
        $top: params.top,
        $skip: params.skip,
        $search: params.search,
        $filter: params.filter,
        $count: params.count,
        $orderby: params.orderby,
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async listMore(params: ListMoreInput): Promise<ListPersonResponse> {
    return this.client.get<ListPersonResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async $count(params: GetCountInput): Promise<GetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/people/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async get(params: GetPersonInput): Promise<GetPersonResponse> {
    return this.client.get<GetPersonResponse>(
      `/users/${encodeURIComponent(params.userId)}/people/${encodeURIComponent(params.personId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }
}

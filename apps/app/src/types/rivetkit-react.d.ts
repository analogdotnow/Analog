// override rivetkit types for TypeScript 6.0 compatibility
import type { RegistryActors, Registry as RivetRegistry } from "rivetkit";
import type {
  ActorConn,
  ActorConnStatus,
  ActorHandle,
  Client,
  ClientConfigInput,
  ExtractActorsFromRegistry,
} from "rivetkit/client";

type AnyActorRegistry = RivetRegistry<RegistryActors>;

type ActorOptions<
  Registry extends AnyActorRegistry,
  ActorName extends keyof ExtractActorsFromRegistry<Registry> & string,
> = {
  name: ActorName;
  key: string | string[];
  params?: unknown;
  createInRegion?: string;
  createWithInput?: unknown;
  enabled?: boolean;
  noCreate?: boolean;
};

type CreateRivetKitOptions<Registry extends AnyActorRegistry> = {
  hashFunction?: (
    opts: ActorOptions<
      Registry,
      keyof ExtractActorsFromRegistry<Registry> & string
    >,
  ) => string;
};

type UseActorResult<
  Registry extends AnyActorRegistry,
  ActorName extends keyof ExtractActorsFromRegistry<Registry> & string,
> = {
  useEvent: ActorConn<ExtractActorsFromRegistry<Registry>[ActorName]>["on"];
  error: Error | null;
  connStatus: ActorConnStatus;
  hash: string;
  opts: {
    name: string;
    key: string | string[];
    params?: unknown;
    createInRegion?: string;
    createWithInput?: unknown;
    enabled?: boolean;
    noCreate?: boolean;
  };
  handle: ActorHandle<ExtractActorsFromRegistry<Registry>[ActorName]> | null;
  connection: ActorConn<ExtractActorsFromRegistry<Registry>[ActorName]> | null;
  isConnected: boolean;
};

declare module "@rivetkit/react" {
  export function createRivetKit<Registry extends AnyActorRegistry>(
    clientInput?: string | ClientConfigInput,
    opts?: CreateRivetKitOptions<Registry>,
  ): {
    useActor: <
      ActorName extends keyof ExtractActorsFromRegistry<Registry> & string,
    >(
      opts: ActorOptions<Registry, ActorName>,
    ) => UseActorResult<Registry, ActorName>;
  };

  export function createRivetKitWithClient<Registry extends AnyActorRegistry>(
    client: Client<Registry>,
    opts?: CreateRivetKitOptions<Registry>,
  ): {
    useActor: <
      ActorName extends keyof ExtractActorsFromRegistry<Registry> & string,
    >(
      opts: ActorOptions<Registry, ActorName>,
    ) => UseActorResult<Registry, ActorName>;
  };
}

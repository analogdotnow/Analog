import type { ReactNode } from "react";
import { TRPCReactProvider } from "@/lib/trpc/client";

export function Providers(props: Readonly<{ children: ReactNode }>) {
	return <TRPCReactProvider>{props.children}</TRPCReactProvider>;
}

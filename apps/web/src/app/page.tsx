import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth/server";

export default async function Home() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) {
		redirect("/login");
	}

	return <div />;
}

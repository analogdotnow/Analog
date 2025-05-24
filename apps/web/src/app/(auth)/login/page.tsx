import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@analog/auth/server";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign In - Analog",
};

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/");
  }

  return (
    <div className="w-dvw h-dvh flex items-center justify-center">
      <SignInForm />
    </div>
  );
}

import { useForm } from "@tanstack/react-form-start";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "@repo/auth/client";

import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { SignInWithGoogleButton } from "@/components/sign-in-with-google-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Separator,
  SeparatorGroup,
  SeparatorLabel,
} from "@/components/ui/separator";
import { getSession } from "@/lib/auth.functions";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    // Redirect if already authenticated
    const session = await getSession();

    if (session) {
      throw redirect({ to: "/" });
    }
  },
  component: Login,
});

const formSchema = z.object({
  email: z.email(),
});

function Login() {
  const { mutate, isError, isPending } = useMutation({
    mutationKey: ["auth", "magic-link"],
    mutationFn: async (email: string) => {
      const { data, error } = await authClient.signIn.magicLink({
        email,
        callbackURL: "/",
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Magic link printed to the server logs");
    },
    onError: (error) => {
      toast.error(error.message ?? "An unknown error occurred");
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onMount: formSchema,
      onChange: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      mutate(value.email);
    },
  });

  return (
    <section className="flex min-h-screen bg-background px-4 py-16 md:py-32">
      <form
        className="m-auto h-fit w-full max-w-sm p-6"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Card variant="transparent">
          <CardHeader>
            <CardTitle>Analog</CardTitle>
            <CardDescription>Sign in to continue</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <SignInWithGoogleButton />

            <SeparatorGroup>
              <Separator variant="dashed" />
              <SeparatorLabel>or continue with</SeparatorLabel>
              <Separator variant="dashed" />
            </SeparatorGroup>

            <form.Field name="email">
              {(field) => (
                <Field data-invalid={isError}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isError}
                  />
                </Field>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.isValid]}>
              {([isValid]) => (
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!isValid || isPending}
                >
                  Continue
                </Button>
              )}
            </form.Subscribe>
          </CardContent>
          <CardFooter>
            <LegalDisclaimer />
          </CardFooter>
        </Card>
      </form>
    </section>
  );
}

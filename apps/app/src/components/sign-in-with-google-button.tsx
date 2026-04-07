import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { authClient } from "@repo/auth/client";

import { Google } from "@/components/icons/google";
import { Button } from "@/components/ui/button";

export function SignInWithGoogleButton() {
  const { mutate, isPending } = useMutation({
    mutationKey: ["auth", "google"],
    mutationFn: async () => {
      const { data, error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onError: (error) => {
      toast.error(error.message ?? "An unknown error occurred");
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      size="lg"
      onClick={() => mutate()}
      disabled={isPending}
    >
      <Google className="size-4" />
      Google
    </Button>
  );
}

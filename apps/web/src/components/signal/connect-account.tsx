import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@repo/auth/client";
import { useMutation } from "@tanstack/react-query";

interface ConnectAccountProps {
  className?: string;
}

export function ConnectAccount({ className }: ConnectAccountProps) {
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await authClient.signIn.oauth2({
        providerId: "zero",
        callbackURL: "/calendar",
      });
      return response;
    },
  });

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button onClick={() => mutation.mutate()}>Connect Account</Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import NumberFlow from "@number-flow/react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { useWaitlistPersistence } from "@/atoms/waitlist-persistence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email(),
});

type FormSchema = z.infer<typeof formSchema>;

function useWaitlistCount() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const query = useQuery(trpc.earlyAccess.getWaitlistCount.queryOptions());
  const { markAsJoined } = useWaitlistPersistence();

  const [success, setSuccess] = useState(false);

  const { mutate } = useMutation(
    trpc.earlyAccess.joinWaitlist.mutationOptions({
      onSuccess: () => {
        setSuccess(true);
        markAsJoined();
        queryClient.setQueryData(
          [trpc.earlyAccess.getWaitlistCount.queryKey()],
          {
            count: (query.data?.count ?? 0) + 1,
          },
        );
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.");
      },
    }),
  );

  return { count: query.data?.count ?? 0, mutate, success };
}

interface WaitlistFormProps {
  className?: string;
}

export function WaitlistForm({ className }: WaitlistFormProps) {
  const waitlist = useWaitlistCount();
  const { hasJoined } = useWaitlistPersistence();

  const form = useForm({
    defaultValues: { email: "" },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      waitlist.mutate({ email: value.email });
    },
  });

  if (waitlist.success || hasJoined) {
    return (
      <div
        className={cn(
          "mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-6",
          className,
        )}
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-xl font-semibold">
            You&apos;re on the waitlist! 🎉
          </p>
          <p className="text-base text-muted-foreground">
            We&apos;ll let you know when we&apos;re ready to show you what
            we&apos;ve been working on.
          </p>
        </div>

        <div className="relative flex flex-row items-center justify-center gap-2">
          <span className="size-2 rounded-full bg-green-600 dark:bg-green-400" />
          <span className="absolute left-0 size-2 rounded-full bg-green-600 blur-xs dark:bg-green-400" />
          <span className="text-sm text-green-600 sm:text-base dark:text-green-400">
            <NumberFlow value={waitlist.count} /> people already joined
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-6",
        className,
      )}
    >
      <form
        className="mx-auto flex w-full max-w-lg flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        {form.Field({
          name: "email",
          children: (field) => (
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="example@0.email"
              className="h-11 w-full rounded-md bg-white px-4 text-base font-medium outline outline-neutral-200 placeholder:font-medium placeholder:text-muted-foreground md:text-base"
            />
          ),
        })}

        <Button
          className="h-11 w-full pr-3 pl-4 text-base sm:w-fit"
          type="submit"
        >
          Join Waitlist <ChevronRight className="h-5 w-5" />
        </Button>
      </form>
      <div className="relative flex flex-row items-center justify-center gap-2">
        <span className="size-2 rounded-full bg-green-600 dark:bg-green-400" />
        <span className="absolute left-0 size-2 rounded-full bg-green-600 blur-xs dark:bg-green-400" />
        <span className="text-sm text-green-600 sm:text-base dark:text-green-400">
          <NumberFlow value={waitlist.count} /> people already joined
        </span>
      </div>
    </div>
  );
}

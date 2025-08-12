"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import NumberFlow from "@number-flow/react";
import { ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWaitlistCount } from "./use-waitlist-count";

const formSchema = z.object({
  email: z.string().email(),
});

type FormSchema = z.infer<typeof formSchema>;

interface WaitlistFormProps {
  className?: string;
}

export function WaitlistForm({ className }: WaitlistFormProps) {
  const { register, handleSubmit } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const waitlist = useWaitlistCount();

  function joinWaitlist({ email }: FormSchema) {
    waitlist.mutate({ email });
  }

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-6",
        className,
      )}
    >
      {waitlist.success ? (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-xl font-semibold">
            You&apos;re on the waitlist! 🎉
          </p>
          <p className="text-base text-muted-foreground">
            We&apos;ll let you know when we&#39;re ready to show you what
            we&#39;ve been working on.
          </p>
        </div>
      ) : (
        <form
          className="mx-auto flex w-full max-w-lg flex-col gap-3 sm:flex-row"
          onSubmit={handleSubmit(joinWaitlist)}
        >
          <Input
            placeholder="example@0.email"
            className="h-11 w-full rounded-lg border-border/40 px-4 text-base font-medium outline placeholder:font-medium placeholder:text-muted-foreground md:text-base"
            {...register("email")}
          />
          <Button
            className="h-11 w-full rounded-lg bg-neutral-100 text-base sm:w-fit"
            type="submit"
          >
            <span className="pl-1">Join Waitlist</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </form>
      )}

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

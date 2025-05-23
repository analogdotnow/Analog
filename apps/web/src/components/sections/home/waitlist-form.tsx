"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/lib/trpc/client";
import { z } from "zod";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email(),
});

type FormSchema = z.infer<typeof formSchema>;

function useWaitlistCount() {
  const trpc = useTRPC();

  const queryClient = useQueryClient();

  const query = useQuery(trpc.waitlist.getWaitlistCount.queryOptions());

  const { mutate } = useMutation(
    trpc.waitlist.joinWaitlist.mutationOptions({
      onSuccess: () => {
        toast.success("You've been added to the waitlist!");

        queryClient.setQueryData([trpc.waitlist.getWaitlistCount.queryKey()], {
          count: query.data?.count ?? 0 + 1,
        });
      },
      onError: (error) => {
        if (error.data?.code === "BAD_REQUEST") {
          toast.error("You're already on the waitlist!");
          return;
        }

        toast.error("Something went wrong. Please try again.");
      },
    }),
  );

  return { count: query.data?.count ?? 0, mutate };
}

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
        "flex flex-col gap-6 items-center justify-center w-full max-w-3xl mx-auto",
        className,
      )}
    >
      <form
        className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto"
        onSubmit={handleSubmit(joinWaitlist)}
      >
        <Input
          placeholder="example@0.email"
          className="md:text-base text-base font-medium h-11 placeholder:text-muted-foreground placeholder:font-medium bg-white outline outline-neutral-200 w-full rounded-md px-4"
          {...register("email")}
        />
        <Button
          className="w-full sm:w-fit pl-4 pr-3 h-11 text-base"
          type="submit"
        >
          Join Waitlist <ChevronRight className="h-5 w-5" />
        </Button>
      </form>

      <div className="relative flex flex-row gap-2 items-center justify-center">
        <span className="bg-green-600 dark:bg-green-400 size-2 rounded-full" />
        <span className="bg-green-600 dark:bg-green-400 size-2 rounded-full blur-xs left-0 absolute" />
        <span className="text-green-600 dark:text-green-400 text-sm sm:text-base">
          <NumberFlow value={waitlist.count} />{" "}
          {waitlist.count === 1 ? "person" : "people"} already joined
        </span>
      </div>
    </div>
  );
}

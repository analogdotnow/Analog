"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";

import NumberFlow from "@number-flow/react";

import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const formSchema = z.object({
  email: z.string().email(),
});

type FormSchema = z.infer<typeof formSchema>;

export default function Home() {
  const [waitlistCount, setWaitlistCount] = useState<number>(0);

  const { register, handleSubmit } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const trpc = useTRPC();

  const { mutate: joinWaitlist } = useMutation(
    trpc.waitlist.joinWaitlist.mutationOptions({
      onSuccess: () => {
        toast.success("You've been added to the waitlist!");
        setWaitlistCount(waitlistCount + 1);
      },
      onError: (error) => {
        if (error.data?.code === "BAD_REQUEST")
          return toast.error("You're already on the waitlist!");

        return toast.error("Something went wrong. Please try again.");
      },
    }),
  );

  const { data: waitlistCountResult } = useQuery(
    trpc.waitlist.getWaitlistCount.queryOptions(),
  );

  useEffect(() => {
    if (waitlistCountResult) setWaitlistCount(waitlistCountResult.count);
  }, [waitlistCountResult]);

  function handleJoinWaitlist({ email }: FormSchema) {
    joinWaitlist({ email });
  }

  return (
    <main className="flex flex-col gap-8 md:gap-12 w-full items-center justify-center px-4 md:px-6">
      <div className="flex flex-col gap-6 w-full max-w-3xl">
        <div className="flex flex-col gap-3 md:gap-4 items-center justify-center text-center">
          <h1 className="font-safiro text-4xl sm:text-5xl md:text-6xl leading-tight">
            Beyond Scheduling. <br className="hidden sm:block" /> A calendar
            that understands your life.
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl">
            The open-source alternative that turns intentions into actions.
          </p>
        </div>

        <div className="flex flex-col gap-3 items-center justify-center w-full">
          <form
            className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto"
            onSubmit={handleSubmit(handleJoinWaitlist)}
          >
            <Input
              placeholder="john@acme.de"
              className="font-medium h-11 placeholder:text-muted-foreground placeholder:font-medium bg-white outline outline-neutral-200 w-full rounded-md px-4"
              {...register("email")}
            />
            <Button className="w-full sm:w-fit pl-4 pr-3 h-11" type="submit">
              Join Waitlist <ChevronRight className="h-5 w-5" />
            </Button>
          </form>

          <div className="relative flex flex-row gap-2 items-center justify-center">
            <span className="bg-green-400 size-2 rounded-full" />
            <span className="bg-green-400 size-2 rounded-full blur-xs left-0 absolute" />
            <span className="text-green-400 text-sm sm:text-base">
              <NumberFlow value={waitlistCount} /> people already joined
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

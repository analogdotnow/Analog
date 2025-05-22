import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/lib/trpc/client";
import { z } from "zod";

import Image from "next/image";
import { useTheme } from "next-themes";

import heroDark from "@/assets/dark-preview.png"
import heroLight from "@/assets/preview.png"

const formSchema = z.object({
  email: z.string().email(),
});

type FormSchema = z.infer<typeof formSchema>;

export function Hero() {
  const [isMounted, setIsMounted] = useState(false);  
  const { resolvedTheme } = useTheme()

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


  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl overflow-hidden">
      <div className="flex flex-col gap-3 md:gap-4 items-center justify-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl leading-tight font-satoshi">
          Beyond Scheduling. <br className="hidden md:block" /> A calendar that
          understands your life.
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl">
          The open-source alternative that turns intentions into actions.
        </p>
      </div>

      <div className="flex flex-col gap-3 items-center justify-center w-full max-w-3xl mx-auto">
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

      <div className="min-w-[300vw] w-full md:max-w-7xl md:min-w-0 md:translate-x-0 mx-auto">
        <Image
          src={resolvedTheme === "dark" ? heroDark : heroLight}
          alt="Hero"
          className="rounded-lg"
        />
      </div>
    </div>
  );
}

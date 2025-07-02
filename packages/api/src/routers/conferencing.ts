import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { accountToConferencingProvider } from "../providers";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { getAccounts } from "../utils/accounts";

export const conferencingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        calendarId: z.string().optional(),
        eventId: z.string().optional(),
        accountId: z.string(),
        providerId: z.enum(["google", "zoom", "none"]).default("none"),
        agenda: z.string().default("Meeting"),
        startTime: z.string(),
        endTime: z.string(),
        timeZone: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.providerId === "none") {
        return { conferenceData: null };
      }

      const accounts = await getAccounts(ctx.user, ctx.headers);

      const account = accounts.find(
        (a) => a.id === input.accountId && a.providerId === input.providerId,
      );

      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      
      
      const provider = accountToConferencingProvider(account, input.providerId);
      
      console.log({ providerName: provider.providerId })

      const conferenceData = await provider.createConferencing(
        input.agenda,
        input.startTime,
        input.endTime,
        input.timeZone,
        input.calendarId,
        input.eventId,
      );

      return { conferenceData };
    }),
});
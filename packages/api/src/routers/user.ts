import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
	me: protectedProcedure.query(({ ctx }) => {
		return {
			...ctx.user,
			session: {
				id: ctx.session.id,
				ipAddress: ctx.session.ipAddress,
				userAgent: ctx.session.userAgent,
			},
		};
	}),
});

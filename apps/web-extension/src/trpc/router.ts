import { initTRPC } from "@trpc/server";
import { z } from "zod";

const trpc = initTRPC.create();

export const appRouter = trpc.router({
  ping: trpc.procedure.query(() => {
    return {
      message: "pong",
      source: "background",
      timestamp: new Date().toISOString(),
    };
  }),
  sendMessage: trpc.procedure
    .input(
      z.object({
        message: z.string().min(1),
      })
    )
    .mutation(({ input }) => {
      return {
        received: input.message,
        source: "background",
      };
    }),
});

export type AppRouter = typeof appRouter;
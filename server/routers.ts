import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { franceTravailRouter } from "./routers/franceTravail";
import { usersRouter } from "./routers/users";
import { organizationsRouter } from "./routers/organizations";
import { bilansRouter } from "./routers/bilans";
import { sessionsRouter } from "./routers/sessions";
import { recommendationsRouter } from "./routers/recommendations";
import { messagesRouter } from "./routers/messages";
import { documentsRouter } from "./routers/documents";
import { pdfRouter } from "./routers/pdf";
import { skillsEvaluationsRouter } from "./routers/skillsEvaluations";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  franceTravail: franceTravailRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // BilanCompetence.AI feature routers
  users: usersRouter,
  organizations: organizationsRouter,
  bilans: bilansRouter,
  sessions: sessionsRouter,
  recommendations: recommendationsRouter,
  messages: messagesRouter,
  documents: documentsRouter,
  pdf: pdfRouter,
  skillsEvaluations: skillsEvaluationsRouter,
});

export type AppRouter = typeof appRouter;

import { z } from "zod";
import { router, protectedProcedure, consultantProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const sessionsRouter = router({
  /**
   * List sessions for a bilan
   */
  listByBilan: protectedProcedure
    .input(z.object({ bilanId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Check bilan access
      const bilan = await db.getBilanById(input.bilanId);
      if (!bilan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bilan not found" });
      }

      const hasAccess =
        ctx.user.role === "ADMIN" ||
        (ctx.user.role === "ORG_ADMIN" && bilan.organizationId === ctx.user.organizationId) ||
        (ctx.user.role === "CONSULTANT" && bilan.consultantId === ctx.user.id) ||
        (ctx.user.role === "BENEFICIARY" && bilan.beneficiaryId === ctx.user.id);

      if (!hasAccess) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return await db.listSessionsByBilan(input.bilanId);
    }),

  /**
   * Create a session
   */
  create: consultantProcedure
    .input(
      z.object({
        bilanId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        scheduledAt: z.date(),
        durationMinutes: z.number().min(15).max(480).default(60),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check bilan exists and user has access
      const bilan = await db.getBilanById(input.bilanId);
      if (!bilan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bilan not found" });
      }

      const hasAccess =
        ctx.user.role === "ADMIN" ||
        (ctx.user.role === "ORG_ADMIN" && bilan.organizationId === ctx.user.organizationId) ||
        (ctx.user.role === "CONSULTANT" && bilan.consultantId === ctx.user.id);

      if (!hasAccess) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return await db.createSession({
        ...input,
        consultantId: bilan.consultantId!,
        beneficiaryId: bilan.beneficiaryId,
        status: "SCHEDULED",
      });
    }),

  /**
   * Update session
   */
  update: consultantProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        scheduledAt: z.date().optional(),
        durationMinutes: z.number().min(15).max(480).optional(),
        location: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Get session and check access
      const sessions = await db.listSessionsByBilan(0); // We need to get session first
      const session = sessions.find((s) => s.id === id);

      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      // Check bilan access
      const bilan = await db.getBilanById(session.bilanId);
      if (!bilan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bilan not found" });
      }

      const hasAccess =
        ctx.user.role === "ADMIN" ||
        (ctx.user.role === "ORG_ADMIN" && bilan.organizationId === ctx.user.organizationId) ||
        (ctx.user.role === "CONSULTANT" && bilan.consultantId === ctx.user.id);

      if (!hasAccess) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return await db.updateSession(id, data);
    }),

  /**
   * Mark session as completed
   */
  markCompleted: consultantProcedure
    .input(
      z.object({
        id: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get session and check access (similar to update)
      const sessions = await db.listSessionsByBilan(0);
      const session = sessions.find((s) => s.id === input.id);

      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      const bilan = await db.getBilanById(session.bilanId);
      if (!bilan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bilan not found" });
      }

      const hasAccess =
        ctx.user.role === "ADMIN" ||
        (ctx.user.role === "ORG_ADMIN" && bilan.organizationId === ctx.user.organizationId) ||
        (ctx.user.role === "CONSULTANT" && bilan.consultantId === ctx.user.id);

      if (!hasAccess) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return await db.updateSession(input.id, {
        status: "COMPLETED",
        notes: input.notes,
      });
    }),

  /**
   * Cancel or reschedule session
   */
  updateStatus: consultantProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"]),
        scheduledAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, status, scheduledAt } = input;

      // Get session and check access
      const sessions = await db.listSessionsByBilan(0);
      const session = sessions.find((s) => s.id === id);

      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      const bilan = await db.getBilanById(session.bilanId);
      if (!bilan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bilan not found" });
      }

      const hasAccess =
        ctx.user.role === "ADMIN" ||
        (ctx.user.role === "ORG_ADMIN" && bilan.organizationId === ctx.user.organizationId) ||
        (ctx.user.role === "CONSULTANT" && bilan.consultantId === ctx.user.id);

      if (!hasAccess) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const updateData: any = { status };
      if (status === "RESCHEDULED" && scheduledAt) {
        updateData.scheduledAt = scheduledAt;
      }

      return await db.updateSession(id, updateData);
    }),
});

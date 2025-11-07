import { z } from "zod";
import { router, protectedProcedure, consultantProcedure, orgAdminProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const bilansRouter = router({
  /**
   * List bilans (filtered by user role)
   */
  list: protectedProcedure
    .input(
      z
        .object({
          beneficiaryId: z.number().optional(),
          consultantId: z.number().optional(),
          organizationId: z.number().optional(),
          status: z
            .enum(["PRELIMINARY", "INVESTIGATION", "CONCLUSION", "COMPLETED", "ARCHIVED"])
            .optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters = { ...input };

      // Apply role-based filtering
      if (ctx.user.role === "BENEFICIARY") {
        // Beneficiaries only see their own bilans
        filters.beneficiaryId = ctx.user.id;
      } else if (ctx.user.role === "CONSULTANT") {
        // Consultants only see bilans assigned to them
        filters.consultantId = ctx.user.id;
      } else if (ctx.user.role === "ORG_ADMIN" && ctx.user.organizationId) {
        // Org admins see all bilans in their organization
        filters.organizationId = ctx.user.organizationId;
      }
      // ADMIN sees all bilans (no filter)

      return await db.listBilans(filters);
    }),

  /**
   * Get bilan by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const bilan = await db.getBilanById(input.id);

      if (!bilan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bilan not found" });
      }

      // Check access rights
      const hasAccess =
        ctx.user.role === "ADMIN" ||
        (ctx.user.role === "ORG_ADMIN" && bilan.organizationId === ctx.user.organizationId) ||
        (ctx.user.role === "CONSULTANT" && bilan.consultantId === ctx.user.id) ||
        (ctx.user.role === "BENEFICIARY" && bilan.beneficiaryId === ctx.user.id);

      if (!hasAccess) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return bilan;
    }),

  /**
   * Create a new bilan
   */
  create: orgAdminProcedure
    .input(
      z.object({
        beneficiaryId: z.number(),
        consultantId: z.number().optional(),
        organizationId: z.number().optional(),
        objectives: z.string().optional(),
        context: z.string().optional(),
        expectedEndDate: z.date().optional(),
        durationHours: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If org_admin, set their organization
      const organizationId =
        ctx.user.role === "ORG_ADMIN" ? ctx.user.organizationId : input.organizationId;

      return await db.createBilan({
        ...input,
        organizationId: organizationId ?? undefined,
        status: "PRELIMINARY",
      });
    }),

  /**
   * Update bilan
   */
  update: consultantProcedure
    .input(
      z.object({
        id: z.number(),
        consultantId: z.number().optional(),
        objectives: z.string().optional(),
        context: z.string().optional(),
        expectedEndDate: z.date().optional(),
        actualEndDate: z.date().optional(),
        durationHours: z.number().optional(),
        assessmentData: z.any().optional(),
        synthesisData: z.any().optional(),
        actionPlan: z.any().optional(),
        satisfactionScore: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check bilan exists and user has access
      const bilan = await db.getBilanById(id);
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

      return await db.updateBilan(id, data);
    }),

  /**
   * Update bilan status (workflow transition)
   */
  updateStatus: consultantProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["PRELIMINARY", "INVESTIGATION", "CONCLUSION", "COMPLETED", "ARCHIVED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check bilan exists and user has access
      const bilan = await db.getBilanById(input.id);
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

      // Validate workflow transition
      const validTransitions: Record<string, string[]> = {
        PRELIMINARY: ["INVESTIGATION"],
        INVESTIGATION: ["CONCLUSION"],
        CONCLUSION: ["COMPLETED"],
        COMPLETED: ["ARCHIVED"],
        ARCHIVED: [],
      };

      if (!validTransitions[bilan.status]?.includes(input.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot transition from ${bilan.status} to ${input.status}`,
        });
      }

      // If completing, set actualEndDate
      const updateData: any = { status: input.status };
      if (input.status === "COMPLETED") {
        updateData.actualEndDate = new Date();
      }

      return await db.updateBilan(input.id, updateData);
    }),

  /**
   * Delete bilan (admin or org_admin only)
   */
  delete: orgAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check bilan exists and user has access
      const bilan = await db.getBilanById(input.id);
      if (!bilan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bilan not found" });
      }

      if (ctx.user.role === "ORG_ADMIN") {
        if (bilan.organizationId !== ctx.user.organizationId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      return await db.deleteBilan(input.id);
    }),

  /**
   * Assign consultant to bilan
   */
  assignConsultant: orgAdminProcedure
    .input(
      z.object({
        bilanId: z.number(),
        consultantId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check bilan exists and user has access
      const bilan = await db.getBilanById(input.bilanId);
      if (!bilan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bilan not found" });
      }

      if (ctx.user.role === "ORG_ADMIN") {
        if (bilan.organizationId !== ctx.user.organizationId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      // Verify consultant exists and belongs to same organization
      const consultant = await db.getUserById(input.consultantId);
      if (!consultant || consultant.role !== "CONSULTANT") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid consultant" });
      }

      if (consultant.organizationId !== bilan.organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Consultant must belong to the same organization",
        });
      }

      return await db.updateBilan(input.bilanId, {
        consultantId: input.consultantId,
      });
    }),
});

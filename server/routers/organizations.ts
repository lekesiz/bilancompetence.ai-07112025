import { z } from "zod";
import { router, adminProcedure, orgAdminProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const organizationsRouter = router({
  /**
   * List all organizations (admin only sees all, org_admin sees their own)
   */
  list: orgAdminProcedure
    .input(
      z
        .object({
          isActive: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      // If org_admin, only return their organization
      if (ctx.user.role === "ORG_ADMIN" && ctx.user.organizationId) {
        const org = await db.getOrganizationById(ctx.user.organizationId);
        return org ? [org] : [];
      }

      return await db.listOrganizations(input);
    }),

  /**
   * Get organization by ID
   */
  getById: orgAdminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const org = await db.getOrganizationById(input.id);

      if (!org) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
      }

      // If org_admin, check they belong to this organization
      if (ctx.user.role === "ORG_ADMIN") {
        if (org.id !== ctx.user.organizationId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      return org;
    }),

  /**
   * Create organization (admin only)
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        siret: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().url().optional(),
        logoUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.createOrganization(input);
    }),

  /**
   * Update organization
   */
  update: orgAdminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        siret: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().url().optional(),
        logoUrl: z.string().url().optional(),
        settings: z.any().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check organization exists
      const org = await db.getOrganizationById(id);
      if (!org) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
      }

      // If org_admin, check they belong to this organization
      if (ctx.user.role === "ORG_ADMIN") {
        if (org.id !== ctx.user.organizationId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      return await db.updateOrganization(id, data);
    }),

  /**
   * Get organization statistics
   */
  getStats: orgAdminProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ ctx, input }) => {
      // If org_admin, check they belong to this organization
      if (ctx.user.role === "ORG_ADMIN") {
        if (input.organizationId !== ctx.user.organizationId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      // Get counts
      const users = await db.listUsers({ organizationId: input.organizationId });
      const bilans = await db.listBilans({ organizationId: input.organizationId });

      const consultants = users.filter((u) => u.role === "CONSULTANT");
      const beneficiaries = users.filter((u) => u.role === "BENEFICIARY");

      const activeBilans = bilans.filter(
        (b) => b.status !== "COMPLETED" && b.status !== "ARCHIVED"
      );
      const completedBilans = bilans.filter((b) => b.status === "COMPLETED");

      return {
        totalUsers: users.length,
        totalConsultants: consultants.length,
        totalBeneficiaries: beneficiaries.length,
        totalBilans: bilans.length,
        activeBilans: activeBilans.length,
        completedBilans: completedBilans.length,
      };
    }),
});

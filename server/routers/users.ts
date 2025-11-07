import { z } from "zod";
import { router, protectedProcedure, adminProcedure, orgAdminProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const usersRouter = router({
  /**
   * Get current user profile
   */
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  /**
   * Update current user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        avatarUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await db.updateUser(ctx.user.id, input);
    }),

  /**
   * List all users (admin or org_admin only)
   */
  list: orgAdminProcedure
    .input(
      z
        .object({
          role: z.enum(["BENEFICIARY", "CONSULTANT", "ORG_ADMIN", "ADMIN"]).optional(),
          organizationId: z.number().optional(),
          isActive: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      // If org_admin, filter by their organization
      const filters = { ...input };
      if (ctx.user.role === "ORG_ADMIN" && ctx.user.organizationId) {
        filters.organizationId = ctx.user.organizationId;
      }

      return await db.listUsers(filters);
    }),

  /**
   * Get user by ID
   */
  getById: orgAdminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = await db.getUserById(input.id);

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // If org_admin, check they belong to same organization
      if (ctx.user.role === "ORG_ADMIN") {
        if (user.organizationId !== ctx.user.organizationId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      return user;
    }),

  /**
   * Update user (admin or org_admin only)
   */
  update: orgAdminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.enum(["BENEFICIARY", "CONSULTANT", "ORG_ADMIN", "ADMIN"]).optional(),
        organizationId: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check user exists and belongs to same org (if org_admin)
      const user = await db.getUserById(id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (ctx.user.role === "ORG_ADMIN") {
        if (user.organizationId !== ctx.user.organizationId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        // Org admins cannot change roles to ADMIN
        if (data.role === "ADMIN") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot assign ADMIN role" });
        }
      }

      return await db.updateUser(id, data);
    }),

  /**
   * Deactivate user
   */
  deactivate: orgAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check user exists and belongs to same org (if org_admin)
      const user = await db.getUserById(input.id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (ctx.user.role === "ORG_ADMIN") {
        if (user.organizationId !== ctx.user.organizationId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      return await db.deactivateUser(input.id);
    }),

  /**
   * Assign consultant to organization
   */
  assignToOrganization: orgAdminProcedure
    .input(
      z.object({
        userId: z.number(),
        organizationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If org_admin, can only assign to their own organization
      if (ctx.user.role === "ORG_ADMIN") {
        if (input.organizationId !== ctx.user.organizationId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }

      return await db.updateUser(input.userId, {
        organizationId: input.organizationId,
      });
    }),
});

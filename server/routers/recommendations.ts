import { z } from "zod";
import { router, protectedProcedure, consultantProcedure } from "../_core/trpc";
import * as db from "../db";
import * as gemini from "../gemini";
import { TRPCError } from "@trpc/server";

export const recommendationsRouter = router({
  /**
   * Generate career recommendations based on skills and interests
   */
  generateCareer: consultantProcedure
    .input(
      z.object({
        bilanId: z.number(),
        skills: z.array(z.string()),
        interests: z.array(z.string()),
        experience: z.string(),
        goals: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check bilan access
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

      // Generate recommendations using Gemini
      const result = await gemini.generateCareerRecommendations({
        skills: input.skills,
        interests: input.interests,
        experience: input.experience,
        goals: input.goals,
      });

      // Save recommendations to database
      for (const rec of result.recommendations) {
        await db.createRecommendation({
          bilanId: input.bilanId,
          type: "JOB",
          title: rec.title,
          description: rec.description,
          matchScore: rec.matchScore,
          metadata: rec,
          priority: rec.matchScore >= 80 ? 3 : rec.matchScore >= 60 ? 2 : 1,
        });
      }

      return result;
    }),

  /**
   * Analyze skills assessment
   */
  analyzeSkills: consultantProcedure
    .input(
      z.object({
        bilanId: z.number(),
        selfAssessment: z.record(z.string(), z.number()),
        professionalBackground: z.string(),
        achievements: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check bilan access
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

      // Analyze using Gemini
      const result = await gemini.analyzeSkillsAssessment({
        selfAssessment: input.selfAssessment,
        professionalBackground: input.professionalBackground,
        achievements: input.achievements,
      });

      // Save analysis to bilan
      await db.updateBilan(input.bilanId, {
        assessmentData: JSON.stringify(result),
      });

      return result;
    }),

  /**
   * Generate action plan
   */
  generateActionPlan: consultantProcedure
    .input(
      z.object({
        bilanId: z.number(),
        currentSituation: z.string(),
        goals: z.array(z.string()),
        constraints: z.array(z.string()),
        timeline: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check bilan access
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

      // Generate action plan using Gemini
      const result = await gemini.generateActionPlan({
        currentSituation: input.currentSituation,
        goals: input.goals,
        constraints: input.constraints,
        timeline: input.timeline,
      });

      // Save action plan to bilan
      await db.updateBilan(input.bilanId, {
        actionPlan: JSON.stringify(result),
      });

      // Create recommendations for each action
      for (const action of result.shortTermActions.slice(0, 3)) {
        await db.createRecommendation({
          bilanId: input.bilanId,
          type: "SKILL",
          title: action.action,
          description: `Priorité: ${action.priority} - Échéance: ${action.deadline}`,
          metadata: action,
          priority: action.priority === "HIGH" ? 3 : action.priority === "MEDIUM" ? 2 : 1,
        });
      }

      return result;
    }),

  /**
   * Generate bilan synthesis
   */
  generateSynthesis: consultantProcedure
    .input(z.object({ bilanId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check bilan access
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

      // Get beneficiary info
      const beneficiary = await db.getUserById(bilan.beneficiaryId);
      if (!beneficiary) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Beneficiary not found" });
      }

      // Get sessions
      const sessions = await db.listSessionsByBilan(input.bilanId);

      // Get recommendations
      const recommendations = await db.listRecommendationsByBilan(input.bilanId);

      // Generate synthesis using Gemini
      const synthesis = await gemini.generateBilanSynthesis({
        beneficiaryName: beneficiary.name || "Bénéficiaire",
        objectives: bilan.objectives || "",
        skillsAssessment: bilan.assessmentData ? JSON.parse(bilan.assessmentData as string) : {},
        recommendations: recommendations,
        actionPlan: bilan.actionPlan ? JSON.parse(bilan.actionPlan as string) : {},
        sessions: sessions.map((s) => ({
          title: s.title,
          date: new Date(s.scheduledAt).toLocaleDateString("fr-FR"),
          notes: s.notes || undefined,
        })),
      });

      // Save synthesis to bilan
      await db.updateBilan(input.bilanId, {
        synthesisData: JSON.stringify({ content: synthesis, generatedAt: new Date() }),
      });

      return { synthesis };
    }),

  /**
   * List recommendations for a bilan
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

      return await db.listRecommendationsByBilan(input.bilanId);
    }),
});

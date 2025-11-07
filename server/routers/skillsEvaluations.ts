import { z } from "zod";
import { protectedProcedure, consultantProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { skillsEvaluations } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const skillsEvaluationsRouter = router({
  /**
   * Sauvegarder ou mettre à jour une évaluation de compétence
   */
  save: protectedProcedure
    .input(
      z.object({
        bilanId: z.number(),
        skillName: z.string(),
        category: z.string().optional(),
        level: z.number().min(1).max(5),
        frequency: z.enum(["RARE", "OCCASIONAL", "FREQUENT", "DAILY"]).optional(),
        preference: z.enum(["DISLIKE", "NEUTRAL", "LIKE", "LOVE"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Vérifier si l'évaluation existe déjà
      const existing = await db
        .select()
        .from(skillsEvaluations)
        .where(
          and(
            eq(skillsEvaluations.bilanId, input.bilanId),
            eq(skillsEvaluations.skillName, input.skillName)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Mise à jour
        await db
          .update(skillsEvaluations)
          .set({
            level: input.level,
            frequency: input.frequency,
            preference: input.preference,
            notes: input.notes,
            category: input.category,
          })
          .where(eq(skillsEvaluations.id, existing[0].id));

        return { id: existing[0].id, updated: true };
      } else {
        // Création
        const [result] = await db
          .insert(skillsEvaluations)
          .values({
            bilanId: input.bilanId,
            skillName: input.skillName,
            category: input.category,
            level: input.level,
            frequency: input.frequency,
            preference: input.preference,
            notes: input.notes,
          })
          .$returningId();

        return { id: result.id, updated: false };
      }
    }),

  /**
   * Sauvegarder plusieurs évaluations en batch
   */
  saveBatch: protectedProcedure
    .input(
      z.object({
        bilanId: z.number(),
        evaluations: z.array(
          z.object({
            skillName: z.string(),
            category: z.string().optional(),
            level: z.number().min(1).max(5),
            frequency: z.enum(["RARE", "OCCASIONAL", "FREQUENT", "DAILY"]).optional(),
            preference: z.enum(["DISLIKE", "NEUTRAL", "LIKE", "LOVE"]).optional(),
            notes: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Supprimer les anciennes évaluations du bilan
      await db.delete(skillsEvaluations).where(eq(skillsEvaluations.bilanId, input.bilanId));

      // Insérer les nouvelles évaluations
      if (input.evaluations.length > 0) {
        await db.insert(skillsEvaluations).values(
          input.evaluations.map((evaluation) => ({
            bilanId: input.bilanId,
            skillName: evaluation.skillName,
            category: evaluation.category,
            level: evaluation.level,
            frequency: evaluation.frequency,
            preference: evaluation.preference,
            notes: evaluation.notes,
          }))
        );
      }

      return { success: true, count: input.evaluations.length };
    }),

  /**
   * Lister les évaluations d'un bilan
   */
  listByBilan: protectedProcedure
    .input(
      z.object({
        bilanId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const evaluations = await db
        .select()
        .from(skillsEvaluations)
        .where(eq(skillsEvaluations.bilanId, input.bilanId));

      return evaluations;
    }),

  /**
   * Valider une évaluation (consultant)
   */
  validate: consultantProcedure
    .input(
      z.object({
        id: z.number(),
        validated: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(skillsEvaluations)
        .set({ validatedByConsultant: input.validated })
        .where(eq(skillsEvaluations.id, input.id));

      return { success: true };
    }),

  /**
   * Supprimer une évaluation
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(skillsEvaluations).where(eq(skillsEvaluations.id, input.id));

      return { success: true };
    }),

  /**
   * Obtenir les statistiques des compétences d'un bilan
   */
  getStats: protectedProcedure
    .input(
      z.object({
        bilanId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const evaluations = await db
        .select()
        .from(skillsEvaluations)
        .where(eq(skillsEvaluations.bilanId, input.bilanId));

      const totalSkills = evaluations.length;
      const averageLevel =
        evaluations.reduce((sum, evaluation) => sum + evaluation.level, 0) / (totalSkills || 1);
      const validatedCount = evaluations.filter((e) => e.validatedByConsultant).length;

      const byCategory = evaluations.reduce((acc, evaluation) => {
        const cat = evaluation.category || "Autre";
        if (!acc[cat]) {
          acc[cat] = { count: 0, totalLevel: 0 };
        }
        acc[cat].count++;
        acc[cat].totalLevel += evaluation.level;
        return acc;
      }, {} as Record<string, { count: number; totalLevel: number }>);

      const categoryStats = Object.entries(byCategory).map(([category, stats]) => ({
        category,
        count: stats.count,
        averageLevel: stats.totalLevel / stats.count,
      }));

      return {
        totalSkills,
        averageLevel: Math.round(averageLevel * 10) / 10,
        validatedCount,
        validationRate: Math.round((validatedCount / (totalSkills || 1)) * 100),
        categoryStats,
      };
    }),
});

import { z } from "zod";
import { protectedProcedure, consultantProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { bilans, users, sessions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  generateSynthesisPDF,
  generateAttestationPDF,
  generateSessionReportPDF,
} from "../pdfGenerator";
import { storagePut } from "../storage";

export const pdfRouter = router({
  /**
   * Générer une synthèse de bilan en PDF
   */
  generateSynthesis: consultantProcedure
    .input(
      z.object({
        bilanId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Récupérer les données du bilan
      const [bilan] = await db.select().from(bilans).where(eq(bilans.id, input.bilanId));

      if (!bilan) {
        throw new Error("Bilan not found");
      }

      // Récupérer les utilisateurs
      const [beneficiary] = await db.select().from(users).where(eq(users.id, bilan.beneficiaryId));
      const [consultant] = await db.select().from(users).where(eq(users.id, bilan.consultantId));

      // Données simulées pour la démonstration
      const pdfData = {
        id: bilan.id,
        beneficiaryName: beneficiary?.name || "Bénéficiaire",
        consultantName: consultant?.name || "Consultant",
        startDate: bilan.startDate,
        endDate: bilan.updatedAt, // Using updatedAt as endDate
        status: bilan.status,
        skills: [
          { name: "Communication", level: 4 },
          { name: "Leadership", level: 3 },
          { name: "Gestion de projet", level: 4 },
          { name: "Analyse", level: 5 },
        ],
        recommendations: [
          {
            title: "Chef de projet digital",
            description:
              "Vos compétences en gestion de projet et communication sont excellentes pour ce poste.",
          },
          {
            title: "Consultant en organisation",
            description: "Votre capacité d'analyse et votre leadership sont des atouts majeurs.",
          },
        ],
        actionPlan:
          "Suivre une formation en management agile, développer votre réseau professionnel dans le secteur du conseil, et préparer votre candidature pour des postes de chef de projet.",
      };

      // Générer le PDF
      const pdfBuffer = await generateSynthesisPDF(pdfData);

      // Upload vers S3
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `bilans/${input.bilanId}/synthese-${randomSuffix}.pdf`;
      const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");

      return { url };
    }),

  /**
   * Générer une attestation de bilan en PDF
   */
  generateAttestation: consultantProcedure
    .input(
      z.object({
        bilanId: z.number(),
        totalHours: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Récupérer les données du bilan
      const [bilan] = await db.select().from(bilans).where(eq(bilans.id, input.bilanId));

      if (!bilan) {
        throw new Error("Bilan not found");
      }

      // Récupérer les utilisateurs
      const [beneficiary] = await db.select().from(users).where(eq(users.id, bilan.beneficiaryId));
      const [consultant] = await db.select().from(users).where(eq(users.id, bilan.consultantId));

      const pdfData = {
        id: bilan.id,
        beneficiaryName: beneficiary?.name || "Bénéficiaire",
        consultantName: consultant?.name || "Consultant",
        startDate: bilan.startDate,
        endDate: bilan.updatedAt, // Using updatedAt as endDate
        status: bilan.status,
        totalHours: input.totalHours,
        organizationName: "BilanCompetence.AI",
      };

      // Générer le PDF
      const pdfBuffer = await generateAttestationPDF(pdfData);

      // Upload vers S3
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `bilans/${input.bilanId}/attestation-${randomSuffix}.pdf`;
      const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");

      return { url };
    }),

  /**
   * Générer un rapport de session en PDF
   */
  generateSessionReport: consultantProcedure
    .input(
      z.object({
        sessionId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Récupérer la session
      const [session] = await db.select().from(sessions).where(eq(sessions.id, input.sessionId));

      if (!session) {
        throw new Error("Session not found");
      }

      // Récupérer le bilan
      const [bilan] = await db.select().from(bilans).where(eq(bilans.id, session.bilanId));

      if (!bilan) {
        throw new Error("Bilan not found");
      }

      // Récupérer les utilisateurs
      const [beneficiary] = await db.select().from(users).where(eq(users.id, bilan.beneficiaryId));
      const [consultant] = await db.select().from(users).where(eq(users.id, bilan.consultantId));

      const pdfData = {
        sessionNumber: session.id, // Using session ID as number
        bilanId: bilan.id,
        beneficiaryName: beneficiary?.name || "Bénéficiaire",
        consultantName: consultant?.name || "Consultant",
        date: session.scheduledAt,
        duration: session.durationMinutes,
        notes: session.notes || "Aucune note disponible",
        nextSteps:
          "Continuer l'évaluation des compétences et préparer la prochaine session de travail.",
      };

      // Générer le PDF
      const pdfBuffer = await generateSessionReportPDF(pdfData);

      // Upload vers S3
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `bilans/${bilan.id}/session-${session.id}-${randomSuffix}.pdf`;
      const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");

      return { url };
    }),
});

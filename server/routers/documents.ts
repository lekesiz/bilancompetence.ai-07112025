import { z } from "zod";
import { protectedProcedure, consultantProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { documents } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "../storage";

export const documentsRouter = router({
  /**
   * Upload un document
   */
  upload: protectedProcedure
    .input(
      z.object({
        bilanId: z.number(),
        type: z.enum(["CV", "LETTRE_MOTIVATION", "SYNTHESE", "ATTESTATION", "AUTRE"]),
        name: z.string(),
        fileData: z.string(), // Base64 encoded file
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Décoder le fichier base64
      const buffer = Buffer.from(input.fileData, "base64");

      // Upload vers S3
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `bilans/${input.bilanId}/documents/${input.name}-${randomSuffix}`;

      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // Enregistrer dans la base de données
      const [document] = await db
        .insert(documents)
        .values({
          bilanId: input.bilanId,
          type: input.type,
          name: input.name,
          url,
          uploadedBy: ctx.user.id,
        })
        .$returningId();

      return { id: document.id, url };
    }),

  /**
   * Lister les documents d'un bilan
   */
  listByBilan: protectedProcedure
    .input(
      z.object({
        bilanId: z.number(),
        type: z.enum(["CV", "LETTRE_MOTIVATION", "SYNTHESE", "ATTESTATION", "AUTRE"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(documents).where(eq(documents.bilanId, input.bilanId));

      if (input.type) {
        query = query.where(and(eq(documents.bilanId, input.bilanId), eq(documents.type, input.type)));
      }

      const result = await query;
      return result;
    }),

  /**
   * Obtenir un document par ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [document] = await db.select().from(documents).where(eq(documents.id, input.id));

      if (!document) {
        throw new Error("Document not found");
      }

      return document;
    }),

  /**
   * Supprimer un document
   */
  delete: consultantProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(documents).where(eq(documents.id, input.id));

      return { success: true };
    }),

  /**
   * Mettre à jour le nom d'un document
   */
  updateName: consultantProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(documents).set({ name: input.name }).where(eq(documents.id, input.id));

      return { success: true };
    }),
});

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { messages } from "../../drizzle/schema";
import { eq, and, or, desc } from "drizzle-orm";

export const messagesRouter = router({
  /**
   * Envoyer un message
   */
  send: protectedProcedure
    .input(
      z.object({
        bilanId: z.number(),
        receiverId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [message] = await db
        .insert(messages)
        .values({
          bilanId: input.bilanId,
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          content: input.content,
          isRead: false,
        })
        .$returningId();

      return message;
    }),

  /**
   * Lister les messages d'un bilan
   */
  listByBilan: protectedProcedure
    .input(
      z.object({
        bilanId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(messages)
        .where(eq(messages.bilanId, input.bilanId))
        .orderBy(desc(messages.createdAt));

      return result;
    }),

  /**
   * Lister les conversations (messages groupés par bilan)
   */
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Récupérer tous les messages où l'utilisateur est impliqué
    const result = await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, ctx.user.id), eq(messages.receiverId, ctx.user.id)))
      .orderBy(desc(messages.createdAt));

    // Grouper par bilanId et garder le dernier message
    const conversationsMap = new Map<number, (typeof result)[0]>();
    result.forEach((message) => {
      if (message.bilanId && !conversationsMap.has(message.bilanId)) {
        conversationsMap.set(message.bilanId, message);
      }
    });

    return Array.from(conversationsMap.values());
  }),

  /**
   * Marquer un message comme lu
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        messageId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(messages).set({ isRead: true }).where(eq(messages.id, input.messageId));

      return { success: true };
    }),

  /**
   * Marquer tous les messages d'un bilan comme lus
   */
  markBilanAsRead: protectedProcedure
    .input(
      z.object({
        bilanId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(messages)
        .set({ isRead: true })
        .where(and(eq(messages.bilanId, input.bilanId), eq(messages.receiverId, ctx.user.id)));

      return { success: true };
    }),

  /**
   * Compter les messages non lus
   */
  countUnread: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(messages)
      .where(and(eq(messages.receiverId, ctx.user.id), eq(messages.isRead, false)));

    return result.length;
  }),

  /**
   * Supprimer un message
   */
  delete: protectedProcedure
    .input(
      z.object({
        messageId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Vérifier que l'utilisateur est l'expéditeur
      const [message] = await db.select().from(messages).where(eq(messages.id, input.messageId));

      if (!message) {
        throw new Error("Message not found");
      }

      if (message.senderId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      await db.delete(messages).where(eq(messages.id, input.messageId));

      return { success: true };
    }),
});

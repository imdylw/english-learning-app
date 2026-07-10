import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { vocabulary, userVocabulary } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const vocabularyRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.cefrLevel) {
        conditions.push(eq(vocabulary.cefrLevel, input.cefrLevel));
      }
      if (input?.category) {
        conditions.push(eq(vocabulary.category, input.category));
      }
      if (input?.search) {
        conditions.push(sql`${vocabulary.word} LIKE ${`%${input.search}%`}`);
      }

      const query = db.select().from(vocabulary).limit(input?.limit ?? 20).offset(input?.offset ?? 0);

      if (conditions.length > 0) {
        return query.where(and(...conditions));
      }

      return query;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(vocabulary).where(eq(vocabulary.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  getRandom: publicQuery
    .input(z.object({ count: z.number().min(1).max(20).default(5), cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      if (input.cefrLevel) {
        return db.select().from(vocabulary).where(eq(vocabulary.cefrLevel, input.cefrLevel)).orderBy(sql`RAND()`).limit(input.count);
      }
      return db.select().from(vocabulary).orderBy(sql`RAND()`).limit(input.count);
    }),

  // User vocabulary (SRS tracking)
  getUserVocabulary: authedQuery
    .input(
      z.object({
        familiarity: z.enum(["new", "learning", "reviewing", "mastered"]).optional(),
        isFavorite: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const conditions = [eq(userVocabulary.userId, userId)];

      if (input?.familiarity) {
        conditions.push(eq(userVocabulary.familiarity, input.familiarity));
      }
      if (input?.isFavorite !== undefined) {
        conditions.push(eq(userVocabulary.isFavorite, input.isFavorite));
      }

      return db
        .select({
          userVocab: userVocabulary,
          vocab: vocabulary,
        })
        .from(userVocabulary)
        .innerJoin(vocabulary, eq(userVocabulary.vocabularyId, vocabulary.id))
        .where(and(...conditions))
        .orderBy(desc(userVocabulary.updatedAt));
    }),

  addToUserVocabulary: authedQuery
    .input(z.object({ vocabularyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(userVocabulary)
        .where(and(eq(userVocabulary.userId, ctx.user.id), eq(userVocabulary.vocabularyId, input.vocabularyId)))
        .limit(1);

      if (existing.length > 0) {
        return { alreadyExists: true, id: existing[0].id };
      }

      const result = await db.insert(userVocabulary).values({
        userId: ctx.user.id,
        vocabularyId: input.vocabularyId,
        familiarity: "new",
        srsLevel: 0,
        nextReview: new Date(),
      });

      return { created: true, id: Number((result as unknown as { insertId: bigint }).insertId) };
    }),

  updateFamiliarity: authedQuery
    .input(
      z.object({
        vocabularyId: z.number(),
        familiarity: z.enum(["new", "learning", "reviewing", "mastered"]),
        srsLevel: z.number().min(0).max(5).optional(),
        correct: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(userVocabulary)
        .where(and(eq(userVocabulary.userId, ctx.user.id), eq(userVocabulary.vocabularyId, input.vocabularyId)))
        .limit(1);

      if (existing.length === 0) {
        // Auto-add if not exists
        await db.insert(userVocabulary).values({
          userId: ctx.user.id,
          vocabularyId: input.vocabularyId,
          familiarity: input.familiarity,
          srsLevel: input.srsLevel ?? 1,
          nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 day
          reviewCount: 1,
          correctCount: input.correct ? 1 : 0,
        });
        return { success: true, action: "created" };
      }

      const uv = existing[0];
      const newSrsLevel = input.correct
        ? Math.min((uv.srsLevel ?? 0) + 1, 5)
        : Math.max((uv.srsLevel ?? 0) - 1, 0);

      // Calculate next review date based on SRS level
      const intervals = [1, 1, 2, 4, 7, 14]; // days
      const nextReview = new Date(Date.now() + intervals[newSrsLevel] * 24 * 60 * 60 * 1000);

      await db
        .update(userVocabulary)
        .set({
          familiarity: input.familiarity,
          srsLevel: newSrsLevel,
          nextReview,
          reviewCount: (uv.reviewCount ?? 0) + 1,
          correctCount: (uv.correctCount ?? 0) + (input.correct ? 1 : 0),
        })
        .where(eq(userVocabulary.id, uv.id));

      return { success: true, action: "updated", srsLevel: newSrsLevel };
    }),

  toggleFavorite: authedQuery
    .input(z.object({ vocabularyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(userVocabulary)
        .where(and(eq(userVocabulary.userId, ctx.user.id), eq(userVocabulary.vocabularyId, input.vocabularyId)))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(userVocabulary).values({
          userId: ctx.user.id,
          vocabularyId: input.vocabularyId,
          isFavorite: true,
        });
        return { favorited: true };
      }

      await db
        .update(userVocabulary)
        .set({ isFavorite: !existing[0].isFavorite })
        .where(eq(userVocabulary.id, existing[0].id));

      return { favorited: !existing[0].isFavorite };
    }),

  getReviewWords: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select({
        userVocab: userVocabulary,
        vocab: vocabulary,
      })
      .from(userVocabulary)
      .innerJoin(vocabulary, eq(userVocabulary.vocabularyId, vocabulary.id))
      .where(
        and(
          eq(userVocabulary.userId, ctx.user.id),
          sql`${userVocabulary.nextReview} <= NOW()`
        )
      )
      .limit(20);
  }),
});

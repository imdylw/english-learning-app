import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { lessons, userProgress, learningPaths } from "@db/schema";
import { eq, and, asc } from "drizzle-orm";

export const lessonsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
        category: z.enum(["grammar", "vocabulary", "conversation", "listening", "reading", "writing", "speaking"]).optional(),
        learningPathId: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.cefrLevel) {
        conditions.push(eq(lessons.cefrLevel, input.cefrLevel));
      }
      if (input?.category) {
        conditions.push(eq(lessons.category, input.category));
      }
      if (input?.learningPathId) {
        conditions.push(eq(lessons.learningPathId, input.learningPathId));
      }

      const query = db.select().from(lessons).orderBy(asc(lessons.order));

      if (conditions.length > 0) {
        return query.where(and(...conditions));
      }

      return query;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(lessons).where(eq(lessons.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  submitProgress: authedQuery
    .input(
      z.object({
        lessonId: z.number(),
        score: z.number().min(0).max(100),
        xpEarned: z.number().min(0),
        timeSpent: z.number().min(0),
        answers: z.any(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Check if progress already exists
      const existing = await db
        .select()
        .from(userProgress)
        .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, input.lessonId)))
        .limit(1);

      if (existing.length > 0) {
        // Update existing progress
        await db
          .update(userProgress)
          .set({
            score: Math.max(existing[0].score ?? 0, input.score),
            xpEarned: Math.max(existing[0].xpEarned ?? 0, input.xpEarned),
            timeSpent: (existing[0].timeSpent ?? 0) + input.timeSpent,
            completed: input.completed || existing[0].completed,
            attempts: (existing[0].attempts ?? 0) + 1,
            answers: input.answers,
            completedAt: input.completed ? new Date() : existing[0].completedAt,
          })
          .where(eq(userProgress.id, existing[0].id));

        return { updated: true, id: existing[0].id };
      }

      // Create new progress
      const result = await db.insert(userProgress).values({
        userId,
        lessonId: input.lessonId,
        score: input.score,
        xpEarned: input.xpEarned,
        timeSpent: input.timeSpent,
        completed: input.completed,
        attempts: 1,
        answers: input.answers,
        completedAt: input.completed ? new Date() : null,
      });

      return { created: true, id: Number((result as unknown as { insertId: bigint }).insertId) };
    }),

  getUserProgress: authedQuery
    .input(z.object({ lessonId: z.number() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      if (input?.lessonId) {
        const result = await db
          .select()
          .from(userProgress)
          .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, input.lessonId)))
          .limit(1);
        return result[0] ?? null;
      }

      return db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, userId));
    }),

  getLearningPaths: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(learningPaths).where(eq(learningPaths.isActive, true));
  }),
});

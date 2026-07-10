import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { grammarLessons, grammarProgress } from "@db/schema";
import { eq, and, asc } from "drizzle-orm";

export const grammarRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
        topic: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.cefrLevel) {
        conditions.push(eq(grammarLessons.cefrLevel, input.cefrLevel));
      }
      if (input?.topic) {
        conditions.push(eq(grammarLessons.topic, input.topic));
      }

      const query = db.select().from(grammarLessons).orderBy(asc(grammarLessons.order));

      if (conditions.length > 0) {
        return query.where(and(eq(grammarLessons.isActive, true), ...conditions));
      }

      return query.where(eq(grammarLessons.isActive, true));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(grammarLessons).where(eq(grammarLessons.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  submitProgress: authedQuery
    .input(
      z.object({
        grammarLessonId: z.number(),
        score: z.number().min(0).max(100),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const existing = await db
        .select()
        .from(grammarProgress)
        .where(and(eq(grammarProgress.userId, userId), eq(grammarProgress.grammarLessonId, input.grammarLessonId)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(grammarProgress)
          .set({
            score: Math.max(existing[0].score ?? 0, input.score),
            completed: input.completed || existing[0].completed,
            attempts: (existing[0].attempts ?? 0) + 1,
            completedAt: input.completed ? new Date() : existing[0].completedAt,
          })
          .where(eq(grammarProgress.id, existing[0].id));

        return { updated: true };
      }

      await db.insert(grammarProgress).values({
        userId,
        grammarLessonId: input.grammarLessonId,
        score: input.score,
        completed: input.completed,
        attempts: 1,
        completedAt: input.completed ? new Date() : null,
      });

      return { created: true };
    }),

  getUserProgress: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(grammarProgress)
      .where(eq(grammarProgress.userId, ctx.user.id));
  }),
});

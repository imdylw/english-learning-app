import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { learningPaths, userLearningPaths, lessons } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const learningPathsRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(learningPaths).where(eq(learningPaths.isActive, true));
  }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const path = await db.select().from(learningPaths).where(eq(learningPaths.slug, input.slug)).limit(1);
      if (path.length === 0) return null;

      const pathLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.learningPathId, path[0].id))
        .orderBy(lessons.order);

      return { ...path[0], lessons: pathLessons };
    }),

  enroll: authedQuery
    .input(z.object({ learningPathId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(userLearningPaths)
        .where(and(eq(userLearningPaths.userId, ctx.user.id), eq(userLearningPaths.learningPathId, input.learningPathId)))
        .limit(1);

      if (existing.length > 0) {
        return { alreadyEnrolled: true };
      }

      await db.insert(userLearningPaths).values({
        userId: ctx.user.id,
        learningPathId: input.learningPathId,
        progress: 0,
        completedLessons: 0,
        isActive: true,
      });

      return { enrolled: true };
    }),

  getUserPaths: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select({
        ulp: userLearningPaths,
        path: learningPaths,
      })
      .from(userLearningPaths)
      .innerJoin(learningPaths, eq(userLearningPaths.learningPathId, learningPaths.id))
      .where(and(eq(userLearningPaths.userId, ctx.user.id), eq(userLearningPaths.isActive, true)));
  }),

  updateProgress: authedQuery
    .input(z.object({ pathId: z.number(), completedLessons: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const pathData = await db
        .select()
        .from(learningPaths)
        .where(eq(learningPaths.id, input.pathId))
        .limit(1);

      const totalLessons = pathData[0]?.totalLessons ?? 1;
      const progress = Math.round((input.completedLessons / totalLessons) * 100);

      await db
        .update(userLearningPaths)
        .set({
          completedLessons: input.completedLessons,
          progress,
          completedAt: progress >= 100 ? new Date() : undefined,
        })
        .where(and(eq(userLearningPaths.userId, ctx.user.id), eq(userLearningPaths.learningPathId, input.pathId)));

      return { progress };
    }),
});

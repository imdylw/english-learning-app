import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { shadowingSessions, userShadowingProgress } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const shadowingRouter = createRouter({
  list: publicQuery
    .input(z.object({ cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.cefrLevel) {
        return db.select().from(shadowingSessions).where(and(eq(shadowingSessions.cefrLevel, input.cefrLevel), eq(shadowingSessions.isActive, true)));
      }
      return db.select().from(shadowingSessions).where(eq(shadowingSessions.isActive, true));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(shadowingSessions).where(eq(shadowingSessions.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  recordProgress: authedQuery
    .input(
      z.object({
        sessionId: z.number(),
        accuracy: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(userShadowingProgress)
        .where(and(eq(userShadowingProgress.userId, ctx.user.id), eq(userShadowingProgress.shadowingSessionId, input.sessionId)))
        .limit(1);

      if (existing.length > 0) {
        const completed = input.accuracy >= 60;
        await db
          .update(userShadowingProgress)
          .set({
            timesPracticed: (existing[0].timesPracticed ?? 0) + 1,
            lastAccuracy: input.accuracy,
            completed: completed || existing[0].completed,
            completedAt: completed ? new Date() : existing[0].completedAt,
          })
          .where(eq(userShadowingProgress.id, existing[0].id));

        return { updated: true };
      }

      await db.insert(userShadowingProgress).values({
        userId: ctx.user.id,
        shadowingSessionId: input.sessionId,
        timesPracticed: 1,
        lastAccuracy: input.accuracy,
        completed: input.accuracy >= 60,
        completedAt: input.accuracy >= 60 ? new Date() : null,
      });

      return { created: true };
    }),

  getUserProgress: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(userShadowingProgress)
      .where(eq(userShadowingProgress.userId, ctx.user.id));
  }),
});

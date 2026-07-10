import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { profiles, activityLog, lessons, userProgress, grammarProgress } from "@db/schema";
import { eq, desc, sql, and, count } from "drizzle-orm";

export const progressRouter = createRouter({
  getProfile: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, ctx.user.id))
      .limit(1);
    return result[0] ?? null;
  }),

  upsertProfile: authedQuery
    .input(
      z.object({
        displayName: z.string().optional(),
        bio: z.string().optional(),
        nativeLanguage: z.string().optional(),
        cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(profiles)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(profiles.id, existing[0].id));
        return { updated: true };
      }

      await db.insert(profiles).values({
        userId: ctx.user.id,
        ...input,
      });
      return { created: true };
    }),

  recordActivity: authedQuery
    .input(
      z.object({
        activityType: z.enum(["lesson", "vocabulary", "grammar", "speaking", "writing", "listening", "reading", "placement_test", "daily_challenge"]),
        activityId: z.number().optional(),
        xpEarned: z.number().min(0),
        details: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(activityLog).values({
        userId: ctx.user.id,
        activityType: input.activityType,
        activityId: input.activityId,
        xpEarned: input.xpEarned,
        details: input.details,
      });

      // Update profile XP and streak
      const profile = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, ctx.user.id))
        .limit(1);

      if (profile.length > 0) {
        const p = profile[0];
        const now = new Date();
        const lastActivity = p.lastActivityDate;

        let newStreak = p.currentStreak ?? 0;
        let newLongest = p.longestStreak ?? 0;

        if (lastActivity) {
          const lastDate = new Date(lastActivity);
          const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        if (newStreak > newLongest) {
          newLongest = newStreak;
        }

        await db
          .update(profiles)
          .set({
            totalXp: (p.totalXp ?? 0) + input.xpEarned,
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastActivityDate: now,
          })
          .where(eq(profiles.id, p.id));
      }

      return { success: true };
    }),

  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Get profile stats
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    // Get lessons completed count
    const lessonsCompleted = await db
      .select({ count: count() })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.completed, true)));

    // Get grammar completed count
    const grammarCompleted = await db
      .select({ count: count() })
      .from(grammarProgress)
      .where(and(eq(grammarProgress.userId, userId), eq(grammarProgress.completed, true)));

    // Get activity for the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyActivity = await db
      .select()
      .from(activityLog)
      .where(and(eq(activityLog.userId, userId), sql`${activityLog.createdAt} >= ${sevenDaysAgo}`))
      .orderBy(desc(activityLog.createdAt));

    // Get recent activity
    const recentActivity = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(10);

    return {
      profile: profile[0] ?? null,
      lessonsCompleted: lessonsCompleted[0]?.count ?? 0,
      grammarCompleted: grammarCompleted[0]?.count ?? 0,
      weeklyXp: weeklyActivity.reduce((sum, a) => sum + (a.xpEarned ?? 0), 0),
      recentActivity,
    };
  }),

  getSkillBreakdown: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Calculate skill scores based on completed lessons by category
    const lessonScores = await db
      .select({
        category: lessons.category,
        avgScore: sql<number>`AVG(${userProgress.score})`,
        count: count(),
      })
      .from(userProgress)
      .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
      .where(and(eq(userProgress.userId, userId), eq(userProgress.completed, true)))
      .groupBy(lessons.category);

    const grammarScores = await db
      .select({
        avgScore: sql<number>`AVG(${grammarProgress.score})`,
        count: count(),
      })
      .from(grammarProgress)
      .where(and(eq(grammarProgress.userId, userId), eq(grammarProgress.completed, true)));

    return {
      reading: Math.round(lessonScores.find((s) => s.category === "reading")?.avgScore ?? 0),
      writing: Math.round(lessonScores.find((s) => s.category === "writing")?.avgScore ?? 0),
      listening: Math.round(lessonScores.find((s) => s.category === "listening")?.avgScore ?? 0),
      speaking: Math.round(lessonScores.find((s) => s.category === "speaking")?.avgScore ?? 0),
      vocabulary: Math.round(lessonScores.find((s) => s.category === "vocabulary")?.avgScore ?? 0),
      grammar: Math.round(grammarScores[0]?.avgScore ?? 0),
    };
  }),
});

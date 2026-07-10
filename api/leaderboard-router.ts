import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { leaderboard, users, profiles } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const leaderboardRouter = createRouter({
  getWeekly: publicQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;

      return db
        .select({
          entry: leaderboard,
          user: { name: users.name, avatar: users.avatar },
          profile: { displayName: profiles.displayName },
        })
        .from(leaderboard)
        .innerJoin(users, eq(leaderboard.userId, users.id))
        .leftJoin(profiles, eq(leaderboard.userId, profiles.userId))
        .orderBy(desc(leaderboard.weeklyXp))
        .limit(limit);
    }),

  getMonthly: publicQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;

      return db
        .select({
          entry: leaderboard,
          user: { name: users.name, avatar: users.avatar },
          profile: { displayName: profiles.displayName },
        })
        .from(leaderboard)
        .innerJoin(users, eq(leaderboard.userId, users.id))
        .leftJoin(profiles, eq(leaderboard.userId, profiles.userId))
        .orderBy(desc(leaderboard.monthlyXp))
        .limit(limit);
    }),

  getAllTime: publicQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;

      return db
        .select({
          entry: leaderboard,
          user: { name: users.name, avatar: users.avatar },
          profile: { displayName: profiles.displayName },
        })
        .from(leaderboard)
        .innerJoin(users, eq(leaderboard.userId, users.id))
        .leftJoin(profiles, eq(leaderboard.userId, profiles.userId))
        .orderBy(desc(leaderboard.totalXp))
        .limit(limit);
    }),

  updateScore: authedQuery
    .input(z.object({ xpEarned: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const existing = await db
        .select()
        .from(leaderboard)
        .where(eq(leaderboard.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(leaderboard)
          .set({
            weeklyXp: (existing[0].weeklyXp ?? 0) + input.xpEarned,
            monthlyXp: (existing[0].monthlyXp ?? 0) + input.xpEarned,
            totalXp: (existing[0].totalXp ?? 0) + input.xpEarned,
          })
          .where(eq(leaderboard.id, existing[0].id));
      } else {
        await db.insert(leaderboard).values({
          userId,
          weeklyXp: input.xpEarned,
          monthlyXp: input.xpEarned,
          totalXp: input.xpEarned,
        });
      }

      return { success: true };
    }),
});

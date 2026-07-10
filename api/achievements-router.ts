import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { achievements, userAchievements } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const achievementsRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(achievements);
  }),

  getUserAchievements: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select({
        ua: userAchievements,
        achievement: achievements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, ctx.user.id));
  }),

  checkAndUnlock: authedQuery
    .input(z.object({ category: z.string(), value: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Get achievements in this category
      const categoryAchievements = await db
        .select()
        .from(achievements)
        .where(eq(achievements.category, input.category as any));

      const unlocked: Array<{ name: string; xpReward: number }> = [];

      for (const ach of categoryAchievements) {
        // Check if already unlocked
        const existing = await db
          .select()
          .from(userAchievements)
          .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, ach.id)))
          .limit(1);

        if (existing.length > 0 && existing[0].unlocked) {
          continue;
        }

        const required = ach.requirement ?? 1;
        if (input.value >= required) {
          // Unlock achievement
          if (existing.length > 0) {
            await db
              .update(userAchievements)
              .set({ unlocked: true, unlockedAt: new Date(), progress: input.value })
              .where(eq(userAchievements.id, existing[0].id));
          } else {
            await db.insert(userAchievements).values({
              userId,
              achievementId: ach.id,
              progress: input.value,
              unlocked: true,
              unlockedAt: new Date(),
            });
          }

          unlocked.push({ name: ach.name, xpReward: ach.xpReward ?? 0 });
        } else if (existing.length > 0) {
          // Update progress
          await db
            .update(userAchievements)
            .set({ progress: input.value })
            .where(eq(userAchievements.id, existing[0].id));
        } else {
          // Create with progress
          await db.insert(userAchievements).values({
            userId,
            achievementId: ach.id,
            progress: input.value,
            unlocked: false,
          });
        }
      }

      return { unlocked };
    }),
});

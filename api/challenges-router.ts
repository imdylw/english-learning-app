import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dailyChallenges } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

// Generate daily challenges based on user level
function generateChallenges(userId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const challenges = [
    { title: "Learn 5 New Words", description: "Study and master 5 new vocabulary words.", type: "vocabulary" as const, xpReward: 15, requirement: 5 },
    { title: "Read an Article", description: "Complete a reading comprehension exercise.", type: "reading" as const, xpReward: 20, requirement: 1 },
    { title: "Listen & Learn", description: "Complete a listening exercise.", type: "listening" as const, xpReward: 20, requirement: 1 },
    { title: "Grammar Practice", description: "Complete a grammar lesson with 80%+ accuracy.", type: "grammar" as const, xpReward: 25, requirement: 1 },
    { title: "Speak for 2 Minutes", description: "Practice speaking for at least 2 minutes.", type: "speaking" as const, xpReward: 20, requirement: 2 },
    { title: "Write a Paragraph", description: "Write at least 100 words on any topic.", type: "writing" as const, xpReward: 20, requirement: 100 },
  ];

  // Randomly select 3 challenges
  const shuffled = challenges.sort(() => Math.random() - 0.5).slice(0, 3);

  return shuffled.map((c) => ({
    userId,
    title: c.title,
    description: c.description,
    type: c.type,
    xpReward: c.xpReward,
    requirement: c.requirement,
    progress: 0,
    completed: false,
    challengeDate: today,
  }));
}

export const challengesRouter = createRouter({
  getDaily: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Check if today's challenges exist
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db
      .select()
      .from(dailyChallenges)
      .where(
        and(
          eq(dailyChallenges.userId, userId),
          sql`DATE(${dailyChallenges.challengeDate}) = DATE(${today})`
        )
      );

    if (existing.length > 0) {
      return existing;
    }

    // Generate new challenges
    const newChallenges = generateChallenges(userId);
    await db.insert(dailyChallenges).values(newChallenges);

    return db
      .select()
      .from(dailyChallenges)
      .where(
        and(
          eq(dailyChallenges.userId, userId),
          sql`DATE(${dailyChallenges.challengeDate}) = DATE(${today})`
        )
      );
  }),

  updateProgress: authedQuery
    .input(z.object({ challengeId: z.number(), progress: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const challenge = await db
        .select()
        .from(dailyChallenges)
        .where(and(eq(dailyChallenges.id, input.challengeId), eq(dailyChallenges.userId, ctx.user.id)))
        .limit(1);

      if (challenge.length === 0) {
        throw new Error("Challenge not found");
      }

      const c = challenge[0];
      const newProgress = input.progress;
      const completed = newProgress >= (c.requirement ?? 1);

      await db
        .update(dailyChallenges)
        .set({
          progress: newProgress,
          completed,
          completedAt: completed ? new Date() : c.completedAt,
        })
        .where(eq(dailyChallenges.id, input.challengeId));

      return { completed, xpEarned: completed ? c.xpReward : 0 };
    }),

  completeChallenge: authedQuery
    .input(z.object({ challengeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      await db
        .update(dailyChallenges)
        .set({
          completed: true,
          completedAt: new Date(),
        })
        .where(and(eq(dailyChallenges.id, input.challengeId), eq(dailyChallenges.userId, ctx.user.id)));

      return { success: true };
    }),
});

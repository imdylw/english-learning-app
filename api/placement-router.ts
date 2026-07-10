import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { placementTests } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const placementRouter = createRouter({
  submit: authedQuery
    .input(
      z.object({
        grammarScore: z.number().min(0).max(100),
        vocabularyScore: z.number().min(0).max(100),
        readingScore: z.number().min(0).max(100),
        listeningScore: z.number().min(0).max(100),
        speakingScore: z.number().min(0).max(100),
        writingScore: z.number().min(0).max(100),
        answers: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const overallScore = Math.round(
        (input.grammarScore + input.vocabularyScore + input.readingScore +
         input.listeningScore + input.speakingScore + input.writingScore) / 6
      );

      // Determine CEFR level
      let cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" = "A1";
      if (overallScore >= 95) cefrLevel = "C2";
      else if (overallScore >= 85) cefrLevel = "C1";
      else if (overallScore >= 70) cefrLevel = "B2";
      else if (overallScore >= 55) cefrLevel = "B1";
      else if (overallScore >= 40) cefrLevel = "A2";

      const result = await db.insert(placementTests).values({
        userId: ctx.user.id,
        grammarScore: input.grammarScore,
        vocabularyScore: input.vocabularyScore,
        readingScore: input.readingScore,
        listeningScore: input.listeningScore,
        speakingScore: input.speakingScore,
        writingScore: input.writingScore,
        overallScore,
        cefrLevel,
        answers: input.answers,
      });

      return {
        id: Number((result as unknown as { insertId: bigint }).insertId),
        overallScore,
        cefrLevel,
        skillScores: {
          grammar: input.grammarScore,
          vocabulary: input.vocabularyScore,
          reading: input.readingScore,
          listening: input.listeningScore,
          speaking: input.speakingScore,
          writing: input.writingScore,
        },
      };
    }),

  getLatest: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db
      .select()
      .from(placementTests)
      .where(eq(placementTests.userId, ctx.user.id))
      .orderBy(desc(placementTests.completedAt))
      .limit(1);
    return result[0] ?? null;
  }),

  getHistory: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(placementTests)
      .where(eq(placementTests.userId, ctx.user.id))
      .orderBy(desc(placementTests.completedAt));
  }),
});

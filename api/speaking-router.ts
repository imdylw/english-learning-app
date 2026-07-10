import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { speakingAttempts } from "@db/schema";
import { eq, desc } from "drizzle-orm";

// Simple text comparison for speaking feedback
function compareTranscript(transcript: string, expected: string) {
  const transcriptWords = transcript.toLowerCase().trim().split(/\s+/).filter((w) => w.length > 0);
  const expectedWords = expected.toLowerCase().trim().split(/\s+/).filter((w) => w.length > 0);

  let matchedWords = 0;
  const wordMap = new Map<string, number>();

  for (const word of expectedWords) {
    const clean = word.replace(/[^a-z]/g, "");
    wordMap.set(clean, (wordMap.get(clean) ?? 0) + 1);
  }

  for (const word of transcriptWords) {
    const clean = word.replace(/[^a-z]/g, "");
    const count = wordMap.get(clean) ?? 0;
    if (count > 0) {
      matchedWords++;
      wordMap.set(clean, count - 1);
    }
  }

  const accuracy = expectedWords.length > 0
    ? Math.round((matchedWords / expectedWords.length) * 100)
    : 0;

  const fluency = Math.min(100, Math.round(transcriptWords.length * 2));
  const pronunciation = Math.round(accuracy * 0.9);
  const overall = Math.round((accuracy + fluency + pronunciation) / 3);

  return {
    accuracy,
    fluency,
    pronunciation,
    overall,
    wordCount: transcriptWords.length,
    expectedWordCount: expectedWords.length,
    matchedWords,
  };
}

export const speakingRouter = createRouter({
  submit: authedQuery
    .input(
      z.object({
        prompt: z.string().min(1),
        transcript: z.string().min(1),
        expectedText: z.string().optional(),
        duration: z.number().min(0).default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      let feedback = null;
      if (input.expectedText) {
        feedback = compareTranscript(input.transcript, input.expectedText);
      }

      const accuracyScore = feedback?.accuracy ?? 70;
      const fluencyScore = feedback?.fluency ?? 60;
      const pronunciationScore = feedback?.pronunciation ?? 65;
      const overallScore = feedback?.overall ?? 65;

      const result = await db.insert(speakingAttempts).values({
        userId: ctx.user.id,
        prompt: input.prompt,
        transcript: input.transcript,
        accuracyScore,
        fluencyScore,
        pronunciationScore,
        overallScore,
        feedback: feedback
          ? `Accuracy: ${accuracyScore}%. You matched ${feedback.matchedWords} out of ${feedback.expectedWordCount} words.`
          : "Practice speaking clearly. Try to speak at a natural pace.",
        duration: input.duration,
      });

      return {
        id: Number((result as unknown as { insertId: bigint }).insertId),
        scores: {
          accuracy: accuracyScore,
          fluency: fluencyScore,
          pronunciation: pronunciationScore,
          overall: overallScore,
        },
        feedback: feedback,
      };
    }),

  getHistory: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(speakingAttempts)
      .where(eq(speakingAttempts.userId, ctx.user.id))
      .orderBy(desc(speakingAttempts.recordedAt))
      .limit(20);
  }),
});

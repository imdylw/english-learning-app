import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { writingSubmissions } from "@db/schema";
import { eq, desc } from "drizzle-orm";

// Simple rule-based grammar checker
function checkGrammar(text: string) {
  const errors: Array<{ start: number; end: number; message: string; suggestion: string }> = [];
  const suggestions: Array<{ message: string }> = [];

  // Check double spaces
  const doubleSpaceRegex = / {2,}/g;
  let match;
  while ((match = doubleSpaceRegex.exec(text)) !== null) {
    errors.push({ start: match.index, end: match.index + match[0].length, message: "Double spaces detected", suggestion: "Use single spaces" });
  }

  // Check sentence capitalization
  const sentences = text.split(/[.!?]+\s+/);
  let charIndex = 0;
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 0 && trimmed[0] !== trimmed[0].toUpperCase() && /^[a-zA-Z]/.test(trimmed[0])) {
      errors.push({ start: charIndex, end: charIndex + 1, message: "Sentence should start with a capital letter", suggestion: trimmed[0].toUpperCase() });
    }
    charIndex += sentence.length + 2;
  }

  // Check common mistakes
  const commonMistakes = [
    { pattern: /\bi am\b/gi, message: "Consider using 'I'm' for a more natural tone", suggestion: "I'm" },
    { pattern: /\bi dont\b/gi, message: "Missing apostrophe", suggestion: "I don't" },
    { pattern: /\bi cant\b/gi, message: "Missing apostrophe", suggestion: "I can't" },
    { pattern: /\bi wont\b/gi, message: "Missing apostrophe", suggestion: "I won't" },
    { pattern: /\bi didnt\b/gi, message: "Missing apostrophe", suggestion: "I didn't" },
    { pattern: /\bi havent\b/gi, message: "Missing apostrophe", suggestion: "I haven't" },
    { pattern: /\bi shouldnt\b/gi, message: "Missing apostrophe", suggestion: "I shouldn't" },
    { pattern: /\bi couldnt\b/gi, message: "Missing apostrophe", suggestion: "I couldn't" },
    { pattern: /\bi wouldnt\b/gi, message: "Missing apostrophe", suggestion: "I wouldn't" },
    { pattern: /\bi wasnt\b/gi, message: "Missing apostrophe", suggestion: "I wasn't" },
    { pattern: /\bi werent\b/gi, message: "Missing apostrophe", suggestion: "I weren't" },
    { pattern: /\bi isnt\b/gi, message: "Missing apostrophe", suggestion: "I isn't" },
    { pattern: /\bi arent\b/gi, message: "Missing apostrophe", suggestion: "I aren't" },
    { pattern: /\bi doesnt\b/gi, message: "Missing apostrophe", suggestion: "I doesn't" },
    { pattern: /\bi didnt\b/gi, message: "Missing apostrophe", suggestion: "I didn't" },
    { pattern: /\bi hasnt\b/gi, message: "Missing apostrophe", suggestion: "I hasn't" },
    { pattern: /\bi havent\b/gi, message: "Missing apostrophe", suggestion: "I haven't" },
    { pattern: /\bi hadnt\b/gi, message: "Missing apostrophe", suggestion: "I hadn't" },
  ];

  for (const mistake of commonMistakes) {
    const regex = new RegExp(mistake.pattern.source, "gi");
    while ((match = regex.exec(text)) !== null) {
      errors.push({ start: match.index, end: match.index + match[0].length, message: mistake.message, suggestion: mistake.suggestion });
    }
  }

  // Check word count
  const wordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length;

  // Vocabulary diversity
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) ?? [];
  const uniqueWords = new Set(words);
  const diversity = words.length > 0 ? uniqueWords.size / words.length : 0;

  if (diversity < 0.3 && words.length > 20) {
    suggestions.push({ message: "Try to use more varied vocabulary to make your writing more interesting" });
  }

  // Simple scoring
  const errorPenalty = Math.min(errors.length * 5, 30);
  const diversityBonus = Math.round(diversity * 20);
  const lengthBonus = Math.min(Math.floor(wordCount / 10), 15);

  const grammarScore = Math.max(0, 100 - errorPenalty);
  const vocabularyScore = Math.min(100, 40 + diversityBonus + lengthBonus);
  const coherenceScore = Math.min(100, 50 + lengthBonus + diversityBonus);
  const overallScore = Math.round((grammarScore + vocabularyScore + coherenceScore) / 3);

  return {
    wordCount,
    errors,
    suggestions,
    scores: {
      grammar: grammarScore,
      vocabulary: vocabularyScore,
      coherence: coherenceScore,
      overall: overallScore,
    },
  };
}

export const writingRouter = createRouter({
  submit: authedQuery
    .input(
      z.object({
        prompt: z.string().min(1),
        content: z.string().min(1),
        cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const wordCount = input.content.trim().split(/\s+/).filter((w) => w.length > 0).length;
      const feedback = checkGrammar(input.content);

      const result = await db.insert(writingSubmissions).values({
        userId: ctx.user.id,
        prompt: input.prompt,
        content: input.content,
        wordCount,
        grammarScore: feedback.scores.grammar,
        vocabularyScore: feedback.scores.vocabulary,
        coherenceScore: feedback.scores.coherence,
        overallScore: feedback.scores.overall,
        feedback: feedback,
        cefrLevel: input.cefrLevel ?? "B1",
      });

      return {
        id: Number((result as unknown as { insertId: bigint }).insertId),
        ...feedback,
      };
    }),

  getHistory: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(writingSubmissions)
      .where(eq(writingSubmissions.userId, ctx.user.id))
      .orderBy(desc(writingSubmissions.submittedAt))
      .limit(20);
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(writingSubmissions)
        .where(eq(writingSubmissions.id, input.id))
        .limit(1);
      return result[0] ?? null;
    }),
});

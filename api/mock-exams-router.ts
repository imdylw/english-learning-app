import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { mockExams, mockExamAttempts } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const mockExamsRouter = createRouter({
  list: publicQuery
    .input(z.object({ examType: z.enum(["ielts", "toefl", "toeic", "general"]).optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.examType) {
        return db.select().from(mockExams).where(and(eq(mockExams.examType, input.examType), eq(mockExams.isActive, true)));
      }
      return db.select().from(mockExams).where(eq(mockExams.isActive, true));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(mockExams).where(eq(mockExams.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  startAttempt: authedQuery
    .input(z.object({ examId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(mockExamAttempts).values({
        userId: ctx.user.id,
        mockExamId: input.examId,
        startedAt: new Date(),
      });
      return { attemptId: Number((result as unknown as { insertId: bigint }).insertId) };
    }),

  submitAttempt: authedQuery
    .input(
      z.object({
        attemptId: z.number(),
        answers: z.any(),
        score: z.number(),
        correctAnswers: z.number(),
        wrongAnswers: z.number(),
        timeSpent: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(mockExamAttempts)
        .set({
          answers: input.answers,
          score: input.score,
          correctAnswers: input.correctAnswers,
          wrongAnswers: input.wrongAnswers,
          timeSpent: input.timeSpent,
          completed: true,
          completedAt: new Date(),
        })
        .where(and(eq(mockExamAttempts.id, input.attemptId), eq(mockExamAttempts.userId, ctx.user.id)));

      return { success: true };
    }),

  getAttempts: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(mockExamAttempts)
      .where(eq(mockExamAttempts.userId, ctx.user.id))
      .orderBy(desc(mockExamAttempts.startedAt));
  }),
});

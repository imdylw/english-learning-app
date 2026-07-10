import { authRouter } from "./auth-router";
import { lessonsRouter } from "./lessons-router";
import { vocabularyRouter } from "./vocabulary-router";
import { grammarRouter } from "./grammar-router";
import { placementRouter } from "./placement-router";
import { progressRouter } from "./progress-router";
import { writingRouter } from "./writing-router";
import { speakingRouter } from "./speaking-router";
import { challengesRouter } from "./challenges-router";
import { achievementsRouter } from "./achievements-router";
import { leaderboardRouter } from "./leaderboard-router";
import { learningPathsRouter } from "./learning-paths-router";
import { mockExamsRouter } from "./mock-exams-router";
import { shadowingRouter } from "./shadowing-router";
import { notificationsRouter } from "./notifications-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  lessons: lessonsRouter,
  vocabulary: vocabularyRouter,
  grammar: grammarRouter,
  placement: placementRouter,
  progress: progressRouter,
  writing: writingRouter,
  speaking: speakingRouter,
  challenges: challengesRouter,
  achievements: achievementsRouter,
  leaderboard: leaderboardRouter,
  learningPaths: learningPathsRouter,
  mockExams: mockExamsRouter,
  shadowing: shadowingRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;

import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

// ============================================================
// USERS & AUTHENTICATION
// ============================================================

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// USER PROFILES
// ============================================================

export const profiles = mysqlTable("profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  displayName: varchar("displayName", { length: 255 }),
  bio: text("bio"),
  nativeLanguage: varchar("nativeLanguage", { length: 50 }),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1", "C2"]).default("A1"),
  totalXp: int("totalXp").default(0),
  currentStreak: int("currentStreak").default(0),
  longestStreak: int("longestStreak").default(0),
  lastActivityDate: timestamp("lastActivityDate"),
  lessonsCompleted: int("lessonsCompleted").default(0),
  hoursLearned: int("hoursLearned").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Profile = typeof profiles.$inferSelect;

// ============================================================
// LESSONS
// ============================================================

export const lessons = mysqlTable("lessons", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1", "C2"]).notNull(),
  category: mysqlEnum("category", ["grammar", "vocabulary", "conversation", "listening", "reading", "writing", "speaking"]).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  duration: int("duration").default(10), // minutes
  order: int("order").default(0),
  xpReward: int("xpReward").default(10),
  content: json("content"), // lesson content (questions, exercises, etc.)
  audioUrl: text("audioUrl"),
  imageUrl: text("imageUrl"),
  isActive: boolean("isActive").default(true),
  learningPathId: bigint("learningPathId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Lesson = typeof lessons.$inferSelect;

// ============================================================
// USER PROGRESS (lesson completions)
// ============================================================

export const userProgress = mysqlTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  lessonId: bigint("lessonId", { mode: "number", unsigned: true }).notNull(),
  score: int("score").default(0), // percentage
  xpEarned: int("xpEarned").default(0),
  timeSpent: int("timeSpent").default(0), // seconds
  completed: boolean("completed").default(false),
  attempts: int("attempts").default(1),
  answers: json("answers"), // user's answers
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type UserProgress = typeof userProgress.$inferSelect;

// ============================================================
// PLACEMENT TESTS
// ============================================================

export const placementTests = mysqlTable("placement_tests", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  grammarScore: int("grammarScore").default(0),
  vocabularyScore: int("vocabularyScore").default(0),
  readingScore: int("readingScore").default(0),
  listeningScore: int("listeningScore").default(0),
  speakingScore: int("speakingScore").default(0),
  writingScore: int("writingScore").default(0),
  overallScore: int("overallScore").default(0),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1", "C2"]),
  answers: json("answers"),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlacementTest = typeof placementTests.$inferSelect;

// ============================================================
// VOCABULARY
// ============================================================

export const vocabulary = mysqlTable("vocabulary", {
  id: serial("id").primaryKey(),
  word: varchar("word", { length: 255 }).notNull(),
  definition: text("definition").notNull(),
  phonetic: varchar("phonetic", { length: 255 }),
  partOfSpeech: varchar("partOfSpeech", { length: 50 }),
  exampleSentence: text("exampleSentence"),
  exampleTranslation: text("exampleTranslation"),
  synonyms: text("synonyms"),
  antonyms: text("antonyms"),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1", "C2"]).default("A1"),
  category: varchar("category", { length: 100 }),
  audioUrl: text("audioUrl"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Vocabulary = typeof vocabulary.$inferSelect;

// ============================================================
// USER VOCABULARY (SRS tracking)
// ============================================================

export const userVocabulary = mysqlTable("user_vocabulary", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  vocabularyId: bigint("vocabularyId", { mode: "number", unsigned: true }).notNull(),
  familiarity: mysqlEnum("familiarity", ["new", "learning", "reviewing", "mastered"]).default("new"),
  srsLevel: int("srsLevel").default(0), // 0-5 spaced repetition level
  nextReview: timestamp("nextReview").defaultNow().notNull(),
  reviewCount: int("reviewCount").default(0),
  correctCount: int("correctCount").default(0),
  isFavorite: boolean("isFavorite").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type UserVocabulary = typeof userVocabulary.$inferSelect;

// ============================================================
// GRAMMAR LESSONS
// ============================================================

export const grammarLessons = mysqlTable("grammar_lessons", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1", "C2"]).notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  explanation: text("explanation"),
  examples: json("examples"),
  exercises: json("exercises"),
  order: int("order").default(0),
  xpReward: int("xpReward").default(10),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type GrammarLesson = typeof grammarLessons.$inferSelect;

// ============================================================
// GRAMMAR PROGRESS
// ============================================================

export const grammarProgress = mysqlTable("grammar_progress", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  grammarLessonId: bigint("grammarLessonId", { mode: "number", unsigned: true }).notNull(),
  score: int("score").default(0),
  completed: boolean("completed").default(false),
  attempts: int("attempts").default(0),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type GrammarProgress = typeof grammarProgress.$inferSelect;

// ============================================================
// ACHIEVEMENTS / BADGES
// ============================================================

export const achievements = mysqlTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  category: mysqlEnum("category", ["streak", "lessons", "xp", "vocabulary", "grammar", "speaking", "special"]).notNull(),
  requirement: int("requirement").default(1), // number needed to unlock
  xpReward: int("xpReward").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;

// ============================================================
// USER ACHIEVEMENTS
// ============================================================

export const userAchievements = mysqlTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  achievementId: bigint("achievementId", { mode: "number", unsigned: true }).notNull(),
  progress: int("progress").default(0),
  unlocked: boolean("unlocked").default(false),
  unlockedAt: timestamp("unlockedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;

// ============================================================
// DAILY CHALLENGES
// ============================================================

export const dailyChallenges = mysqlTable("daily_challenges", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["vocabulary", "reading", "listening", "grammar", "speaking", "writing", "streak"]).notNull(),
  xpReward: int("xpReward").default(10),
  requirement: int("requirement").default(1),
  progress: int("progress").default(0),
  completed: boolean("completed").default(false),
  challengeDate: timestamp("challengeDate").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyChallenge = typeof dailyChallenges.$inferSelect;

// ============================================================
// LEARNING PATHS
// ============================================================

export const learningPaths = mysqlTable("learning_paths", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  category: mysqlEnum("category", ["everyday", "business", "travel", "academic", "ielts", "toefl", "toeic"]).notNull(),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1", "C2"]).default("A1"),
  totalLessons: int("totalLessons").default(0),
  estimatedHours: int("estimatedHours").default(0),
  icon: varchar("icon", { length: 100 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningPath = typeof learningPaths.$inferSelect;

// ============================================================
// USER LEARNING PATHS
// ============================================================

export const userLearningPaths = mysqlTable("user_learning_paths", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  learningPathId: bigint("learningPathId", { mode: "number", unsigned: true }).notNull(),
  progress: int("progress").default(0), // percentage
  completedLessons: int("completedLessons").default(0),
  isActive: boolean("isActive").default(true),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type UserLearningPath = typeof userLearningPaths.$inferSelect;

// ============================================================
// WRITING SUBMISSIONS
// ============================================================

export const writingSubmissions = mysqlTable("writing_submissions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  prompt: text("prompt").notNull(),
  content: text("content").notNull(),
  wordCount: int("wordCount").default(0),
  grammarScore: int("grammarScore").default(0),
  vocabularyScore: int("vocabularyScore").default(0),
  coherenceScore: int("coherenceScore").default(0),
  overallScore: int("overallScore").default(0),
  feedback: json("feedback"), // grammar corrections, suggestions
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1", "C2"]),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type WritingSubmission = typeof writingSubmissions.$inferSelect;

// ============================================================
// SPEAKING ATTEMPTS
// ============================================================

export const speakingAttempts = mysqlTable("speaking_attempts", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  prompt: text("prompt").notNull(),
  transcript: text("transcript"),
  accuracyScore: int("accuracyScore").default(0),
  fluencyScore: int("fluencyScore").default(0),
  pronunciationScore: int("pronunciationScore").default(0),
  overallScore: int("overallScore").default(0),
  feedback: text("feedback"),
  duration: int("duration").default(0), // seconds
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type SpeakingAttempt = typeof speakingAttempts.$inferSelect;

// ============================================================
// ACTIVITY LOG (for streaks, analytics)
// ============================================================

export const activityLog = mysqlTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  activityType: mysqlEnum("activityType", ["lesson", "vocabulary", "grammar", "speaking", "writing", "listening", "reading", "placement_test", "daily_challenge"]).notNull(),
  activityId: bigint("activityId", { mode: "number", unsigned: true }),
  xpEarned: int("xpEarned").default(0),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;

// ============================================================
// NOTIFICATIONS
// ============================================================

export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: mysqlEnum("type", ["reminder", "achievement", "streak", "weekly_report", "system"]).default("system"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// ============================================================
// LEADERBOARD
// ============================================================

export const leaderboard = mysqlTable("leaderboard", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  weeklyXp: int("weeklyXp").default(0),
  monthlyXp: int("monthlyXp").default(0),
  totalXp: int("totalXp").default(0),
  rank: int("rank").default(0),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Leaderboard = typeof leaderboard.$inferSelect;

// ============================================================
// MOCK EXAMS
// ============================================================

export const mockExams = mysqlTable("mock_exams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  examType: mysqlEnum("examType", ["ielts", "toefl", "toeic", "general"]).notNull(),
  description: text("description"),
  duration: int("duration").default(60), // minutes
  totalQuestions: int("totalQuestions").default(40),
  questions: json("questions"),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1", "C2"]).default("B1"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MockExam = typeof mockExams.$inferSelect;

// ============================================================
// MOCK EXAM ATTEMPTS
// ============================================================

export const mockExamAttempts = mysqlTable("mock_exam_attempts", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  mockExamId: bigint("mockExamId", { mode: "number", unsigned: true }).notNull(),
  score: int("score").default(0),
  correctAnswers: int("correctAnswers").default(0),
  wrongAnswers: int("wrongAnswers").default(0),
  timeSpent: int("timeSpent").default(0), // seconds
  answers: json("answers"),
  completed: boolean("completed").default(false),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type MockExamAttempt = typeof mockExamAttempts.$inferSelect;

// ============================================================
// SHADOWING SESSIONS
// ============================================================

export const shadowingSessions = mysqlTable("shadowing_sessions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  transcript: text("transcript").notNull(),
  audioUrl: text("audioUrl"),
  cefrLevel: mysqlEnum("cefrLevel", ["A1", "A2", "B1", "B2", "C1", "C2"]).default("B1"),
  category: varchar("category", { length: 100 }),
  duration: int("duration").default(60), // seconds
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShadowingSession = typeof shadowingSessions.$inferSelect;

// ============================================================
// USER SHADOWING PROGRESS
// ============================================================

export const userShadowingProgress = mysqlTable("user_shadowing_progress", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  shadowingSessionId: bigint("shadowingSessionId", { mode: "number", unsigned: true }).notNull(),
  timesPracticed: int("timesPracticed").default(0),
  lastAccuracy: int("lastAccuracy").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

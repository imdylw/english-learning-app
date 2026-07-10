// Relations for Drizzle ORM
// Define relationships between tables for relational queries

import { relations } from "drizzle-orm";
import {
  users,
  profiles,
  lessons,
  userProgress,
  vocabulary,
  userVocabulary,
  grammarLessons,
  grammarProgress,
  achievements,
  userAchievements,
  dailyChallenges,
  learningPaths,
  userLearningPaths,
  placementTests,
  writingSubmissions,
  speakingAttempts,
  activityLog,
  notifications,
  mockExams,
  mockExamAttempts,
  shadowingSessions,
  userShadowingProgress,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  progress: many(userProgress),
  vocabulary: many(userVocabulary),
  grammarProgress: many(grammarProgress),
  achievements: many(userAchievements),
  challenges: many(dailyChallenges),
  learningPaths: many(userLearningPaths),
  placementTests: many(placementTests),
  writingSubmissions: many(writingSubmissions),
  speakingAttempts: many(speakingAttempts),
  activityLog: many(activityLog),
  notifications: many(notifications),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  progress: many(userProgress),
  learningPath: one(learningPaths, { fields: [lessons.learningPathId], references: [learningPaths.id] }),
}));

export const learningPathsRelations = relations(learningPaths, ({ many }) => ({
  lessons: many(lessons),
  userPaths: many(userLearningPaths),
}));

export const vocabularyRelations = relations(vocabulary, ({ many }) => ({
  userVocabulary: many(userVocabulary),
}));

export const grammarLessonsRelations = relations(grammarLessons, ({ many }) => ({
  progress: many(grammarProgress),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const mockExamsRelations = relations(mockExams, ({ many }) => ({
  attempts: many(mockExamAttempts),
}));

export const shadowingSessionsRelations = relations(shadowingSessions, ({ many }) => ({
  userProgress: many(userShadowingProgress),
}));

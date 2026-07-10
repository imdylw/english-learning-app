import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/layout/Navigation";
import {
  BookOpen, CheckCircle,  Target,
  GraduationCap,  Star,
} from "lucide-react";

const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export default function GrammarPage() {
  const { isAuthenticated } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<string>("A1");
  const [activeLesson, setActiveLesson] = useState<number | null>(null);
  // Exercise state removed
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, string>>({});
  const [exerciseResults, setExerciseResults] = useState<Record<number, boolean>>({});

  const { data: grammarLessons, isLoading } = trpc.grammar.list.useQuery({
    cefrLevel: selectedLevel as any,
  });

  const { data: userProgress } = trpc.grammar.getUserProgress.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const submitProgress = trpc.grammar.submitProgress.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    document.title = "Grammar Center | EnglishNow";
  }, []);

  const activeLessonData = grammarLessons?.find((l) => l.id === activeLesson);
  const exercises = activeLessonData?.exercises ? JSON.parse(activeLessonData.exercises as string) : [];
  const examples = activeLessonData?.examples ? JSON.parse(activeLessonData.examples as string) : [];

  const getProgress = (lessonId: number) => {
    return userProgress?.find((p) => p.grammarLessonId === lessonId);
  };

  const handleCheckAnswer = (exIndex: number, userAnswer: string, correctAnswer: string) => {
    const correct = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
    setExerciseResults((prev) => ({ ...prev, [exIndex]: correct }));
    setExerciseAnswers((prev) => ({ ...prev, [exIndex]: userAnswer }));
  };

  const handleCompleteLesson = () => {
    if (activeLesson && isAuthenticated) {
      const correctCount = Object.values(exerciseResults).filter(Boolean).length;
      const score = exercises.length > 0 ? Math.round((correctCount / exercises.length) * 100) : 100;
      submitProgress.mutate(
        { grammarLessonId: activeLesson, score, completed: true },
        { onSuccess: () => utils.grammar.getUserProgress.invalidate() }
      );
    }
    setActiveLesson(null);
    setExerciseAnswers({});
    setExerciseResults({});
  };

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-4xl text-[var(--starlight)] mb-2">Grammar Center</h1>
            <p className="text-[var(--starlight-dim)]">Master English grammar with interactive lessons and exercises.</p>
          </motion.div>

          {/* Level Selector */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-8 flex-wrap">
            {cefrLevels.map((level) => (
              <button
                key={level}
                onClick={() => { setSelectedLevel(level); setActiveLesson(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-mono font-medium transition-colors ${
                  selectedLevel === level ? "bg-[var(--gold)] text-[var(--midnight)]" : "glass-panel text-[var(--starlight-dim)] hover:text-[var(--starlight)]"
                }`}
              >
                {level}
              </button>
            ))}
          </motion.div>

          {activeLesson ? (
            /* Lesson Detail */
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <button
                onClick={() => setActiveLesson(null)}
                className="text-sm text-[var(--starlight-dim)] hover:text-[var(--gold)] mb-4 flex items-center gap-1"
              >
                &larr; Back to lessons
              </button>

              <div className="glass-panel rounded-2xl p-8 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-[var(--gold)]" />
                  <span className="text-xs text-[var(--gold)] font-mono">{activeLessonData?.cefrLevel}</span>
                  <span className="text-xs text-[var(--starlight-muted)] capitalize">{activeLessonData?.topic}</span>
                </div>
                <h2 className="font-display text-2xl text-[var(--starlight)] mb-4">{activeLessonData?.title}</h2>
                <p className="text-sm text-[var(--starlight-dim)] mb-6">{activeLessonData?.description}</p>

                <div className="prose prose-invert max-w-none">
                  <div className="bg-[var(--midnight-card)] rounded-xl p-5 mb-6">
                    <h3 className="text-sm font-semibold text-[var(--gold)] mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Explanation
                    </h3>
                    <p className="text-sm text-[var(--starlight-dim)] leading-relaxed">{activeLessonData?.explanation}</p>
                  </div>

                  {examples.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-[var(--starlight)] mb-3">Examples</h3>
                      <div className="space-y-3">
                        {examples.map((ex: any, i: number) => (
                          <div key={i} className="bg-[var(--midnight-card)] rounded-xl p-4">
                            <p className="text-sm text-[var(--starlight)] mb-1">{ex.sentence}</p>
                            <p className="text-xs text-[var(--starlight-muted)]">{ex.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Exercises */}
              {exercises.length > 0 && (
                <div className="glass-panel rounded-2xl p-8 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[var(--starlight)]">Exercises</h3>
                    <span className="text-xs text-[var(--starlight-muted)]">
                      {Object.values(exerciseResults).filter(Boolean).length}/{exercises.length} correct
                    </span>
                  </div>

                  <div className="space-y-6">
                    {exercises.map((ex: any, i: number) => (
                      <div key={i} className="bg-[var(--midnight-card)] rounded-xl p-5">
                        <p className="text-sm text-[var(--starlight)] mb-3">{ex.question}</p>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={exerciseAnswers[i] ?? ""}
                            onChange={(e) => setExerciseAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                            placeholder="Your answer..."
                            className="flex-1 px-4 py-2 rounded-lg bg-[var(--midnight)] border border-white/10 text-[var(--starlight)] placeholder:text-[var(--starlight-muted)] focus:outline-none focus:border-[var(--gold)]/30 text-sm"
                            disabled={exerciseResults[i] !== undefined}
                          />
                          <button
                            onClick={() => handleCheckAnswer(i, exerciseAnswers[i] ?? "", ex.answer)}
                            disabled={!exerciseAnswers[i] || exerciseResults[i] !== undefined}
                            className="px-4 py-2 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] text-sm font-medium hover:bg-[var(--gold)]/20 disabled:opacity-30 transition-colors"
                          >
                            Check
                          </button>
                        </div>
                        {exerciseResults[i] !== undefined && (
                          <div className={`mt-3 text-sm flex items-center gap-2 ${exerciseResults[i] ? "text-[var(--accent-cyan)]" : "text-[var(--accent-coral)]"}`}>
                            {exerciseResults[i] ? <CheckCircle className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                            {exerciseResults[i] ? "Correct!" : `Correct answer: ${ex.answer}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleCompleteLesson}
                    className="gold-btn mt-6 w-full flex items-center justify-center gap-2"
                  >
                    <GraduationCap className="w-4 h-4" />
                    {isAuthenticated ? "Mark as Complete" : "Complete Lesson"}
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            /* Lesson List */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="glass-panel rounded-xl p-5 animate-pulse">
                    <div className="h-4 bg-[var(--midnight-card)] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[var(--midnight-card)] rounded w-full" />
                  </div>
                ))
              ) : (
                (grammarLessons ?? []).map((lesson, i) => {
                  const progress = getProgress(lesson.id);
                  return (
                    <motion.button
                      key={lesson.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setActiveLesson(lesson.id)}
                      className="glass-panel rounded-xl p-5 text-left card-hover group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center group-hover:bg-[var(--gold)]/20 transition-colors">
                          <BookOpen className="w-5 h-5 text-[var(--gold)]" />
                        </div>
                        {progress?.completed && (
                          <CheckCircle className="w-5 h-5 text-[var(--accent-cyan)]" />
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--starlight)] mb-1 group-hover:text-[var(--gold)] transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-[var(--starlight-dim)] mb-3 line-clamp-2">{lesson.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
                          +{lesson.xpReward} XP
                        </span>
                        {progress && (
                          <span className="text-[10px] text-[var(--starlight-muted)]">
                            {progress.score ?? 0}%
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

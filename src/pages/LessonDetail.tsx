import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/layout/Navigation";
import {
  ArrowLeft, Clock, GraduationCap, CheckCircle, XCircle,
  ChevronRight, ChevronLeft, BookOpen,
} from "lucide-react";

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const lessonId = Number(id);

  const { data: lesson, isLoading } = trpc.lessons.getById.useQuery({ id: lessonId });
  const { data: _progress } = trpc.lessons.getUserProgress.useQuery(
    { lessonId },
    { enabled: isAuthenticated }
  );

  const submitProgress = trpc.lessons.submitProgress.useMutation();
  const recordActivity = trpc.progress.recordActivity.useMutation();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Array<{ question: number; correct: boolean; answer: number }>>([]);

  const content = lesson?.content ? JSON.parse(lesson.content as string) : { questions: [] };
  const questions = content.questions ?? [];

  useEffect(() => {
    if (lesson) document.title = `${lesson.title} | EnglishNow`;
  }, [lesson]);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const q = questions[currentQuestion];
    const correct = q.type === "multiple_choice" ? index === q.correct : true;

    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, { question: currentQuestion, correct, answer: index }]);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Complete lesson
      const finalScore = Math.round((score / questions.length) * 100);
      const xpEarned = lesson?.xpReward ?? 10;

      if (isAuthenticated) {
        submitProgress.mutate({
          lessonId,
          score: finalScore,
          xpEarned,
          timeSpent: 0,
          answers,
          completed: true,
        });
        recordActivity.mutate({
          activityType: "lesson",
          activityId: lessonId,
          xpEarned,
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((c) => c - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const isComplete = currentQuestion >= questions.length - 1 && showResult;
  const finalScore = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--midnight)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[var(--midnight)] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-[var(--starlight-muted)] mx-auto mb-4" />
          <p className="text-[var(--starlight-dim)]">Lesson not found.</p>
          <button onClick={() => navigate("/lessons")} className="text-[var(--gold)] text-sm mt-2 hover:underline">
            Back to lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max max-w-3xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <button
              onClick={() => navigate("/lessons")}
              className="flex items-center gap-2 text-sm text-[var(--starlight-dim)] hover:text-[var(--gold)] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lessons
            </button>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] font-mono">
                {lesson.cefrLevel}
              </span>
              <span className="text-[10px] text-[var(--starlight-muted)] capitalize flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lesson.duration} min
              </span>
              <span className="text-[10px] text-[var(--starlight-muted)] flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                +{lesson.xpReward} XP
              </span>
            </div>
            <h1 className="font-display text-3xl text-[var(--starlight)]">{lesson.title}</h1>
            <p className="text-[var(--starlight-dim)] mt-2">{lesson.description}</p>
          </motion.div>

          {/* Progress Bar */}
          {questions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--starlight-muted)]">
                  Question {Math.min(currentQuestion + 1, questions.length)} of {questions.length}
                </span>
                <span className="text-xs text-[var(--gold)] font-mono">
                  {Math.round(((currentQuestion + (showResult ? 1 : 0)) / questions.length) * 100)}%
                </span>
              </div>
              <div className="h-1 rounded-full bg-[var(--midnight-card)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[var(--gold)]"
                  animate={{ width: `${((currentQuestion + (showResult ? 1 : 0)) / questions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Question or Completion */}
          <AnimatePresence mode="wait">
            {!isComplete ? (
              questions.length > 0 && questions[currentQuestion] ? (
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-panel rounded-2xl p-8"
                >
                  <h2 className="text-lg text-[var(--starlight)] mb-6">
                    {questions[currentQuestion].question}
                  </h2>

                  <div className="space-y-3">
                    {questions[currentQuestion].options?.map((option: string, i: number) => {
                      const isSelected = selectedAnswer === i;
                      const isCorrect = i === questions[currentQuestion].correct;
                      const showCorrect = showResult && isCorrect;
                      const showWrong = showResult && isSelected && !isCorrect;

                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          disabled={showResult}
                          className={`w-full p-4 rounded-xl border text-left transition-all ${
                            showCorrect
                              ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10"
                              : showWrong
                              ? "border-[var(--accent-coral)] bg-[var(--accent-coral)]/10"
                              : isSelected
                              ? "border-[var(--gold)] bg-[var(--gold-dim)]"
                              : "border-white/5 bg-[var(--midnight-card)] hover:border-[var(--gold)]/30 hover:bg-[var(--midnight-light)]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              showCorrect
                                ? "border-[var(--accent-cyan)]"
                                : showWrong
                                ? "border-[var(--accent-coral)]"
                                : isSelected
                                ? "border-[var(--gold)]"
                                : "border-white/20"
                            }`}>
                              {showCorrect && <CheckCircle className="w-4 h-4 text-[var(--accent-cyan)]" />}
                              {showWrong && <XCircle className="w-4 h-4 text-[var(--accent-coral)]" />}
                              {!showResult && isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />
                              )}
                            </div>
                            <span className={`text-sm ${
                              showCorrect ? "text-[var(--accent-cyan)]" : showWrong ? "text-[var(--accent-coral)]" : "text-[var(--starlight)]"
                            }`}>
                              {option}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 rounded-xl bg-[var(--midnight-card)]"
                    >
                      <p className="text-sm text-[var(--starlight-dim)]">
                        {answers[answers.length - 1]?.correct
                          ? "Correct! Well done."
                          : `The correct answer was: ${questions[currentQuestion].options?.[questions[currentQuestion].correct]}`}
                      </p>
                    </motion.div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8">
                    <button
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                      className="flex items-center gap-2 text-sm text-[var(--starlight-dim)] hover:text-[var(--starlight)] disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    {showResult && (
                      <button
                        onClick={handleNext}
                        className="gold-btn flex items-center gap-2 text-sm"
                      >
                        {currentQuestion < questions.length - 1 ? "Next" : "Finish"}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="glass-panel rounded-2xl p-8 text-center">
                  <BookOpen className="w-12 h-12 text-[var(--gold)] mx-auto mb-4" />
                  <h2 className="text-xl text-[var(--starlight)] mb-2">No Questions Available</h2>
                  <p className="text-sm text-[var(--starlight-dim)] mb-6">This lesson is content-only. Mark it as complete when you&apos;re done studying.</p>
                  <button
                    onClick={() => {
                      if (isAuthenticated) {
                        submitProgress.mutate({
                          lessonId,
                          score: 100,
                          xpEarned: lesson.xpReward ?? 10,
                          timeSpent: 0,
                          answers: [],
                          completed: true,
                        });
                      }
                      navigate("/lessons");
                    }}
                    className="gold-btn"
                  >
                    Mark Complete
                  </button>
                </div>
              )
            ) : (
              /* Completion Screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-2xl p-8 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-[var(--accent-cyan)]/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-[var(--accent-cyan)]" />
                </div>
                <h2 className="font-display text-3xl text-[var(--starlight)] mb-2">
                  Lesson Complete!
                </h2>
                <p className="text-[var(--starlight-dim)] mb-6">
                  You scored {finalScore}% on this lesson.
                </p>
                <div className="flex items-center justify-center gap-8 mb-8">
                  <div>
                    <div className="font-mono text-3xl text-[var(--gold)]">{score}</div>
                    <div className="text-xs text-[var(--starlight-muted)]">Correct</div>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div>
                    <div className="font-mono text-3xl text-[var(--starlight)]">{questions.length - score}</div>
                    <div className="text-xs text-[var(--starlight-muted)]">Incorrect</div>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div>
                    <div className="font-mono text-3xl text-[var(--gold)]">+{lesson.xpReward}</div>
                    <div className="text-xs text-[var(--starlight-muted)]">XP Earned</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => navigate("/lessons")} className="ghost-btn">
                    Back to Lessons
                  </button>
                  <button onClick={() => navigate("/dashboard")} className="gold-btn">
                    Go to Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

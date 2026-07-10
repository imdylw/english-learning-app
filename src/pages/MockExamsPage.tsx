import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/layout/Navigation";
import {
  Award, Clock, CheckCircle, XCircle, RotateCcw,
  BarChart3, BookOpen, ChevronRight, ChevronLeft,
} from "lucide-react";

const examTypeColors: Record<string, string> = {
  ielts: "bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]",
  toefl: "bg-[var(--accent-sky)]/10 text-[var(--accent-sky)]",
  toeic: "bg-[var(--gold)]/10 text-[var(--gold)]",
  general: "bg-[var(--starlight)]/10 text-[var(--starlight)]",
};

type ExamPhase = "list" | "testing" | "results";

export default function MockExamsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [phase, setPhase] = useState<ExamPhase>("list");
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Array<any>>([]);
  const [timeLeft, setTimeLeft] = useState(0);

  const { data: exams, isLoading } = trpc.mockExams.list.useQuery();
  const { data: attempts } = trpc.mockExams.getAttempts.useQuery(undefined, { enabled: isAuthenticated });

  const startAttempt = trpc.mockExams.startAttempt.useMutation();
  const submitAttempt = trpc.mockExams.submitAttempt.useMutation();

  const currentExam = exams?.find((e) => e.id === selectedExam);
  const questions = currentExam?.questions ? JSON.parse(currentExam.questions as string) : [];

  useEffect(() => {
    document.title = "Mock Exams | EnglishNow";
  }, []);

  useEffect(() => {
    if (phase === "testing" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { setPhase("results"); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, timeLeft]);

  const handleStartExam = (examId: number) => {
    setSelectedExam(examId);
    setPhase("testing");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);

    const exam = exams?.find((e) => e.id === examId);
    setTimeLeft((exam?.duration ?? 30) * 60);

    if (isAuthenticated) startAttempt.mutate({ examId });
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    const correct = index === questions[currentQuestion]?.correct;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, { question: currentQuestion, answer: index, correct }]);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Finish
      const finalScore = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
      if (isAuthenticated && selectedExam) {
        submitAttempt.mutate({
          attemptId: 0, // We'd need to track this properly
          answers,
          score: finalScore,
          correctAnswers: score,
          wrongAnswers: questions.length - score,
          timeSpent: (currentExam?.duration ?? 30) * 60 - timeLeft,
        });
      }
      setPhase("results");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-4xl text-[var(--starlight)] mb-2">Mock Exams</h1>
            <p className="text-[var(--starlight-dim)]">Timed practice tests for IELTS, TOEFL, TOEIC, and general assessment.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {phase === "list" && (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => <div key={i} className="glass-panel rounded-xl p-6 animate-pulse h-28" />)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(exams ?? []).map((exam, i) => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel rounded-xl p-6 card-hover"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center flex-shrink-0">
                              <Award className="w-6 h-6 text-[var(--gold)]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-semibold text-[var(--starlight)]">{exam.name}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${examTypeColors[exam.examType]}`}>
                                  {exam.examType}
                                </span>
                              </div>
                              <p className="text-xs text-[var(--starlight-dim)] mb-2">{exam.description}</p>
                              <div className="flex items-center gap-4 text-[10px] text-[var(--starlight-muted)]">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.duration} min</span>
                                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{exam.totalQuestions} questions</span>
                                <span className="font-mono text-[var(--gold)]">{exam.cefrLevel}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleStartExam(exam.id)}
                            className="gold-btn text-xs py-2 px-4 flex-shrink-0"
                          >
                            Start
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Previous Attempts */}
                {isAuthenticated && attempts && attempts.length > 0 && (
                  <div className="mt-10">
                    <h2 className="text-sm font-medium text-[var(--starlight-muted)] uppercase tracking-wide mb-4">Your Attempts</h2>
                    <div className="space-y-2">
                      {attempts.slice(0, 5).map((a) => (
                        <div key={a.id} className="glass-panel rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BarChart3 className="w-4 h-4 text-[var(--gold)]" />
                            <div>
                              <div className="text-xs text-[var(--starlight)]">Mock Exam #{a.mockExamId}</div>
                              <div className="text-[10px] text-[var(--starlight-muted)]">{a.completedAt ? new Date(a.completedAt).toLocaleDateString() : "In progress"}</div>
                            </div>
                          </div>
                          <span className="font-mono text-sm text-[var(--gold)]">{a.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {phase === "testing" && currentExam && (
              <motion.div key="testing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Timer & Progress */}
                <div className="glass-panel rounded-xl p-4 mb-6 flex items-center justify-between">
                  <span className="text-xs text-[var(--starlight-muted)]">
                    Q{currentQuestion + 1}/{questions.length}
                  </span>
                  <div className={`font-mono text-sm ${timeLeft < 60 ? "text-[var(--accent-coral)]" : "text-[var(--gold)]"}`}>
                    <Clock className="w-4 h-4 inline mr-1" />
                    {formatTime(timeLeft)}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="h-1 rounded-full bg-[var(--midnight-card)] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
                  </div>
                </div>

                {/* Question */}
                {questions[currentQuestion] && (
                  <div className="glass-panel rounded-2xl p-8">
                    <p className="text-sm text-[var(--starlight)] mb-2">{questions[currentQuestion].section && `Section ${questions[currentQuestion].section}`}</p>
                    <h2 className="text-lg text-[var(--starlight)] mb-6">{questions[currentQuestion].question || questions[currentQuestion].passage}</h2>
                    {questions[currentQuestion].passage && !questions[currentQuestion].question && (
                      <p className="text-sm text-[var(--starlight-dim)] mb-4 italic">{questions[currentQuestion].passage}</p>
                    )}
                    {questions[currentQuestion].question && questions[currentQuestion].passage && (
                      <p className="text-sm text-[var(--starlight-dim)] mb-4">{questions[currentQuestion].passage}</p>
                    )}

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
                              showCorrect ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10" :
                              showWrong ? "border-[var(--accent-coral)] bg-[var(--accent-coral)]/10" :
                              isSelected ? "border-[var(--gold)] bg-[var(--gold-dim)]" :
                              "border-white/5 bg-[var(--midnight-card)] hover:border-[var(--gold)]/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${showCorrect ? "border-[var(--accent-cyan)]" : showWrong ? "border-[var(--accent-coral)]" : isSelected ? "border-[var(--gold)]" : "border-white/20"}`}>
                                {showCorrect && <CheckCircle className="w-4 h-4 text-[var(--accent-cyan)]" />}
                                {showWrong && <XCircle className="w-4 h-4 text-[var(--accent-coral)]" />}
                                {!showResult && isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />}
                              </div>
                              <span className={`text-sm ${showCorrect ? "text-[var(--accent-cyan)]" : showWrong ? "text-[var(--accent-coral)]" : "text-[var(--starlight)]"}`}>{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {showResult && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 rounded-xl bg-[var(--midnight-card)] text-sm text-[var(--starlight-dim)]">
                        {answers[answers.length - 1]?.correct ? "Correct!" : `The correct answer is: ${questions[currentQuestion].options?.[questions[currentQuestion].correct]}`}
                      </motion.div>
                    )}

                    <div className="flex justify-end mt-6">
                      {showResult && (
                        <button onClick={handleNext} className="gold-btn flex items-center gap-2">
                          {currentQuestion < questions.length - 1 ? <>Next <ChevronRight className="w-4 h-4" /></> : "Finish"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {phase === "results" && (
              <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-[var(--accent-cyan)]/10 flex items-center justify-center mx-auto mb-6">
                  <Award className="w-10 h-10 text-[var(--accent-cyan)]" />
                </div>
                <h2 className="font-display text-3xl text-[var(--starlight)] mb-4">Test Complete!</h2>
                <div className="glass-panel rounded-2xl p-8 max-w-md mx-auto">
                  <div className="font-mono text-5xl text-[var(--gold)] mb-2">
                    {questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}%
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-6">
                    <div><div className="font-mono text-xl text-[var(--accent-cyan)]">{score}</div><div className="text-[10px] text-[var(--starlight-muted)]">Correct</div></div>
                    <div className="w-px h-8 bg-white/10" />
                    <div><div className="font-mono text-xl text-[var(--starlight)]">{questions.length - score}</div><div className="text-[10px] text-[var(--starlight-muted)]">Incorrect</div></div>
                    <div className="w-px h-8 bg-white/10" />
                    <div><div className="font-mono text-xl text-[var(--gold)]">{questions.length}</div><div className="text-[10px] text-[var(--starlight-muted)]">Total</div></div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button onClick={() => setPhase("list")} className="ghost-btn">Back to Exams</button>
                  <button onClick={() => selectedExam && handleStartExam(selectedExam)} className="gold-btn flex items-center gap-2"><RotateCcw className="w-4 h-4" />Retake</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

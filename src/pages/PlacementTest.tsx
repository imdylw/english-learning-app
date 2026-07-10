import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/layout/Navigation";
import {
  ArrowRight, CheckCircle, Target, BarChart3, GraduationCap,
  BookOpen, MessageSquare, PenTool, Headphones, Mic, ChevronRight,
  Sparkles, ArrowLeft, RotateCcw,
} from "lucide-react";

// Predefined placement test questions by skill
const placementQuestions = {
  grammar: [
    { question: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], correct: 1 },
    { question: "I ___ a student.", options: ["am", "is", "are", "be"], correct: 0 },
    { question: "They ___ playing football now.", options: ["is", "are", "was", "were"], correct: 1 },
    { question: "If it rains, I ___ at home.", options: ["stay", "will stay", "would stay", "stayed"], correct: 1 },
    { question: "I have never ___ sushi.", options: ["eat", "ate", "eaten", "eating"], correct: 2 },
    { question: "By this time next year, I ___ my degree.", options: ["will finish", "will have finished", "am going to finish", "finish"], correct: 1 },
  ],
  vocabulary: [
    { question: "What is the opposite of 'generous'?", options: ["kind", "selfish", "friendly", "helpful"], correct: 1 },
    { question: "'Ubiquitous' means:", options: ["rare", "everywhere", "expensive", "beautiful"], correct: 1 },
    { question: "Choose the synonym for 'ephemeral':", options: ["permanent", "fleeting", "strong", "ancient"], correct: 1 },
    { question: "What does 'however' express?", options: ["agreement", "contrast", "time", "cause"], correct: 1 },
    { question: "'Controversial' refers to something that is:", options: ["widely accepted", "disputed", "simple", "boring"], correct: 1 },
  ],
  reading: [
    { question: "Read: 'The implementation of the new system was successful.' What does 'implementation' mean?", options: ["destruction", "execution", "planning", "criticism"], correct: 1 },
    { question: "In academic writing, which is most formal?", options: ["I think that...", "In my opinion...", "It is evident that...", "I believe that..."], correct: 2 },
    { question: "A metaphor is:", options: ["A direct comparison using 'like'", "An implied comparison without 'like'", "A type of simile", "A literal statement"], correct: 1 },
  ],
  listening: [
    { question: "Listen to the audio (simulated): 'Turn left at the library.' What is the landmark?", options: ["bank", "library", "school", "park"], correct: 1 },
    { question: "You hear: 'I'd like a medium latte, please.' Where is this conversation happening?", options: ["library", "restaurant", "coffee shop", "airport"], correct: 2 },
    { question: "'The flight has been delayed by two hours.' What happened?", options: ["The flight left early", "The flight is late", "The flight was cancelled", "The flight is on time"], correct: 1 },
  ],
  speaking: [
    { question: "Which phrase is most polite for disagreeing?", options: ["You're wrong!", "I don't agree", "With respect, I must disagree", "That's incorrect"], correct: 2 },
    { question: "How do you start a formal email?", options: ["Hey!", "Hi there!", "Dear Mr. Smith,", "What's up?"], correct: 2 },
    { question: "Which is the best way to ask for permission?", options: ["Give me that!", "May I borrow your pen?", "I want your pen", "Pen, please"], correct: 1 },
  ],
  writing: [
    { question: "Which sentence is grammatically correct?", options: ["She don't like apples", "She doesn't likes apples", "She doesn't like apples", "She not like apples"], correct: 2 },
    { question: "Choose the correct past tense: 'I ___ to the cinema yesterday.'", options: ["go", "went", "gone", "going"], correct: 1 },
    { question: "Which connector is best for showing contrast?", options: ["and", "but", "so", "because"], correct: 1 },
  ],
};

const skillIcons: Record<string, React.ElementType> = {
  grammar: BookOpen,
  vocabulary: Target,
  reading: BookOpen,
  listening: Headphones,
  speaking: Mic,
  writing: PenTool,
};

const skillNames: Record<string, string> = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  reading: "Reading",
  listening: "Listening",
  speaking: "Speaking",
  writing: "Writing",
};

type TestPhase = "intro" | "testing" | "results";

export default function PlacementTest() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const submitPlacement = trpc.placement.submit.useMutation();

  const [phase, setPhase] = useState<TestPhase>("intro");
  const [currentSkill, setCurrentSkill] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [skillScores, setSkillScores] = useState<Record<string, { correct: number; total: number }>>({});
  const [answers, setAnswers] = useState<Array<any>>([]);

  const skills = Object.keys(placementQuestions);
  const currentSkillName = skills[currentSkill];
  const questions = placementQuestions[currentSkillName as keyof typeof placementQuestions];
  const currentQ = questions?.[currentQuestion];

  useEffect(() => {
    document.title = "Placement Test | EnglishNow";
  }, []);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const correct = index === currentQ.correct;
    setSkillScores((prev) => ({
      ...prev,
      [currentSkillName]: {
        correct: (prev[currentSkillName]?.correct ?? 0) + (correct ? 1 : 0),
        total: (prev[currentSkillName]?.total ?? 0) + 1,
      },
    }));

    setAnswers((prev) => [...prev, { skill: currentSkillName, question: currentQ.question, answer: currentQ.options[index], correct }]);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else if (currentSkill < skills.length - 1) {
      setCurrentSkill((c) => c + 1);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Test complete
      const scores: Record<string, number> = {};
      skills.forEach((skill) => {
        const s = skillScores[skill];
        const totalQ = placementQuestions[skill as keyof typeof placementQuestions].length;
        scores[skill] = s ? Math.round((s.correct / totalQ) * 100) : 0;
      });

      if (isAuthenticated) {
        submitPlacement.mutate({
          grammarScore: scores.grammar ?? 0,
          vocabularyScore: scores.vocabulary ?? 0,
          readingScore: scores.reading ?? 0,
          listeningScore: scores.listening ?? 0,
          speakingScore: scores.speaking ?? 0,
          writingScore: scores.writing ?? 0,
          answers,
        });
      }

      setPhase("results");
    }
  };

  const getOverallResults = () => {
    const scores: Record<string, number> = {};
    skills.forEach((skill) => {
      const s = skillScores[skill];
      const totalQ = placementQuestions[skill as keyof typeof placementQuestions].length;
      scores[skill] = s ? Math.round((s.correct / totalQ) * 100) : 0;
    });
    const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / skills.length);

    let cefr: string = "A1";
    if (overall >= 95) cefr = "C2";
    else if (overall >= 85) cefr = "C1";
    else if (overall >= 70) cefr = "B2";
    else if (overall >= 55) cefr = "B1";
    else if (overall >= 40) cefr = "A2";

    return { scores, overall, cefr };
  };

  const { scores, overall, cefr } = phase === "results" ? getOverallResults() : { scores: {}, overall: 0, cefr: "A1" };

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-[var(--gold)]" />
                </div>
                <h1 className="font-display text-4xl md:text-5xl text-[var(--starlight)] mb-4">
                  Placement Test
                </h1>
                <p className="text-[var(--starlight-dim)] max-w-lg mx-auto mb-8">
                  Our adaptive test assesses your English skills across 6 areas: Grammar, Vocabulary,
                  Reading, Listening, Speaking, and Writing. Takes about 10 minutes.
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
                  {skills.map((skill) => {
                    const Icon = skillIcons[skill];
                    return (
                      <div key={skill} className="glass-panel rounded-xl p-3">
                        <Icon className="w-5 h-5 text-[var(--gold)] mx-auto mb-1" />
                        <div className="text-[10px] text-[var(--starlight-dim)] capitalize">{skill}</div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => setPhase("testing")} className="gold-btn text-lg px-10 py-4">
                  Start Test
                  <ArrowRight className="w-5 h-5 inline ml-2" />
                </button>
                {!isAuthenticated && (
                  <p className="text-xs text-[var(--starlight-muted)] mt-4">
                    <button onClick={() => navigate("/login")} className="text-[var(--gold)] hover:underline">
                      Sign in
                    </button>{" "}
                    to save your results
                  </p>
                )}
              </motion.div>
            )}

            {phase === "testing" && (
              <motion.div
                key="testing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[var(--starlight-muted)] capitalize">
                      {skillNames[currentSkillName]} ({currentSkill + 1}/{skills.length})
                    </span>
                    <span className="text-xs text-[var(--gold)] font-mono">
                      {Math.round(((currentSkill * questions.length + currentQuestion + (showResult ? 1 : 0)) /
                        (skills.length * questions.length)) * 100)}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-[var(--midnight-card)] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[var(--gold)]"
                      animate={{
                        width: `${((currentSkill * questions.length + currentQuestion + (showResult ? 1 : 0)) /
                          (skills.length * questions.length)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="glass-panel rounded-2xl p-8">
                  <div className="flex items-center gap-2 mb-6">
                    {(() => {
                      const Icon = skillIcons[currentSkillName];
                      return <Icon className="w-5 h-5 text-[var(--gold)]" />;
                    })()}
                    <span className="text-xs text-[var(--starlight-muted)] capitalize">
                      {skillNames[currentSkillName]}
                    </span>
                  </div>

                  <h2 className="text-lg text-[var(--starlight)] mb-6">
                    {currentQ?.question}
                  </h2>

                  <div className="space-y-3">
                    {currentQ?.options.map((option: string, i: number) => {
                      const isSelected = selectedAnswer === i;
                      const isCorrect = i === currentQ.correct;
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
                              : "border-white/5 bg-[var(--midnight-card)] hover:border-[var(--gold)]/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              showCorrect ? "border-[var(--accent-cyan)]" : showWrong ? "border-[var(--accent-coral)]" : isSelected ? "border-[var(--gold)]" : "border-white/20"
                            }`}>
                              {showCorrect && <CheckCircle className="w-4 h-4 text-[var(--accent-cyan)]" />}
                              {showWrong && <span className="text-[var(--accent-coral)] text-xs">✕</span>}
                              {!showResult && isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />}
                            </div>
                            <span className={`text-sm ${showCorrect ? "text-[var(--accent-cyan)]" : showWrong ? "text-[var(--accent-coral)]" : "text-[var(--starlight)]"}`}>
                              {option}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 p-4 rounded-xl bg-[var(--midnight-card)] text-sm text-[var(--starlight-dim)]"
                    >
                      {selectedAnswer === currentQ.correct ? "Correct!" : `The correct answer is: ${currentQ.options[currentQ.correct]}`}
                    </motion.div>
                  )}

                  {showResult && (
                    <div className="mt-6 flex justify-end">
                      <button onClick={handleNext} className="gold-btn flex items-center gap-2">
                        {currentSkill < skills.length - 1 || currentQuestion < questions.length - 1 ? (
                          <>Next <ChevronRight className="w-4 h-4" /></>
                        ) : (
                          <>See Results <BarChart3 className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {phase === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-8"
              >
                <div className="text-center mb-10">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center mx-auto mb-6 gold-glow">
                    <GraduationCap className="w-12 h-12 text-[var(--midnight)]" />
                  </div>
                  <h1 className="font-display text-4xl text-[var(--starlight)] mb-2">
                    Your CEFR Level
                  </h1>
                  <div className="font-mono text-6xl text-[var(--gold)] mb-2">{cefr}</div>
                  <p className="text-[var(--starlight-dim)]">
                    Overall Score: {overall}%
                  </p>
                </div>

                {/* Skill Scores */}
                <div className="glass-panel rounded-2xl p-6 mb-8">
                  <h2 className="text-lg font-semibold text-[var(--starlight)] mb-6">Skill Breakdown</h2>
                  <div className="space-y-4">
                    {Object.entries(scores).map(([skill, score]) => {
                      const Icon = skillIcons[skill];
                      return (
                        <div key={skill} className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-[var(--gold)] flex-shrink-0" />
                          <span className="text-sm text-[var(--starlight-dim)] w-24 capitalize">{skillNames[skill]}</span>
                          <div className="flex-1 h-2 rounded-full bg-[var(--midnight-card)] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)]"
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                            />
                          </div>
                          <span className="text-xs font-mono text-[var(--gold)] w-10 text-right">{score}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-[var(--accent-cyan)] mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {Object.entries(scores)
                        .filter(([, s]) => s >= 70)
                        .map(([skill]) => (
                          <li key={skill} className="text-sm text-[var(--starlight-dim)] capitalize flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-[var(--accent-cyan)]" />
                            {skillNames[skill]}
                          </li>
                        ))}
                      {Object.entries(scores).filter(([, s]) => s >= 70).length === 0 && (
                        <li className="text-sm text-[var(--starlight-muted)]">Keep practicing to build strengths!</li>
                      )}
                    </ul>
                  </div>
                  <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-[var(--accent-coral)] mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Focus Areas
                    </h3>
                    <ul className="space-y-2">
                      {Object.entries(scores)
                        .filter(([, s]) => s < 60)
                        .map(([skill]) => (
                          <li key={skill} className="text-sm text-[var(--starlight-dim)] capitalize flex items-center gap-2">
                            <ArrowRight className="w-3 h-3 text-[var(--accent-coral)]" />
                            {skillNames[skill]}
                          </li>
                        ))}
                      {Object.entries(scores).filter(([, s]) => s < 60).length === 0 && (
                        <li className="text-sm text-[var(--starlight-muted)]">Great job! All skills are strong.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button onClick={() => { setPhase("intro"); setCurrentSkill(0); setCurrentQuestion(0); setSelectedAnswer(null); setShowResult(false); setSkillScores({}); setAnswers([]); }} className="ghost-btn flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Retake Test
                  </button>
                  <button onClick={() => navigate("/lessons")} className="gold-btn flex items-center gap-2">
                    Start Learning
                    <ArrowRight className="w-4 h-4" />
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

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/layout/Navigation";
import {
  PenTool, Send, Clock, BarChart3, CheckCircle,
  AlertCircle, Lightbulb, RotateCcw, ChevronRight,
} from "lucide-react";

const writingPrompts = [
  { level: "A1" as const, prompt: "Write 3-5 sentences about yourself. Include your name, age, and where you are from." },
  { level: "A2" as const, prompt: "Write a short paragraph (50-80 words) describing your daily routine." },
  { level: "B1" as const, prompt: "Write an email to a friend inviting them to visit your city. Include suggestions for places to visit (100-150 words)." },
  { level: "B2" as const, prompt: "Write an essay discussing the advantages and disadvantages of remote work. Give your opinion with supporting arguments (200-250 words)." },
  { level: "C1" as const, prompt: "Write a formal letter to a local newspaper editor expressing your views on a current environmental issue and proposing solutions (250-300 words)." },
  { level: "C2" as const, prompt: "Write a critical analysis of how artificial intelligence is reshaping the education sector. Consider ethical implications and future prospects (300+ words)." },
];

export default function WritingPage() {
  const { isAuthenticated } = useAuth();
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submitWriting = trpc.writing.submit.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setSubmitted(true);
    },
  });

  const { data: history } = trpc.writing.getHistory.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    document.title = "Writing Practice | EnglishNow";
  }, []);

  const handleSubmit = () => {
    if (content.trim().length < 10) return;
    submitWriting.mutate({
      prompt: writingPrompts[selectedPrompt].prompt,
      content,
      cefrLevel: writingPrompts[selectedPrompt].level,
    });
  };

  const handleReset = () => {
    setContent("");
    setSubmitted(false);
    setResult(null);
  };

  const wordCount = content.trim().split(/\s+/).filter((w) => w.length > 0).length;

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-4xl text-[var(--starlight)] mb-2">Writing Practice</h1>
            <p className="text-[var(--starlight-dim)]">Write essays, emails, and stories with instant AI-powered grammar feedback.</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Prompt & Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Prompt Selector */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-2xl p-6">
                <h2 className="text-sm font-medium text-[var(--starlight-muted)] uppercase tracking-wide mb-4">Choose a Prompt</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {writingPrompts.map((wp, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedPrompt(i); handleReset(); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-colors ${
                        selectedPrompt === i ? "bg-[var(--gold)] text-[var(--midnight)]" : "glass-panel text-[var(--starlight-dim)] hover:text-[var(--starlight)]"
                      }`}
                    >
                      {wp.level}
                    </button>
                  ))}
                </div>
                <div className="bg-[var(--midnight-card)] rounded-xl p-4">
                  <p className="text-sm text-[var(--starlight)]">{writingPrompts[selectedPrompt].prompt}</p>
                </div>
              </motion.div>

              {/* Editor */}
              {!submitted ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-xs text-[var(--starlight-muted)]">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {wordCount} words
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.max(1, Math.ceil(wordCount / 20))} min read
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing here..."
                    className="w-full h-80 p-6 rounded-2xl glass-panel text-[var(--starlight)] placeholder:text-[var(--starlight-muted)] focus:outline-none focus:border-[var(--gold)]/30 resize-none text-sm leading-relaxed font-mono"
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={wordCount < 5 || submitWriting.isPending}
                      className="gold-btn flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitWriting.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[var(--midnight)] border-t-transparent rounded-full animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit for Feedback
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Results */
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Scores */}
                  <div className="glass-panel rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-[var(--starlight)]">Feedback</h2>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-2xl text-[var(--gold)]">{result?.scores?.overall ?? 0}%</span>
                        <span className="text-xs text-[var(--starlight-muted)]">Overall</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-[var(--midnight-card)] rounded-xl">
                        <div className="font-mono text-xl text-[var(--accent-cyan)] mb-1">{result?.scores?.grammar ?? 0}%</div>
                        <div className="text-[10px] text-[var(--starlight-muted)]">Grammar</div>
                      </div>
                      <div className="text-center p-4 bg-[var(--midnight-card)] rounded-xl">
                        <div className="font-mono text-xl text-[var(--gold)] mb-1">{result?.scores?.vocabulary ?? 0}%</div>
                        <div className="text-[10px] text-[var(--starlight-muted)]">Vocabulary</div>
                      </div>
                      <div className="text-center p-4 bg-[var(--midnight-card)] rounded-xl">
                        <div className="font-mono text-xl text-[var(--accent-sky)] mb-1">{result?.scores?.coherence ?? 0}%</div>
                        <div className="text-[10px] text-[var(--starlight-muted)]">Coherence</div>
                      </div>
                    </div>

                    {/* Errors */}
                    {result?.errors && result.errors.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-[var(--accent-coral)] mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Issues Found ({result.errors.length})
                        </h3>
                        <div className="space-y-2">
                          {result.errors.slice(0, 5).map((error: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-3 bg-[var(--accent-coral)]/5 rounded-xl border border-[var(--accent-coral)]/10">
                              <AlertCircle className="w-4 h-4 text-[var(--accent-coral)] flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-[var(--starlight)]">{error.message}</p>
                                {error.suggestion && (
                                  <p className="text-[10px] text-[var(--accent-coral)] mt-1">Suggestion: {error.suggestion}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {result?.suggestions && result.suggestions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-[var(--gold)] mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Suggestions
                        </h3>
                        {result.suggestions.map((s: any, i: number) => (
                          <p key={i} className="text-xs text-[var(--starlight-dim)] flex items-start gap-2">
                            <ChevronRight className="w-3 h-3 text-[var(--gold)] flex-shrink-0 mt-0.5" />
                            {s.message}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={handleReset} className="ghost-btn flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Write Another
                  </button>
                </motion.div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel rounded-2xl p-6">
                <h2 className="text-sm font-medium text-[var(--starlight-muted)] uppercase tracking-wide mb-4">Writing Tips</h2>
                <ul className="space-y-3">
                  {[
                    "Start with an outline before writing",
                    "Use transition words to connect ideas",
                    "Vary your sentence structure",
                    "Check for subject-verb agreement",
                    "Read your text aloud to catch errors",
                  ].map((tip, i) => (
                    <li key={i} className="text-xs text-[var(--starlight-dim)] flex items-start gap-2">
                      <Lightbulb className="w-3 h-3 text-[var(--gold)] flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* History */}
              {isAuthenticated && history && history.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel rounded-2xl p-6">
                  <h2 className="text-sm font-medium text-[var(--starlight-muted)] uppercase tracking-wide mb-4">Recent Submissions</h2>
                  <div className="space-y-3">
                    {history.slice(0, 5).map((h) => (
                      <div key={h.id} className="flex items-center justify-between p-3 bg-[var(--midnight-card)] rounded-xl">
                        <div>
                          <div className="text-xs text-[var(--starlight)] truncate max-w-[150px]">{h.prompt?.slice(0, 40)}...</div>
                          <div className="text-[10px] text-[var(--starlight-muted)]">{h.wordCount} words</div>
                        </div>
                        <span className="font-mono text-xs text-[var(--gold)]">{h.overallScore}%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

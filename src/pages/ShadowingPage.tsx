import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import Navigation from "@/components/layout/Navigation";
import {
  Headphones, Mic, MicOff, Play, Square, RotateCcw,
  Volume2, SkipForward, SkipBack, Clock, BarChart3,
  CheckCircle, Star,
} from "lucide-react";

export default function ShadowingPage() {
  const [selectedSession, setSelectedSession] = useState<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<any>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const { data: sessions, isLoading } = trpc.shadowing.list.useQuery({});

  const recordProgress = trpc.shadowing.recordProgress.useMutation();

  useEffect(() => {
    document.title = "Shadowing Practice | EnglishNow";
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const currentSession = sessions?.[selectedSession];

  const speakTranscript = () => {
    if (currentSession && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentSession.transcript);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      if (final) setTranscript((prev) => prev + " " + final);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setTranscript("");
    setResult(null);
    setRecordingTime(0);

    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (transcript.trim() && currentSession) {
      // Compare transcript
      const expectedWords = currentSession.transcript.toLowerCase().split(/\s+/).filter((w: string) => w.length > 0);
      const spokenWords = transcript.toLowerCase().trim().split(/\s+/).filter((w: string) => w.length > 0);

      let matched = 0;
      const map = new Map<string, number>();
      for (const w of expectedWords) { map.set(w, (map.get(w) ?? 0) + 1); }
      for (const w of spokenWords) {
        const c = map.get(w) ?? 0;
        if (c > 0) { matched++; map.set(w, c - 1); }
      }
      const accuracy = expectedWords.length > 0 ? Math.round((matched / expectedWords.length) * 100) : 0;

      setResult({ accuracy, matched, total: expectedWords.length });
      recordProgress.mutate({ sessionId: currentSession.id, accuracy });
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-4xl text-[var(--starlight)] mb-2">Shadowing Practice</h1>
            <p className="text-[var(--starlight-dim)]">Listen to native audio, repeat what you hear, and get accuracy feedback.</p>
          </motion.div>

          {/* Session Selector */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <div className="flex flex-wrap gap-2">
              {(sessions ?? []).map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSession(i); setTranscript(""); setResult(null); }}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    selectedSession === i ? "bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/30" : "glass-panel text-[var(--starlight-dim)] hover:text-[var(--starlight)]"
                  }`}
                >
                  {s.cefrLevel} - {s.category}
                </button>
              ))}
            </div>
          </motion.div>

          {currentSession ? (
            <>
              {/* Transcript Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-[var(--gold)]" />
                    <span className="text-sm font-medium text-[var(--starlight)]">{currentSession.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--starlight-muted)] font-mono">{currentSession.cefrLevel}</span>
                    <button onClick={speakTranscript} className="p-2 rounded-lg glass-panel text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-colors">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-[var(--midnight-card)] rounded-xl p-4 mb-4">
                  <p className="text-sm text-[var(--starlight)] leading-relaxed">{currentSession.transcript}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--starlight-muted)]">
                  <Clock className="w-3 h-3" />
                  {currentSession.duration}s &middot; {currentSession.transcript.split(/\s+/).length} words
                </div>
              </motion.div>

              {/* Recording Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-8">
                {isRecording ? (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-full bg-[var(--accent-coral)]/20 flex items-center justify-center animate-pulse">
                        <Mic className="w-8 h-8 text-[var(--accent-coral)]" />
                      </div>
                    </div>
                    <div className="font-mono text-lg text-[var(--accent-coral)] mb-2">{formatTime(recordingTime)}</div>
                    <button onClick={stopRecording} className="px-6 py-3 rounded-full bg-[var(--accent-coral)]/10 text-[var(--accent-coral)] font-medium hover:bg-[var(--accent-coral)]/20 transition-colors flex items-center gap-2">
                      <Square className="w-4 h-4" />
                      Stop & Compare
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <button
                      onClick={startRecording}
                      className="w-20 h-20 rounded-full bg-[var(--gold)]/20 flex items-center justify-center mb-4 hover:bg-[var(--gold)]/30 transition-colors"
                      style={{ animation: "pulse-gold 2s infinite" }}
                    >
                      <Mic className="w-8 h-8 text-[var(--gold)]" />
                    </button>
                    <p className="text-sm text-[var(--starlight-dim)]">Listen to the audio, then tap to record yourself</p>
                  </div>
                )}
              </motion.div>

              {/* Your Recording */}
              {transcript && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-6 mb-6">
                  <h3 className="text-sm font-medium text-[var(--starlight-muted)] mb-3">Your Recording</h3>
                  <p className="text-sm text-[var(--starlight)]">{transcript}</p>
                </motion.div>
              )}

              {/* Result */}
              {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[var(--starlight)]">Accuracy Score</h3>
                    <div className="font-mono text-3xl text-[var(--gold)]">{result.accuracy}%</div>
                  </div>
                  <div className="flex items-center justify-center gap-8 mb-6">
                    <div className="text-center">
                      <div className="font-mono text-2xl text-[var(--accent-cyan)]">{result.matched}</div>
                      <div className="text-[10px] text-[var(--starlight-muted)]">Words Matched</div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-center">
                      <div className="font-mono text-2xl text-[var(--starlight)]">{result.total}</div>
                      <div className="text-[10px] text-[var(--starlight-muted)]">Total Words</div>
                    </div>
                  </div>
                  {result.accuracy >= 60 && (
                    <div className="flex items-center gap-2 justify-center text-[var(--accent-cyan)] text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Great job! Keep practicing to improve further.
                    </div>
                  )}
                  <div className="flex justify-center mt-6">
                    <button onClick={() => { setTranscript(""); setResult(null); }} className="ghost-btn flex items-center gap-2 text-sm">
                      <RotateCcw className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => { setSelectedSession((s) => Math.max(0, s - 1)); setTranscript(""); setResult(null); }}
                  disabled={selectedSession === 0}
                  className="flex items-center gap-2 text-sm text-[var(--starlight-dim)] hover:text-[var(--starlight)] disabled:opacity-30 transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => { setSelectedSession((s) => Math.min((sessions?.length ?? 1) - 1, s + 1)); setTranscript(""); setResult(null); }}
                  disabled={selectedSession >= (sessions?.length ?? 1) - 1}
                  className="flex items-center gap-2 text-sm text-[var(--starlight-dim)] hover:text-[var(--starlight)] disabled:opacity-30 transition-colors"
                >
                  Next
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Headphones className="w-12 h-12 text-[var(--starlight-muted)] mx-auto mb-4" />
              <p className="text-[var(--starlight-dim)]">No shadowing sessions available.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

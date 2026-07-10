import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import Navigation from "@/components/layout/Navigation";
import {
  Mic, MicOff, Play, Square, RefreshCw, MessageSquare,
  Volume2, Star, Clock, BarChart3, Lightbulb,
} from "lucide-react";

const conversationPrompts = [
  { level: "A1", topic: "Introductions", prompt: "Greet the AI and introduce yourself. Tell me your name, where you're from, and what you like to do." },
  { level: "A2", topic: "Daily Routine", prompt: "Describe your typical day. What time do you wake up? What do you do for work or study?" },
  { level: "B1", topic: "Travel", prompt: "Tell me about a trip you took or would like to take. Where did you go? What did you do?" },
  { level: "B2", topic: "Technology", prompt: "Discuss how technology has changed the way we communicate. What are the pros and cons?" },
  { level: "C1", topic: "Culture", prompt: "Compare cultural differences between your country and an English-speaking country you've learned about." },
  { level: "C2", topic: "Philosophy", prompt: "Debate whether artificial intelligence will ultimately benefit or harm humanity. Present your arguments." },
];

const pronunciationPrompts = [
  "The quick brown fox jumps over the lazy dog.",
  "She sells seashells by the seashore.",
  "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
  "Peter Piper picked a peck of pickled peppers.",
];

export default function SpeakingPage() {
  const [mode, setMode] = useState<"conversation" | "pronunciation">("conversation");
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<any>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const submitSpeaking = trpc.speaking.submit.useMutation({
    onSuccess: (data) => setResult(data),
  });

  useEffect(() => {
    document.title = "Speaking Practice | EnglishNow";
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser. Try Chrome.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript((prev) => prev + " " + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) recognition.start();
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setTranscript("");
    setResult(null);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Submit for feedback
    const expectedText = mode === "pronunciation" ? pronunciationPrompts[selectedPrompt] : undefined;
    if (transcript.trim()) {
      submitSpeaking.mutate({
        prompt: mode === "conversation" ? conversationPrompts[selectedPrompt].prompt : pronunciationPrompts[selectedPrompt],
        transcript: transcript.trim(),
        expectedText,
        duration: recordingTime,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const speakPrompt = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-4xl text-[var(--starlight)] mb-2">Speaking Practice</h1>
            <p className="text-[var(--starlight-dim)]">Practice conversations and pronunciation with AI feedback.</p>
          </motion.div>

          {/* Mode Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-8">
            {(["conversation", "pronunciation"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setTranscript(""); setResult(null); setIsListening(false); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                  mode === m ? "bg-[var(--gold)] text-[var(--midnight)]" : "glass-panel text-[var(--starlight-dim)] hover:text-[var(--starlight)]"
                }`}
              >
                {m}
              </button>
            ))}
          </motion.div>

          {/* Prompt Selector */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
            <div className="flex flex-wrap gap-2">
              {mode === "conversation"
                ? conversationPrompts.map((cp, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedPrompt(i); setTranscript(""); setResult(null); }}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        selectedPrompt === i ? "bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/30" : "glass-panel text-[var(--starlight-dim)] hover:text-[var(--starlight)]"
                      }`}
                    >
                      {cp.level} - {cp.topic}
                    </button>
                  ))
                : pronunciationPrompts.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedPrompt(i); setTranscript(""); setResult(null); }}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        selectedPrompt === i ? "bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/30" : "glass-panel text-[var(--starlight-dim)] hover:text-[var(--starlight)]"
                      }`}
                    >
                      Tongue Twister {i + 1}
                    </button>
                  ))}
            </div>
          </motion.div>

          {/* Prompt Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-xs text-[var(--gold)] font-mono">
                  {mode === "conversation" ? conversationPrompts[selectedPrompt].level : "Pronunciation"}
                </span>
              </div>
              <button
                onClick={() => speakPrompt(mode === "conversation" ? conversationPrompts[selectedPrompt].prompt : pronunciationPrompts[selectedPrompt])}
                className="p-2 rounded-lg glass-panel text-[var(--starlight-muted)] hover:text-[var(--gold)] transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[var(--starlight)]">
              {mode === "conversation" ? conversationPrompts[selectedPrompt].prompt : `Read aloud: "${pronunciationPrompts[selectedPrompt]}"`}
            </p>
          </motion.div>

          {/* Recording Controls */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-center mb-8">
            {isListening ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-[var(--accent-coral)]/20 flex items-center justify-center animate-pulse">
                    <Mic className="w-8 h-8 text-[var(--accent-coral)]" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--accent-coral)] animate-ping opacity-30" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[var(--accent-coral)]" />
                  <span className="font-mono text-lg text-[var(--accent-coral)]">{formatTime(recordingTime)}</span>
                </div>
                <p className="text-sm text-[var(--starlight-dim)] mb-4">Listening... Speak now</p>
                <button onClick={stopRecording} className="px-6 py-3 rounded-full bg-[var(--accent-coral)]/10 text-[var(--accent-coral)] font-medium hover:bg-[var(--accent-coral)]/20 transition-colors flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  Stop Recording
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <button
                  onClick={startRecording}
                  className="w-20 h-20 rounded-full bg-[var(--gold)]/20 flex items-center justify-center mb-4 hover:bg-[var(--gold)]/30 transition-colors"
                  style={{ animation: transcript ? "none" : "pulse-gold 2s infinite" }}
                >
                  <Mic className="w-8 h-8 text-[var(--gold)]" />
                </button>
                <p className="text-sm text-[var(--starlight-dim)]">Tap to start speaking</p>
              </div>
            )}
          </motion.div>

          {/* Transcript */}
          {transcript && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-medium text-[var(--starlight-muted)] mb-3">Your Transcript</h3>
              <p className="text-sm text-[var(--starlight)] leading-relaxed">{transcript}</p>
            </motion.div>
          )}

          {/* Results */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[var(--starlight)]">Speaking Analysis</h3>
                <div className="font-mono text-2xl text-[var(--gold)]">{result.scores.overall}%</div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-[var(--midnight-card)] rounded-xl">
                  <div className="font-mono text-xl text-[var(--accent-cyan)]">{result.scores.accuracy}%</div>
                  <div className="text-[10px] text-[var(--starlight-muted)]">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-[var(--midnight-card)] rounded-xl">
                  <div className="font-mono text-xl text-[var(--gold)]">{result.scores.fluency}%</div>
                  <div className="text-[10px] text-[var(--starlight-muted)]">Fluency</div>
                </div>
                <div className="text-center p-4 bg-[var(--midnight-card)] rounded-xl">
                  <div className="font-mono text-xl text-[var(--accent-sky)]">{result.scores.pronunciation}%</div>
                  <div className="text-[10px] text-[var(--starlight-muted)]">Pronunciation</div>
                </div>
              </div>

              {result.feedback && (
                <div className="bg-[var(--midnight-card)] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-[var(--gold)]" />
                    <span className="text-sm font-medium text-[var(--gold)]">Feedback</span>
                  </div>
                  <p className="text-xs text-[var(--starlight-dim)]">{result.feedback}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

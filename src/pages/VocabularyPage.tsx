import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import Navigation from "@/components/layout/Navigation";
import {
  BookOpen, Search, Star, RotateCcw, Volume2,
  ChevronRight, ChevronLeft, Sparkles, Heart,
  Shuffle, Filter,
} from "lucide-react";

type Mode = "browse" | "flashcard" | "review";

export default function VocabularyPage() {
  const [mode, setMode] = useState<Mode>("browse");
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const { data: vocabList, isLoading } = trpc.vocabulary.list.useQuery({
    cefrLevel: selectedLevel as any,
    search: search || undefined,
    limit: 50,
  });

  const { data: reviewWords } = trpc.vocabulary.getReviewWords.useQuery(undefined, {
    enabled: mode === "review",
  });

  const { data: userVocab } = trpc.vocabulary.getUserVocabulary.useQuery(
    favoritesOnly ? { isFavorite: true } : undefined,
    { enabled: mode === "browse" }
  );

  const toggleFavorite = trpc.vocabulary.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.vocabulary.getUserVocabulary.invalidate();
    },
  });

  const updateFamiliarity = trpc.vocabulary.updateFamiliarity.useMutation({
    onSuccess: () => {
      utils.vocabulary.getUserVocabulary.invalidate();
      utils.vocabulary.getReviewWords.invalidate();
    },
  });

  const utils = trpc.useUtils();

  useEffect(() => {
    document.title = "Vocabulary | EnglishNow";
  }, []);

  const currentList = mode === "review" ? (reviewWords?.map((r) => r.vocab) ?? []) : (vocabList ?? []);
  const currentWord = currentList[flashcardIndex];

  const handleNextCard = () => {
    setShowDefinition(false);
    setFlashcardIndex((i) => (i + 1) % currentList.length);
  };

  const handlePrevCard = () => {
    setShowDefinition(false);
    setFlashcardIndex((i) => (i - 1 + currentList.length) % currentList.length);
  };

  const handleSRSRating = (known: boolean) => {
    if (currentWord) {
      updateFamiliarity.mutate({
        vocabularyId: currentWord.id,
        familiarity: known ? "mastered" : "learning",
        correct: known,
      });
    }
    handleNextCard();
  };

  const speakWord = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-4xl text-[var(--starlight)] mb-2">Vocabulary Builder</h1>
            <p className="text-[var(--starlight-dim)]">Learn words with flashcards, audio pronunciation, and spaced repetition.</p>
          </motion.div>

          {/* Mode Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-8">
            {(["browse", "flashcard", "review"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setFlashcardIndex(0); setShowDefinition(false); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                  mode === m ? "bg-[var(--gold)] text-[var(--midnight)]" : "glass-panel text-[var(--starlight-dim)] hover:text-[var(--starlight)]"
                }`}
              >
                {m === "review" && reviewWords && reviewWords.length > 0 && (
                  <span className="mr-1.5 text-[10px] bg-[var(--accent-coral)] text-white rounded-full px-1.5 py-0.5">
                    {reviewWords.length}
                  </span>
                )}
                {m}
              </button>
            ))}
          </motion.div>

          {mode === "browse" && (
            <>
              {/* Search & Filters */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--starlight-muted)]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search words..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl glass-panel text-[var(--starlight)] placeholder:text-[var(--starlight-muted)] focus:outline-none focus:border-[var(--gold)]/30 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(selectedLevel === level ? "" : level)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-medium transition-colors ${
                        selectedLevel === level ? "bg-[var(--gold)] text-[var(--midnight)]" : "glass-panel text-[var(--starlight-dim)] hover:text-[var(--starlight)]"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
                    favoritesOnly ? "bg-[var(--accent-coral)]/20 text-[var(--accent-coral)]" : "glass-panel text-[var(--starlight-dim)]"
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  Favorites
                </button>
              </motion.div>

              {/* Word Grid */}
              {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="glass-panel rounded-xl p-5 animate-pulse">
                      <div className="h-4 bg-[var(--midnight-card)] rounded w-1/2 mb-2" />
                      <div className="h-3 bg-[var(--midnight-card)] rounded w-full mb-1" />
                      <div className="h-3 bg-[var(--midnight-card)] rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(vocabList ?? []).map((word, i) => (
                    <motion.div
                      key={word.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="glass-panel rounded-xl p-5 card-hover group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-[var(--starlight)] group-hover:text-[var(--gold)] transition-colors">
                              {word.word}
                            </h3>
                            <button
                              onClick={() => speakWord(word.word)}
                              className="text-[var(--starlight-muted)] hover:text-[var(--gold)] transition-colors"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[var(--starlight-muted)] font-mono">{word.phonetic}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--gold)]/10 text-[var(--gold)]">{word.cefrLevel}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFavorite.mutate({ vocabularyId: word.id })}
                          className="text-[var(--starlight-muted)] hover:text-[var(--accent-coral)] transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[var(--starlight)] mb-2">{word.definition}</p>
                      {word.exampleSentence && (
                        <p className="text-[11px] text-[var(--starlight-muted)] italic">
                          &ldquo;{word.exampleSentence}&rdquo;
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {word.synonyms?.split(",").map((s) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--midnight-card)] text-[var(--starlight-muted)]">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {(mode === "flashcard" || mode === "review") && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
              {currentWord ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs text-[var(--starlight-muted)]">
                      Card {flashcardIndex + 1} of {currentList.length}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setFlashcardIndex(Math.floor(Math.random() * currentList.length))} className="p-2 rounded-lg glass-panel text-[var(--starlight-muted)] hover:text-[var(--gold)]">
                        <Shuffle className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setFlashcardIndex(0); setShowDefinition(false); }} className="p-2 rounded-lg glass-panel text-[var(--starlight-muted)] hover:text-[var(--gold)]">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Flashcard */}
                  <div
                    onClick={() => setShowDefinition(!showDefinition)}
                    className="glass-panel rounded-2xl p-10 text-center cursor-pointer card-hover min-h-[320px] flex flex-col items-center justify-center border border-white/10"
                  >
                    <AnimatePresence mode="wait">
                      {!showDefinition ? (
                        <motion.div
                          key="word"
                          initial={{ opacity: 0, rotateY: 90 }}
                          animate={{ opacity: 1, rotateY: 0 }}
                          exit={{ opacity: 0, rotateY: -90 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h2 className="font-display text-4xl text-[var(--starlight)] mb-3">{currentWord.word}</h2>
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="text-sm text-[var(--starlight-muted)] font-mono">{currentWord.phonetic}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); speakWord(currentWord.word); }}
                              className="text-[var(--starlight-muted)] hover:text-[var(--gold)]"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
                            {currentWord.cefrLevel} &middot; {currentWord.partOfSpeech}
                          </span>
                          <p className="text-xs text-[var(--starlight-muted)] mt-6">Tap to reveal definition</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="def"
                          initial={{ opacity: 0, rotateY: 90 }}
                          animate={{ opacity: 1, rotateY: 0 }}
                          exit={{ opacity: 0, rotateY: -90 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="text-lg text-[var(--starlight)] mb-4">{currentWord.definition}</p>
                          {currentWord.exampleSentence && (
                            <p className="text-sm text-[var(--starlight-dim)] italic mb-4">
                              &ldquo;{currentWord.exampleSentence}&rdquo;
                            </p>
                          )}
                          {currentWord.synonyms && (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {currentWord.synonyms.split(",").map((s) => (
                                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gold)]/10 text-[var(--gold)]">
                                  {s.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between mt-6">
                    <button onClick={handlePrevCard} className="p-3 rounded-xl glass-panel text-[var(--starlight)] hover:text-[var(--gold)]">
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {mode === "review" ? (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSRSRating(false)}
                          className="px-5 py-2.5 rounded-full bg-[var(--accent-coral)]/10 text-[var(--accent-coral)] text-sm font-medium hover:bg-[var(--accent-coral)]/20 transition-colors"
                        >
                          Still Learning
                        </button>
                        <button
                          onClick={() => handleSRSRating(true)}
                          className="px-5 py-2.5 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-sm font-medium hover:bg-[var(--accent-cyan)]/20 transition-colors"
                        >
                          Got It!
                        </button>
                      </div>
                    ) : (
                      <button onClick={handleNextCard} className="gold-btn text-sm">
                        Next Card
                      </button>
                    )}

                    <button onClick={handleNextCard} className="p-3 rounded-xl glass-panel text-[var(--starlight)] hover:text-[var(--gold)]">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-12 h-12 text-[var(--starlight-muted)] mx-auto mb-4" />
                  <p className="text-[var(--starlight-dim)]">
                    {mode === "review" ? "No words to review right now." : "No words found."}
                  </p>
                  {mode === "review" && (
                    <button onClick={() => setMode("browse")} className="text-[var(--gold)] text-sm mt-2 hover:underline">
                      Browse vocabulary
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

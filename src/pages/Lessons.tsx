import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import Navigation from "@/components/layout/Navigation";
import {
  BookOpen, Search, Clock, Filter, GraduationCap,
   X,
} from "lucide-react";

const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const categories = ["grammar", "vocabulary", "conversation", "listening", "reading", "writing", "speaking"] as const;

export default function Lessons() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: lessons, isLoading } = trpc.lessons.list.useQuery({
    cefrLevel: selectedLevel as any,
    category: selectedCategory as any,
  });

  const filteredLessons = (lessons ?? []).filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.description?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    document.title = "Lessons | EnglishNow";
  }, []);

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-4xl text-[var(--starlight)] mb-2">Lessons</h1>
            <p className="text-[var(--starlight-dim)]">Browse and learn from our comprehensive lesson library.</p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--starlight-muted)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search lessons..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-panel text-[var(--starlight)] placeholder:text-[var(--starlight-muted)] focus:outline-none focus:border-[var(--gold)]/30 text-sm"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-[var(--starlight-muted)]" />
                  </button>
                )}
              </div>
            </div>

            {/* Level Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Filter className="w-4 h-4 text-[var(--starlight-muted)] mr-1 self-center" />
              <button
                onClick={() => setSelectedLevel("")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !selectedLevel ? "bg-[var(--gold)] text-[var(--midnight)]" : "glass-panel text-[var(--starlight-dim)] hover:text-[var(--starlight)]"
                }`}
              >
                All Levels
              </button>
              {cefrLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(selectedLevel === level ? "" : level)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedLevel === level ? "bg-[var(--gold)] text-[var(--midnight)]" : "glass-panel text-[var(--starlight-dim)] hover:text-[var(--starlight)]"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mt-3">
              <BookOpen className="w-4 h-4 text-[var(--starlight-muted)] mr-1 self-center" />
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                  !selectedCategory ? "bg-[var(--gold)] text-[var(--midnight)]" : "glass-panel text-[var(--starlight-dim)] hover:text-[var(--starlight)]"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                    selectedCategory === cat ? "bg-[var(--gold)] text-[var(--midnight)]" : "glass-panel text-[var(--starlight-dim)] hover:text-[var(--starlight)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Lessons Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-panel rounded-xl p-6 animate-pulse">
                  <div className="h-32 bg-[var(--midnight-card)] rounded-lg mb-4" />
                  <div className="h-4 bg-[var(--midnight-card)] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[var(--midnight-card)] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLessons.map((lesson, i) => (
                <motion.button
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                  className="glass-panel rounded-xl p-5 text-left card-hover group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center group-hover:bg-[var(--gold)]/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-[var(--gold)]" />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] font-mono">
                      {lesson.cefrLevel}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--starlight)] mb-1 group-hover:text-[var(--gold)] transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-[var(--starlight-dim)] mb-3 line-clamp-2">
                    {lesson.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-[var(--starlight-muted)]">
                    <span className="capitalize">{lesson.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lesson.duration} min
                    </span>
                    <span className="flex items-center gap-1 text-[var(--gold)]">
                      <GraduationCap className="w-3 h-3" />
                      +{lesson.xpReward} XP
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {!isLoading && filteredLessons.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-[var(--starlight-muted)] mx-auto mb-4" />
              <p className="text-[var(--starlight-dim)]">No lessons found matching your criteria.</p>
              <button
                onClick={() => { setSearch(""); setSelectedLevel(""); setSelectedCategory(""); }}
                className="text-[var(--gold)] text-sm mt-2 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import {
  Flame,
  TrendingUp,
  BookOpen,
  Clock,
  Award,
  Target,
  ArrowRight,
  Star,
  Zap,
  Calendar,
  BarChart3,
  GraduationCap,
  
  PenTool,
  Headphones,
  Mic,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color = "gold" }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    gold: "text-[var(--gold)] bg-[var(--gold)]/10",
    coral: "text-[var(--accent-coral)] bg-[var(--accent-coral)]/10",
    cyan: "text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10",
    sky: "text-[var(--accent-sky)] bg-[var(--accent-sky)]/10",
  };

  return (
    <div className="glass-panel rounded-2xl p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {sub && <span className="text-xs text-[var(--starlight-muted)]">{sub}</span>}
      </div>
      <div className="font-mono text-3xl font-bold text-[var(--starlight)] mb-1">{value}</div>
      <div className="text-sm text-[var(--starlight-dim)]">{label}</div>
    </div>
  );
}

function SkillBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-[var(--gold)] flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[var(--starlight-dim)]">{label}</span>
          <span className="text-xs font-mono text-[var(--gold)]">{value}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--midnight-card)] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)]"
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ icon: Icon, label, path, desc }: { icon: React.ElementType; label: string; path: string; desc: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="glass-panel rounded-xl p-4 text-left card-hover group w-full"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--gold)]/20 transition-colors">
          <Icon className="w-5 h-5 text-[var(--gold)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--starlight)] group-hover:text-[var(--gold)] transition-colors">
              {label}
            </span>
            <ArrowRight className="w-4 h-4 text-[var(--starlight-muted)] group-hover:text-[var(--gold)] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-[var(--starlight-dim)] mt-1">{desc}</p>
        </div>
      </div>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const { data: stats } = trpc.progress.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: skillBreakdown } = trpc.progress.getSkillBreakdown.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: challenges } = trpc.challenges.getDaily.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: lessonList } = trpc.lessons.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    document.title = "Dashboard | EnglishNow";
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--midnight)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const profile = stats?.profile;
  const cefrLevel = profile?.cefrLevel ?? "A1";
  const totalXp = profile?.totalXp ?? 0;
  const streak = profile?.currentStreak ?? 0;
  const lessonsCompleted = stats?.lessonsCompleted ?? 0;

  // Generate calendar days
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="font-display text-4xl text-[var(--starlight)] mb-2">
              Welcome back, {user?.name?.split(" ")[0] || "Learner"}!
            </h1>
            <p className="text-[var(--starlight-dim)]">
              Keep up the momentum. You&apos;re making great progress!
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <StatCard
                icon={GraduationCap}
                label="Current Level"
                value={cefrLevel}
                sub="Intermediate"
                color="gold"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <StatCard
                icon={Flame}
                label="Day Streak"
                value={`${streak} days`}
                color="coral"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <StatCard
                icon={TrendingUp}
                label="XP This Week"
                value={`${stats?.weeklyXp ?? 0} XP`}
                color="cyan"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <StatCard
                icon={BookOpen}
                label="Lessons Done"
                value={`${lessonsCompleted}`}
                color="sky"
              />
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skill Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[var(--starlight)]">Skill Breakdown</h2>
                  <BarChart3 className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <div className="space-y-4">
                  <SkillBar label="Reading" value={skillBreakdown?.reading ?? 0} icon={BookOpen} />
                  <SkillBar label="Writing" value={skillBreakdown?.writing ?? 0} icon={PenTool} />
                  <SkillBar label="Listening" value={skillBreakdown?.listening ?? 0} icon={Headphones} />
                  <SkillBar label="Speaking" value={skillBreakdown?.speaking ?? 0} icon={Mic} />
                  <SkillBar label="Vocabulary" value={skillBreakdown?.vocabulary ?? 0} icon={Zap} />
                  <SkillBar label="Grammar" value={skillBreakdown?.grammar ?? 0} icon={Target} />
                </div>
              </motion.div>

              {/* Continue Learning */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-panel rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[var(--starlight)]">Continue Learning</h2>
                  <button
                    onClick={() => navigate("/lessons")}
                    className="text-xs text-[var(--gold)] hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-3">
                  {(lessonList ?? []).slice(0, 3).map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => navigate(`/lessons/${lesson.id}`)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--midnight-card)] hover:bg-[var(--midnight-light)] transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold-light)]/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-[var(--gold)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--starlight)] truncate">
                            {lesson.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] flex-shrink-0">
                            {lesson.cefrLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-[var(--starlight-muted)]">{lesson.category}</span>
                          <span className="text-xs text-[var(--starlight-muted)]">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {lesson.duration} min
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--starlight-muted)] flex-shrink-0" />
                    </button>
                  ))}
                  {(!lessonList || lessonList.length === 0) && (
                    <div className="text-center py-8 text-[var(--starlight-dim)] text-sm">
                      No lessons started yet.{" "}
                      <button onClick={() => navigate("/lessons")} className="text-[var(--gold)] hover:underline">
                        Start learning
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Learning Calendar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[var(--starlight)]">
                    {today.toLocaleString("default", { month: "long", year: "numeric" })}
                  </h2>
                  <Calendar className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="text-center text-[10px] text-[var(--starlight-muted)] py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === today.getDate();
                    const isCompleted = day < today.getDate() && Math.random() > 0.3;
                    return (
                      <div
                        key={day}
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                          isToday
                            ? "bg-[var(--gold)] text-[var(--midnight)]"
                            : isCompleted
                            ? "bg-[var(--gold)]/20 text-[var(--gold)]"
                            : "bg-[var(--midnight-card)] text-[var(--starlight-dim)]"
                        }`}
                      >
                        {isCompleted ? <CheckMini /> : day}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Daily Challenges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-panel rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold text-[var(--starlight)] mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[var(--gold)]" />
                  Daily Challenges
                </h2>
                <div className="space-y-3">
                  {(challenges ?? []).map((challenge) => (
                    <div key={challenge.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--midnight-card)]">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        challenge.completed ? "bg-[var(--accent-cyan)]/20" : "bg-[var(--gold)]/10"
                      }`}>
                        {challenge.completed ? (
                          <Star className="w-4 h-4 text-[var(--accent-cyan)]" />
                        ) : (
                          <Zap className="w-4 h-4 text-[var(--gold)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[var(--starlight)] truncate">{challenge.title}</div>
                        <div className="text-[10px] text-[var(--starlight-muted)]">
                          {challenge.progress ?? 0} / {challenge.requirement} &middot; +{challenge.xpReward} XP
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!challenges || challenges.length === 0) && (
                    <div className="text-center py-4 text-[var(--starlight-dim)] text-sm">
                      No challenges today
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-sm font-medium text-[var(--starlight-muted)] uppercase tracking-wide mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <QuickLink icon={Mic} label="Speaking Practice" path="/speaking" desc="AI conversation" />
                  <QuickLink icon={PenTool} label="Writing Exercise" path="/writing" desc="Grammar feedback" />
                  <QuickLink icon={Zap} label="Vocabulary" path="/vocabulary" desc="SRS flashcards" />
                  <QuickLink icon={Target} label="Grammar" path="/grammar" desc="Interactive lessons" />
                  <QuickLink icon={Headphones} label="Shadowing" path="/shadowing" desc="Pronunciation" />
                  <QuickLink icon={Award} label="Mock Exams" path="/mock-exams" desc="Test practice" />
                </div>
              </motion.div>

              {/* XP to Next Level */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="glass-panel rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[var(--starlight-dim)]">Total XP</span>
                  <span className="font-mono text-xl font-bold text-[var(--gold)]">{totalXp}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--midnight-card)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)]"
                    style={{ width: `${Math.min((totalXp % 500) / 5, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--starlight-muted)] mt-2">
                  {500 - (totalXp % 500)} XP to next milestone
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CheckMini() {
  return (
    <svg className="w-3 h-3 text-[var(--gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

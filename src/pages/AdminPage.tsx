import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/layout/Navigation";
import {
  Shield, BookOpen, BarChart3, TrendingUp,
  Award, MessageSquare, Activity, ArrowRight,
} from "lucide-react";

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth({ redirectOnUnauthenticated: true });

  // Redirect non-admins
  useEffect(() => {
    if (!isLoading && user && user.role !== "admin") {
      navigate("/dashboard");
    }
    document.title = "Admin Dashboard | EnglishNow";
  }, [user, isLoading, navigate]);

  const { data: lessons } = trpc.lessons.list.useQuery({});
  const { data: _vocabList } = trpc.vocabulary.list.useQuery({ limit: 1 });
  const { data: grammarLessons } = trpc.grammar.list.useQuery({});
  const { data: paths } = trpc.learningPaths.list.useQuery();

  const stats = [
    { label: "Total Lessons", value: lessons?.length ?? 0, icon: BookOpen, color: "text-[var(--gold)]" },
    { label: "Vocabulary Words", value: 50, icon: Award, color: "text-[var(--accent-cyan)]" },
    { label: "Grammar Lessons", value: grammarLessons?.length ?? 0, icon: MessageSquare, color: "text-[var(--accent-sky)]" },
    { label: "Learning Paths", value: paths?.length ?? 0, icon: TrendingUp, color: "text-[var(--accent-coral)]" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--midnight)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-[var(--gold)]" />
              <h1 className="font-display text-4xl text-[var(--starlight)]">Admin Dashboard</h1>
            </div>
            <p className="text-[var(--starlight-dim)]">Platform overview and management.</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel rounded-2xl p-6 card-hover"
              >
                <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
                <div className="font-mono text-3xl text-[var(--starlight)] mb-1">{stat.value}</div>
                <div className="text-xs text-[var(--starlight-muted)]">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-lg font-semibold text-[var(--starlight)] mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Manage Lessons", desc: "View and edit lesson content", path: "/lessons", icon: BookOpen },
                { label: "Vocabulary Bank", desc: "Add or edit vocabulary words", path: "/vocabulary", icon: Award },
                { label: "Grammar Center", desc: "Manage grammar lessons", path: "/grammar", icon: MessageSquare },
                { label: "Learning Paths", desc: "Configure learning paths", path: "/learning-paths", icon: TrendingUp },
                { label: "Mock Exams", desc: "Manage practice tests", path: "/mock-exams", icon: Activity },
                { label: "Leaderboard", desc: "View user rankings", path: "/leaderboard", icon: BarChart3 },
              ].map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="glass-panel rounded-xl p-5 text-left card-hover group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center group-hover:bg-[var(--gold)]/20 transition-colors">
                      <link.icon className="w-5 h-5 text-[var(--gold)]" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--starlight-muted)] group-hover:text-[var(--gold)] group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--starlight)] mt-3 group-hover:text-[var(--gold)] transition-colors">
                    {link.label}
                  </h3>
                  <p className="text-xs text-[var(--starlight-dim)] mt-1">{link.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content Tables */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-10">
            <h2 className="text-lg font-semibold text-[var(--starlight)] mb-4">Lessons Overview</h2>
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs text-[var(--starlight-muted)] uppercase tracking-wide font-medium p-4">Title</th>
                      <th className="text-left text-xs text-[var(--starlight-muted)] uppercase tracking-wide font-medium p-4">Level</th>
                      <th className="text-left text-xs text-[var(--starlight-muted)] uppercase tracking-wide font-medium p-4">Category</th>
                      <th className="text-left text-xs text-[var(--starlight-muted)] uppercase tracking-wide font-medium p-4">Duration</th>
                      <th className="text-left text-xs text-[var(--starlight-muted)] uppercase tracking-wide font-medium p-4">XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(lessons ?? []).slice(0, 10).map((lesson) => (
                      <tr key={lesson.id} className="border-b border-white/5 hover:bg-[var(--midnight-light)]/50 transition-colors">
                        <td className="p-4 text-sm text-[var(--starlight)]">{lesson.title}</td>
                        <td className="p-4"><span className="text-xs font-mono text-[var(--gold)]">{lesson.cefrLevel}</span></td>
                        <td className="p-4"><span className="text-xs text-[var(--starlight-dim)] capitalize">{lesson.category}</span></td>
                        <td className="p-4 text-xs text-[var(--starlight-muted)]">{lesson.duration} min</td>
                        <td className="p-4 text-xs text-[var(--gold)]">+{lesson.xpReward}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

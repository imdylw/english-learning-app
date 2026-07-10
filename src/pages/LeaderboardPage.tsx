import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import Navigation from "@/components/layout/Navigation";
import {
  Trophy, 
  Medal, Crown, 
} from "lucide-react";

type Period = "weekly" | "monthly" | "alltime";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("weekly");

  const { data: weekly, isLoading: wLoading } = trpc.leaderboard.getWeekly.useQuery({ limit: 20 });
  const { data: monthly } = trpc.leaderboard.getMonthly.useQuery({ limit: 20 });
  const { data: alltime } = trpc.leaderboard.getAllTime.useQuery({ limit: 20 });

  useEffect(() => {
    document.title = "Leaderboard | EnglishNow";
  }, []);

  const data = period === "weekly" ? weekly : period === "monthly" ? monthly : alltime;
  const isLoading = period === "weekly" ? wLoading : false;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-[var(--gold)]" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-[var(--starlight)]" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-[#cd7f32]" />;
    return <span className="font-mono text-sm text-[var(--starlight-muted)] w-5 text-center">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-[var(--gold)]/5 border-[var(--gold)]/20";
    if (rank === 2) return "bg-[var(--starlight)]/5 border-white/10";
    if (rank === 3) return "bg-[#cd7f32]/5 border-[#cd7f32]/20";
    return "bg-transparent border-transparent";
  };

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <Trophy className="w-10 h-10 text-[var(--gold)] mx-auto mb-3" />
            <h1 className="font-display text-4xl text-[var(--starlight)] mb-2">Leaderboard</h1>
            <p className="text-[var(--starlight-dim)]">See how you rank against other learners.</p>
          </motion.div>

          {/* Period Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-center gap-2 mb-8">
            {(["weekly", "monthly", "alltime"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                  period === p ? "bg-[var(--gold)] text-[var(--midnight)]" : "glass-panel text-[var(--starlight-dim)] hover:text-[var(--starlight)]"
                }`}
              >
                {p === "alltime" ? "All Time" : p}
              </button>
            ))}
          </motion.div>

          {/* Top 3 Podium */}
          {data && data.length >= 3 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-end justify-center gap-4 mb-10">
              {/* 2nd */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--starlight)] to-[var(--starlight-dim)] flex items-center justify-center mb-2 text-[var(--midnight)] font-bold text-lg">
                  {data[1]?.user?.name?.[0] || "2"}
                </div>
                <div className="text-xs text-[var(--starlight)] text-center truncate max-w-[80px]">{data[1]?.user?.name || "-"}</div>
                <div className="font-mono text-xs text-[var(--gold)] mt-1">{data[1]?.entry?.weeklyXp ?? 0} XP</div>
                <div className="w-20 h-20 glass-panel rounded-t-lg mt-2 flex items-center justify-center border-t border-white/10">
                  <span className="font-mono text-2xl text-[var(--starlight)]">2</span>
                </div>
              </div>
              {/* 1st */}
              <div className="flex flex-col items-center">
                <Crown className="w-6 h-6 text-[var(--gold)] mb-1" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center mb-2 text-[var(--midnight)] font-bold text-xl">
                  {data[0]?.user?.name?.[0] || "1"}
                </div>
                <div className="text-xs text-[var(--starlight)] text-center truncate max-w-[80px] font-medium">{data[0]?.user?.name || "-"}</div>
                <div className="font-mono text-xs text-[var(--gold)] mt-1">{data[0]?.entry?.weeklyXp ?? 0} XP</div>
                <div className="w-24 h-28 glass-panel rounded-t-lg mt-2 flex items-center justify-center border-t border-[var(--gold)]/30 gold-glow">
                  <span className="font-mono text-3xl text-[var(--gold)]">1</span>
                </div>
              </div>
              {/* 3rd */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#cd7f32] to-[#8b4513] flex items-center justify-center mb-2 text-white font-bold text-lg">
                  {data[2]?.user?.name?.[0] || "3"}
                </div>
                <div className="text-xs text-[var(--starlight)] text-center truncate max-w-[80px]">{data[2]?.user?.name || "-"}</div>
                <div className="font-mono text-xs text-[var(--gold)] mt-1">{data[2]?.entry?.weeklyXp ?? 0} XP</div>
                <div className="w-20 h-16 glass-panel rounded-t-lg mt-2 flex items-center justify-center border-t border-white/10">
                  <span className="font-mono text-2xl text-[#cd7f32]">3</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* List */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="glass-panel rounded-xl p-4 animate-pulse h-14" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {(data ?? []).map((entry, i) => (
                <motion.div
                  key={entry.entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${getRankBg(i + 1)}`}
                >
                  <div className="w-8 flex justify-center">{getRankIcon(i + 1)}</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold-light)]/10 flex items-center justify-center text-xs font-bold text-[var(--gold)]">
                    {entry.user?.name?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[var(--starlight)] truncate">{entry.user?.name || "Anonymous"}</div>
                  </div>
                  <div className="font-mono text-sm text-[var(--gold)]">
                    {period === "weekly" ? entry.entry.weeklyXp : period === "monthly" ? entry.entry.monthlyXp : entry.entry.totalXp} XP
                  </div>
                </motion.div>
              ))}
              {(!data || data.length === 0) && (
                <div className="text-center py-12">
                  <Trophy className="w-10 h-10 text-[var(--starlight-muted)] mx-auto mb-3" />
                  <p className="text-[var(--starlight-dim)] text-sm">No entries yet. Be the first!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

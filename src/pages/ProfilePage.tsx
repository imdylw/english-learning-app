import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/layout/Navigation";
import {
  User, Settings, Award, Flame, BookOpen, TrendingUp,
  Star, Clock, Save, LogOut, ChevronRight, Shield,
  Bell, Globe, Moon, Sun, Volume2,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth({ redirectOnUnauthenticated: true });

  const { data: stats } = trpc.progress.getStats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: achievements } = trpc.achievements.getUserAchievements.useQuery(undefined, { enabled: isAuthenticated });
  const { data: userPaths } = trpc.learningPaths.getUserPaths.useQuery(undefined, { enabled: isAuthenticated });

  const updateProfile = trpc.progress.upsertProfile.useMutation();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.title = "Profile | EnglishNow";
    if (stats?.profile) {
      setDisplayName(stats.profile.displayName || "");
      setBio(stats.profile.bio || "");
      setNativeLanguage(stats.profile.nativeLanguage || "");
    }
  }, [stats]);

  const handleSave = () => {
    updateProfile.mutate({ displayName: displayName || undefined, bio: bio || undefined, nativeLanguage: nativeLanguage || undefined }, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--midnight)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const profile = stats?.profile;
  const unlockedCount = achievements?.filter((a) => a.ua.unlocked).length ?? 0;
  const totalAchievements = achievements?.length ?? 0;

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max">
          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="glass-panel rounded-2xl p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center text-[var(--midnight)] text-3xl font-bold border-4 border-[var(--gold)]/30">
                  {user?.name?.[0] || "?"}
                </div>
                <div className="text-center md:text-left">
                  <h1 className="font-display text-3xl text-[var(--starlight)] mb-1">{user?.name || "Learner"}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-[var(--starlight-dim)]">
                    <span className="px-2 py-0.5 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] text-xs font-mono">{profile?.cefrLevel || "A1"}</span>
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[var(--accent-coral)]" />{profile?.currentStreak ?? 0} day streak</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-[var(--gold)]" />{profile?.totalXp ?? 0} XP</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-[var(--accent-sky)]" />{stats?.lessonsCompleted ?? 0} lessons</span>
                  </div>
                </div>
                {user?.role === "admin" && (
                  <button onClick={() => navigate("/admin")} className="ml-auto ghost-btn text-xs flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "overview" ? "text-[var(--gold)] border-[var(--gold)]" : "text-[var(--starlight-muted)] border-transparent hover:text-[var(--starlight)]"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "settings" ? "text-[var(--gold)] border-[var(--gold)]" : "text-[var(--starlight-muted)] border-transparent hover:text-[var(--starlight)]"
              }`}
            >
              Settings
            </button>
          </div>

          {activeTab === "overview" ? (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Achievements */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[var(--starlight)] flex items-center gap-2">
                    <Award className="w-5 h-5 text-[var(--gold)]" />
                    Achievements
                  </h2>
                  <span className="text-xs text-[var(--starlight-muted)]">{unlockedCount}/{totalAchievements}</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {(achievements ?? []).slice(0, 8).map((a) => (
                    <div
                      key={a.achievement.id}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 ${
                        a.ua.unlocked ? "bg-[var(--gold)]/10 border border-[var(--gold)]/20" : "bg-[var(--midnight-card)] opacity-40"
                      }`}
                      title={a.achievement.name}
                    >
                      <Star className={`w-5 h-5 ${a.ua.unlocked ? "text-[var(--gold)]" : "text-[var(--starlight-muted)]"}`} />
                      <span className="text-[8px] text-center mt-1 text-[var(--starlight-dim)] leading-tight">{a.achievement.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Learning Paths */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[var(--starlight)] mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[var(--gold)]" />
                  My Paths
                </h2>
                <div className="space-y-3">
                  {(userPaths ?? []).length === 0 ? (
                    <p className="text-sm text-[var(--starlight-dim)]">No learning paths enrolled yet.</p>
                  ) : (
                    (userPaths ?? []).map((up) => (
                      <div key={up.path.id} className="flex items-center gap-3 p-3 bg-[var(--midnight-card)] rounded-xl">
                        <div className="flex-1">
                          <div className="text-sm text-[var(--starlight)]">{up.path.name}</div>
                          <div className="h-1.5 rounded-full bg-[var(--midnight)] overflow-hidden mt-1">
                            <div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${up.ulp.progress ?? 0}%` }} />
                          </div>
                        </div>
                        <span className="font-mono text-xs text-[var(--gold)]">{up.ulp.progress ?? 0}%</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-2xl p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-[var(--starlight)] mb-4">Learning Statistics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Lessons Completed", value: stats?.lessonsCompleted ?? 0, icon: BookOpen },
                    { label: "Grammar Lessons", value: stats?.grammarCompleted ?? 0, icon: Award },
                    { label: "Current Streak", value: `${profile?.currentStreak ?? 0} days`, icon: Flame },
                    { label: "Total XP", value: profile?.totalXp ?? 0, icon: TrendingUp },
                    { label: "Hours Learned", value: profile?.hoursLearned ?? 0, icon: Clock },
                    { label: "Weekly XP", value: stats?.weeklyXp ?? 0, icon: Star },
                    { label: "Achievements", value: `${unlockedCount}/${totalAchievements}`, icon: Award },
                    { label: "CEFR Level", value: profile?.cefrLevel || "A1", icon: BookOpen },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[var(--midnight-card)] rounded-xl p-4 text-center">
                      <stat.icon className="w-5 h-5 text-[var(--gold)] mx-auto mb-2" />
                      <div className="font-mono text-lg text-[var(--starlight)]">{stat.value}</div>
                      <div className="text-[10px] text-[var(--starlight-muted)]">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            /* Settings Tab */
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
              <div className="glass-panel rounded-2xl p-6 space-y-6">
                <h2 className="text-lg font-semibold text-[var(--starlight)]">Profile Settings</h2>

                <div>
                  <label className="text-xs text-[var(--starlight-muted)] uppercase tracking-wide mb-2 block">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-panel text-[var(--starlight)] placeholder:text-[var(--starlight-muted)] focus:outline-none focus:border-[var(--gold)]/30 text-sm"
                    placeholder="Your display name"
                  />
                </div>

                <div>
                  <label className="text-xs text-[var(--starlight-muted)] uppercase tracking-wide mb-2 block">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-panel text-[var(--starlight)] placeholder:text-[var(--starlight-muted)] focus:outline-none focus:border-[var(--gold)]/30 text-sm h-24 resize-none"
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div>
                  <label className="text-xs text-[var(--starlight-muted)] uppercase tracking-wide mb-2 block">Native Language</label>
                  <input
                    type="text"
                    value={nativeLanguage}
                    onChange={(e) => setNativeLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-panel text-[var(--starlight)] placeholder:text-[var(--starlight-muted)] focus:outline-none focus:border-[var(--gold)]/30 text-sm"
                    placeholder="e.g., Chinese, Spanish, Japanese"
                  />
                </div>

                <div>
                  <label className="text-xs text-[var(--starlight-muted)] uppercase tracking-wide mb-2 block">CEFR Level</label>
                  <select
                    value={profile?.cefrLevel || "A1"}
                    onChange={(e) => updateProfile.mutate({ cefrLevel: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl glass-panel text-[var(--starlight)] focus:outline-none focus:border-[var(--gold)]/30 text-sm bg-transparent"
                  >
                    {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                      <option key={l} value={l} className="bg-[var(--midnight-card)]">{l}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <button onClick={handleSave} className="gold-btn flex items-center gap-2 text-sm">
                    <Save className="w-4 h-4" />
                    {saved ? "Saved!" : "Save Changes"}
                  </button>
                  <button onClick={logout} className="text-sm text-[var(--accent-coral)] hover:underline flex items-center gap-1">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

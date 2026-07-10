import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/layout/Navigation";
import {
  BookOpen, Clock, GraduationCap, ArrowRight,
  CheckCircle,    Plane, Briefcase,
  Award, BookMarked, Globe,
} from "lucide-react";

const pathIcons: Record<string, React.ElementType> = {
  "everyday-english": MessageCircle,
  "business-english": Briefcase,
  "travel-english": Plane,
  "academic-english": GraduationCap,
  "ielts": Award,
  "toefl": BookMarked,
};

function MessageCircle(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>; }

export default function LearningPathsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  // Path expansion managed per card

  const { data: paths, isLoading } = trpc.learningPaths.list.useQuery();
  const { data: userPaths } = trpc.learningPaths.getUserPaths.useQuery(undefined, { enabled: isAuthenticated });
  const enroll = trpc.learningPaths.enroll.useMutation({
    onSuccess: () => utils.learningPaths.getUserPaths.invalidate(),
  });

  const utils = trpc.useUtils();

  useEffect(() => {
    document.title = "Learning Paths | EnglishNow";
  }, []);

  const isEnrolled = (pathId: number) => userPaths?.some((up) => up.path.id === pathId);

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Navigation />
      <main className="pt-24 pb-16 px-[5vw]">
        <div className="content-max">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-4xl text-[var(--starlight)] mb-2">Learning Paths</h1>
            <p className="text-[var(--starlight-dim)]">Structured courses designed for your goals.</p>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-panel rounded-2xl p-6 animate-pulse h-48" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {(paths ?? []).map((path, i) => {
                const Icon = pathIcons[path.slug] || Globe;
                const enrolled = isEnrolled(path.id);
                const userPath = userPaths?.find((up) => up.path.id === path.id);

                return (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel rounded-2xl p-6 card-hover"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-7 h-7 text-[var(--gold)]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-[var(--starlight)]">{path.name}</h3>
                          {enrolled && <CheckCircle className="w-4 h-4 text-[var(--accent-cyan)]" />}
                        </div>
                        <p className="text-xs text-[var(--starlight-dim)] mb-3">{path.description}</p>
                        <div className="flex items-center gap-4 text-[10px] text-[var(--starlight-muted)] mb-4">
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{path.totalLessons} lessons</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{path.estimatedHours}h</span>
                          <span className="flex items-center gap-1 font-mono text-[var(--gold)]">{path.cefrLevel}</span>
                        </div>

                        {enrolled && userPath ? (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-[var(--starlight-muted)]">{userPath.ulp.progress ?? 0}% complete</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[var(--midnight-card)] overflow-hidden mb-3">
                              <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)]" style={{ width: `${userPath.ulp.progress ?? 0}%` }} />
                            </div>
                            <button onClick={() => navigate("/lessons")} className="gold-btn text-xs py-2 px-4 w-full">
                              Continue Learning
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (isAuthenticated) enroll.mutate({ learningPathId: path.id });
                              else navigate("/login");
                            }}
                            className="ghost-btn text-xs py-2 px-4 w-full"
                          >
                            {isAuthenticated ? "Enroll Now" : "Sign in to Enroll"}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

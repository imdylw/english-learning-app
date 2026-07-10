import { useRef, lazy, Suspense } from "react";
import { Link } from "react-router";
import { motion, useInView } from "framer-motion";
import {
  Sparkles,
  
  Target,
  TrendingUp,
  Compass,
  MessageSquare,
  Flame,
  Star,
  
  
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Award,
  Zap,
  
  Globe,
  
  ChevronDown,
  
  Luggage,
  Coffee,
  Map,
  GraduationCap,
  Crown,
} from "lucide-react";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

const CrepuscularRays = lazy(() => import("@/components/effects/CrepuscularRays"));
const StarlightParticles = lazy(() => import("@/components/effects/StarlightParticles"));

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-85px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-gradient-to-b from-[#0a1628] to-[#111d32]" />
        }
      >
        <CrepuscularRays />
      </Suspense>

      {/* Content */}
      <div className="relative z-10 text-center px-[5vw] max-w-3xl mx-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-panel rounded-full px-4 py-2 mb-8 pointer-events-auto border border-[var(--gold)]/20">
            <Sparkles className="w-4 h-4 text-[var(--gold)]" />
            <span className="text-xs font-medium text-[var(--gold)] tracking-wide">
              AI-Powered Learning
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-5xl sm:text-6xl md:text-7xl text-[var(--starlight)] leading-[1.1] mb-6"
        >
          Learn English Faster with{" "}
          <span className="text-[var(--gold)]">AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-[var(--starlight-dim)] max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Personalized lessons, real conversations, and adaptive practice — all
          guided by artificial intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto"
        >
          <Link to="/placement-test" className="gold-btn text-lg px-10 py-4">
            Take Placement Test
          </Link>
          <Link to="/lessons" className="ghost-btn text-lg px-10 py-4">
            Explore Lessons
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] border-2 border-[var(--midnight)] flex items-center justify-center text-[10px] font-bold text-[var(--midnight)]"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span className="text-xs text-[var(--starlight-muted)] tracking-wide">
            12,000+ learners worldwide
          </span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown className="w-6 h-6 text-[var(--starlight-muted)]" />
      </motion.div>
    </section>
  );
}

// Feature Showcase Section
function FeatureShowcase() {
  const features = [
    {
      icon: MessageSquare,
      title: "AI Conversation Practice",
      description:
        "Speak naturally with our AI tutor. Get instant feedback on pronunciation, grammar, and fluency.",
    },
    {
      icon: Compass,
      title: "Adaptive Learning Path",
      description:
        "Lessons adjust to your level in real-time. No more boring content or overwhelming difficulty.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Visual dashboards show your daily streak, XP growth, and skill breakdown across all areas.",
    },
  ];

  return (
    <section className="section-padding bg-[var(--midnight)]">
      <div className="content-max">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image */}
          <FadeIn>
            <div className="showcase-container floating max-w-[500px] mx-auto aspect-[4/5]">
              <div className="w-full h-full bg-gradient-to-br from-[var(--midnight-card)] to-[var(--midnight-light)] flex items-center justify-center p-8">
                <div className="w-full h-full glass-panel rounded-xl p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[var(--gold)]/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-[var(--gold)]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--starlight)]">B1 Intermediate</div>
                        <div className="text-xs text-[var(--starlight-muted)]">Your Level</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--accent-coral)]">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-medium">12</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="glass-panel rounded-lg p-3 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--gold)]/20 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-[var(--gold)]" />
                      </div>
                      <div>
                        <div className="text-xs text-[var(--starlight-muted)] mb-1">AI Tutor</div>
                        <div className="text-sm text-[var(--starlight)]">Great job! Your pronunciation of "schedule" is improving.</div>
                      </div>
                    </div>
                    <div className="glass-panel rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[var(--starlight-muted)]">Daily XP</span>
                        <span className="text-xs text-[var(--gold)]">450 / 500</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--midnight-card)] overflow-hidden">
                        <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="glass-panel rounded-lg p-3 text-center">
                        <BookOpen className="w-5 h-5 text-[var(--gold)] mx-auto mb-1" />
                        <div className="text-lg font-semibold text-[var(--starlight)]">78%</div>
                        <div className="text-[10px] text-[var(--starlight-muted)]">Reading</div>
                      </div>
                      <div className="glass-panel rounded-lg p-3 text-center">
                        <Mic className="w-5 h-5 text-[var(--gold)] mx-auto mb-1" />
                        <div className="text-lg font-semibold text-[var(--starlight)]">62%</div>
                        <div className="text-[10px] text-[var(--starlight-muted)]">Speaking</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right: Features */}
          <div className="space-y-12">
            <FadeIn>
              <h2 className="font-display text-4xl md:text-5xl text-[var(--starlight)] mb-4">
                Learn Your Way
              </h2>
              <p className="text-[var(--starlight-dim)]">
                Our AI adapts to your learning style, pace, and goals — creating a
                truly personalized experience.
              </p>
            </FadeIn>

            {features.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.15}>
                <div className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--gold)]/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-[var(--gold)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--starlight)] mb-2 group-hover:text-[var(--gold)] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--starlight-dim)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// CEFR Level Grid
function CEFRGrid() {
  const levels = [
    { code: "A1", title: "Beginner", desc: "Basic phrases, introductions", icon: Luggage },
    { code: "A2", title: "Elementary", desc: "Everyday situations, simple descriptions", icon: Coffee },
    { code: "B1", title: "Intermediate", desc: "Travel, work, school conversations", icon: Map },
    {
      code: "B2",
      title: "Upper-Intermediate",
      desc: "Complex texts, technical discussions",
      icon: Compass,
      wide: true,
    },
    { code: "C1", title: "Advanced", desc: "Fluent, flexible, social/academic use", icon: GraduationCap },
    { code: "C2", title: "Mastery", desc: "Near-native, precise expression", icon: Crown, highlight: true },
  ];

  return (
    <section className="section-padding bg-[var(--midnight-light)]">
      <div className="content-max">
        <FadeIn>
          <h2 className="font-display text-4xl md:text-5xl text-[var(--starlight)] text-center mb-3">
            From Beginner to Mastery
          </h2>
          <p className="text-[var(--starlight-dim)] text-center mb-16">
            Six CEFR levels. Infinite possibilities.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level, i) => (
            <FadeIn key={level.code} delay={i * 0.08}>
              <div
                className={`card-hover rounded-[20px] p-8 bg-[var(--midnight-card)] border border-white/5 ${
                  level.wide ? "sm:col-span-2 lg:col-span-1" : ""
                } ${level.highlight ? "border-[var(--gold)]/30 gold-glow" : ""}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`font-mono text-2xl font-bold ${
                      level.highlight ? "text-[var(--gold)]" : "text-[var(--gold)]/80"
                    }`}
                  >
                    {level.code}
                  </span>
                  <level.icon
                    className={`w-8 h-8 ${
                      level.highlight ? "text-[var(--gold)]" : "text-[var(--gold)]/60"
                    }`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-[var(--starlight)] mb-2">
                  {level.title}
                </h3>
                <p className="text-sm text-[var(--starlight-dim)]">{level.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works
function HowItWorks() {
  const steps = [
    { num: "01", icon: Target, title: "Take the Test", desc: "Our AI assesses your level in 10 minutes with a comprehensive placement test covering all skills." },
    { num: "02", icon: Compass, title: "Get Your Path", desc: "Receive a personalized learning roadmap tailored to your level, goals, and available study time." },
    { num: "03", icon: MessageSquare, title: "Practice Daily", desc: "15-minute adaptive lessons keep you progressing. AI adjusts difficulty in real-time for optimal learning." },
    { num: "04", icon: TrendingUp, title: "Track Progress", desc: "Watch your fluency score grow week by week with detailed analytics and skill breakdowns." },
  ];

  return (
    <section className="section-padding bg-[var(--midnight)]">
      <div className="content-max">
        <FadeIn>
          <h2 className="font-display text-4xl md:text-5xl text-[var(--starlight)] text-center mb-16">
            How It Works
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <FadeIn key={step.num} delay={i * 0.1}>
              <div className="p-8 border-l-2 border-[var(--gold-dim)] hover:border-[var(--gold)] transition-all duration-300 hover:translate-x-1">
                <span className="font-mono text-5xl text-[var(--gold)]/30 block mb-4">
                  {step.num}
                </span>
                <step.icon className="w-8 h-8 text-[var(--gold)] mb-4" />
                <h3 className="text-lg font-semibold text-[var(--starlight)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--starlight-dim)] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Grid
function FeaturesGrid() {
  const features = [
    { icon: BookOpen, title: "Reading Comprehension", desc: "Stories, articles, and dialogues adapted to your level with vocabulary in context." },
    { icon: Headphones, title: "Listening Practice", desc: "Audio lessons, podcasts, and dictation with playback speed controls." },
    { icon: PenTool, title: "Writing Exercises", desc: "Essays, emails, and creative writing with instant grammar feedback." },
    { icon: Mic, title: "Speaking Practice", desc: "AI conversation partner with speech recognition and pronunciation feedback." },
    { icon: Award, title: "Mock Exams", desc: "Timed IELTS, TOEFL, and TOEIC practice tests with detailed scoring." },
    { icon: Globe, title: "Learning Paths", desc: "Curated paths for Everyday, Business, Travel, and Academic English." },
  ];

  return (
    <section className="section-padding bg-[var(--midnight-light)]">
      <div className="content-max">
        <FadeIn>
          <h2 className="font-display text-4xl md:text-5xl text-[var(--starlight)] text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-[var(--starlight-dim)] text-center mb-16 max-w-xl mx-auto">
            A complete English learning toolkit, powered by AI and completely free.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.08}>
              <div className="card-hover glass-panel rounded-[20px] p-8 h-full">
                <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-[var(--gold)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--starlight)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--starlight-dim)] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials
function Testimonials() {
  const testimonials = [
    {
      quote: "I went from A2 to B1 in 3 months practicing just 15 minutes a day. The AI conversations feel so natural!",
      name: "Sarah Chen",
      role: "Marketing Manager",
      location: "Shanghai",
      stars: 5,
      avatar: "SC",
    },
    {
      quote: "The placement test was incredibly accurate. It identified exactly where I needed improvement and created a perfect study plan.",
      name: "Marco Rossi",
      role: "Software Engineer",
      location: "Milan",
      stars: 5,
      avatar: "MR",
    },
    {
      quote: "Best free English learning platform I've ever used. The grammar explanations are crystal clear and the practice exercises are engaging.",
      name: "Priya Sharma",
      role: "Medical Student",
      location: "Mumbai",
      stars: 5,
      avatar: "PS",
    },
  ];

  return (
    <section className="section-padding bg-[var(--midnight)]">
      <div className="content-max">
        <FadeIn>
          <h2 className="font-display text-4xl md:text-5xl text-[var(--starlight)] text-center mb-16">
            Loved by Learners
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.15}>
              <div className="glass-panel rounded-[20px] p-8 h-full">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 text-[var(--gold)] fill-[var(--gold)]"
                    />
                  ))}
                </div>
                <p className="text-[var(--starlight)] italic mb-6 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center text-xs font-bold text-[var(--midnight)]">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--starlight)]">
                      {t.name}
                    </div>
                    <div className="text-xs text-[var(--starlight-muted)]">
                      {t.role} &middot; {t.location}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQ() {
  const faqs = [
    { q: "Is EnglishNow really free?", a: "Yes, EnglishNow is completely free to use. All lessons, practice exercises, and AI-powered features are available at no cost. We believe quality education should be accessible to everyone." },
    { q: "How does the AI placement test work?", a: "Our adaptive placement test assesses your grammar, vocabulary, reading, listening, speaking, and writing skills. It takes about 10 minutes and automatically determines your CEFR level (A1-C2) with detailed skill breakdowns." },
    { q: "Can I use EnglishNow on my phone?", a: "Absolutely! EnglishNow is fully responsive and works seamlessly on desktop, tablet, and mobile devices. You can learn anywhere, anytime." },
    { q: "How is my progress tracked?", a: "We track your XP, daily streak, lessons completed, and skill scores across reading, writing, listening, and speaking. Your dashboard shows detailed analytics and learning recommendations." },
    { q: "What CEFR levels are covered?", a: "EnglishNow covers all six CEFR levels from A1 (Beginner) to C2 (Mastery). Our AI adapts content difficulty to match your current level and helps you progress naturally." },
    { q: "How does the speaking practice work?", a: "Using your browser's built-in speech recognition, our AI engages in conversation with you, provides pronunciation feedback, and helps you practice real-world dialogues." },
  ];

  return (
    <section className="section-padding bg-[var(--midnight-light)]">
      <div className="content-max max-w-3xl">
        <FadeIn>
          <h2 className="font-display text-4xl md:text-5xl text-[var(--starlight)] text-center mb-16">
            Frequently Asked Questions
          </h2>
        </FadeIn>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <details className="glass-panel rounded-xl group">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="text-[var(--starlight)] font-medium pr-4">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-[var(--gold)] flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-sm text-[var(--starlight-dim)] leading-relaxed">
                  {faq.a}
                </div>
              </details>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-24 px-[5vw] bg-gradient-to-b from-[var(--midnight)] to-[var(--midnight-light)]">
      <div className="content-max text-center">
        <FadeIn>
          <h2 className="font-display text-4xl md:text-5xl text-[var(--starlight)] mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-[var(--starlight-dim)] text-lg mb-8 max-w-lg mx-auto">
            Take the free placement test and discover your level in 10 minutes.
          </p>
          <Link
            to="/placement-test"
            className="gold-btn text-lg px-12 py-5 inline-block gold-glow"
          >
            Get Started Free
          </Link>
          <p className="text-xs text-[var(--starlight-muted)] mt-4">
            No credit card required &middot; Free forever
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// Home Page
export default function Home() {
  return (
    <div className="bg-[var(--midnight)] min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <FeatureShowcase />
        <CEFRGrid />
        <Suspense fallback={<div className="h-[40vh] bg-[var(--midnight)]" />}>
          <StarlightParticles />
        </Suspense>
        <HowItWorks />
        <FeaturesGrid />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

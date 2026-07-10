import { Link } from "react-router";
import { Sparkles, Github, Twitter, Youtube, Mail } from "lucide-react";
import { useState } from "react";

const footerLinks = {
  Learning: [
    { label: "Lessons", path: "/lessons" },
    { label: "Vocabulary", path: "/vocabulary" },
    { label: "Grammar", path: "/grammar" },
    { label: "Placement Test", path: "/placement-test" },
  ],
  Practice: [
    { label: "Speaking", path: "/speaking" },
    { label: "Writing", path: "/writing" },
    { label: "Shadowing", path: "/shadowing" },
    { label: "Mock Exams", path: "/mock-exams" },
  ],
  Community: [
    { label: "Leaderboard", path: "/leaderboard" },
    { label: "Learning Paths", path: "/learning-paths" },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-[var(--midnight)] border-t border-white/5 pt-16 pb-8">
      <div className="content-max px-[5vw]">
        {/* Newsletter */}
        <div className="glass-panel rounded-2xl p-8 md:p-12 mb-16 text-center">
          <h3 className="font-display text-2xl md:text-3xl text-[var(--starlight)] mb-3">
            Get Learning Tips Weekly
          </h3>
          <p className="text-[var(--starlight-dim)] mb-6 max-w-md mx-auto">
            Join 12,000+ learners receiving free English learning tips and resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-[var(--midnight-card)] border border-white/10 text-[var(--starlight)] placeholder:text-[var(--starlight-muted)] focus:outline-none focus:border-[var(--gold)]/50 text-sm"
            />
            <button className="gold-btn py-3 px-6 text-sm whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[var(--gold)]" />
              <span className="font-display italic text-xl text-[var(--gold)]">
                EnglishNow
              </span>
            </Link>
            <p className="text-[var(--starlight-dim)] text-sm leading-relaxed">
              AI-powered English learning platform. Personalized, adaptive, and completely free.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-medium uppercase tracking-[0.05em] text-[var(--starlight-muted)] mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-[var(--starlight-dim)] hover:text-[var(--gold)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--starlight-muted)]">
            &copy; 2026 EnglishNow. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[var(--starlight-muted)] hover:text-[var(--gold)] transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="text-[var(--starlight-muted)] hover:text-[var(--gold)] transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="text-[var(--starlight-muted)] hover:text-[var(--gold)] transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="#" className="text-[var(--starlight-muted)] hover:text-[var(--gold)] transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

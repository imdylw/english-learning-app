import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Globe } from "lucide-react";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--midnight)] flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--midnight)] via-[var(--midnight-light)] to-[var(--midnight)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--gold)]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--gold)]/3 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Link */}
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-[var(--starlight-dim)] hover:text-[var(--gold)] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-[var(--gold)]" />
              <span className="font-display italic text-2xl text-[var(--gold)]">
                EnglishNow
              </span>
            </Link>
            <h1 className="text-2xl font-semibold text-[var(--starlight)] mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-[var(--starlight-dim)]">
              Sign in to track your progress and save your learning streak.
            </p>
          </div>

          {/* OAuth Button */}
          <button
            onClick={() => { window.location.href = getOAuthUrl(); }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-full gold-btn py-3.5 flex items-center justify-center gap-3 text-base font-medium transition-all"
            style={{
              transform: hovered ? "scale(1.02)" : "scale(1)",
              boxShadow: hovered ? "0 8px 24px rgba(212, 168, 67, 0.4)" : "none",
            }}
          >
            <Globe className="w-5 h-5" />
            Sign in with Kimi
          </button>

          {/* Free note */}
          <p className="text-center text-xs text-[var(--starlight-muted)] mt-6">
            Completely free. No credit card required.
          </p>

          {/* Guest link */}
          <div className="text-center mt-6">
            <Link
              to="/placement-test"
              className="text-sm text-[var(--starlight-dim)] hover:text-[var(--gold)] transition-colors"
            >
              Continue as guest &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

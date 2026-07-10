import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--midnight)] flex items-center justify-center px-6">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[var(--gold)]/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <div className="font-mono text-[120px] font-bold text-[var(--gold)]/10 leading-none mb-4">
          404
        </div>
        <h1 className="font-display text-4xl text-[var(--starlight)] mb-4">
          Page Not Found
        </h1>
        <p className="text-[var(--starlight-dim)] mb-8 max-w-sm mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="gold-btn inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}

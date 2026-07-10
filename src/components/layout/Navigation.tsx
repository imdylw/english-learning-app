import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen,
  GraduationCap,
  Trophy,
  User,
  Menu,
  X,
  Sparkles,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { label: "Lessons", path: "/lessons", icon: BookOpen },
  { label: "Practice", path: "/speaking", icon: GraduationCap },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === "/";
  const showNav = scrolled || !isHome;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showNav
            ? "bg-[rgba(10,22,40,0.85)] backdrop-blur-[16px] border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="content-max flex items-center justify-between h-16 px-[5vw]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-5 h-5 text-[var(--gold)] group-hover:rotate-12 transition-transform" />
            <span className="font-display italic text-xl text-[var(--gold)]">
              EnglishNow
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-[var(--gold)] ${
                  location.pathname === item.path
                    ? "text-[var(--gold)]"
                    : "text-[var(--starlight-dim)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 text-sm text-[var(--starlight-dim)] hover:text-[var(--gold)] transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <div className="w-px h-5 bg-white/10" />
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 text-sm text-[var(--starlight-dim)] hover:text-[var(--gold)] transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user?.name || "Profile"}
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-sm text-[var(--starlight-muted)] hover:text-[var(--accent-coral)] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="ghost-btn text-sm py-2 px-5">
                  Sign In
                </Link>
                <Link to="/placement-test" className="gold-btn text-sm py-2 px-5">
                  Start Learning
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[var(--starlight)] p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-[var(--midnight)]/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8">
          <button
            className="absolute top-5 right-5 text-[var(--starlight)] p-2"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          <Link to="/" className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-[var(--gold)]" />
            <span className="font-display italic text-2xl text-[var(--gold)]">
              EnglishNow
            </span>
          </Link>

          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-xl font-medium text-[var(--starlight)] hover:text-[var(--gold)] transition-colors flex items-center gap-3"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-xl font-medium text-[var(--starlight)] hover:text-[var(--gold)] transition-colors flex items-center gap-3"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-xl font-medium text-[var(--accent-coral)] flex items-center gap-3"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-4 mt-4">
              <Link to="/login" className="ghost-btn text-center py-3 px-8">
                Sign In
              </Link>
              <Link to="/placement-test" className="gold-btn text-center py-3 px-8">
                Start Learning
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}

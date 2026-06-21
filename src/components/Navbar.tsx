import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, HelpCircle, User, LogOut, BookOpen, ChevronDown, X, Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiUrl } from "../lib/api";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/rankings", label: "Rankings" },
  { to: "/downloads", label: "Downloads" },
  { to: "/wiki", label: "Wiki" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/anime?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  const pfpUrl = user?.pfp ? apiUrl(user.pfp) : null;

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/5"
      style={{ backgroundColor: "rgba(0,0,0,0.97)", backdropFilter: "blur(12px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-black font-black text-base shrink-0"
              style={{ backgroundColor: "#f5a623" }}
            >
              A
            </div>
            <span className="font-bold text-white text-base hidden sm:block tracking-tight">
              Animeastral
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded ${
                  location.pathname === link.to
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles..."
                className="pl-9 pr-4 py-1.5 text-sm rounded bg-white/8 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-white/20 w-44 transition-all focus:w-56"
              />
            </div>
          </form>

          {/* Help */}
          <button className="hidden sm:flex w-7 h-7 rounded-full border border-white/20 items-center justify-center text-gray-400 hover:text-white hover:border-white/40 transition-colors text-xs font-bold">
            ?
          </button>

          {/* Auth */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2"
              >
                {pfpUrl ? (
                  <img
                    src={pfpUrl}
                    alt={user.username}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-accent/50"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-black text-xs font-bold"
                    style={{ backgroundColor: "#f5a623" }}
                  >
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </button>
              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded border border-white/10 shadow-2xl animate-fade-in overflow-hidden"
                  style={{ backgroundColor: "#111" }}
                >
                  <div className="px-3 py-2.5 border-b border-white/10">
                    <p className="text-sm font-medium text-white truncate">{user.username}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-3.5 h-3.5" /> Profile
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Library
                    </Link>
                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium px-3 py-1.5 rounded text-black transition-colors"
                style={{ backgroundColor: "#f5a623" }}
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden text-gray-400 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 py-3 space-y-1 animate-fade-in">
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles..."
                className="flex-1 px-3 py-2 text-sm rounded bg-white/8 border border-white/10 text-white placeholder-gray-500 outline-none"
              />
              <button type="submit" className="px-3 py-2 rounded text-black text-sm font-medium" style={{ backgroundColor: "#f5a623" }}>
                Go
              </button>
            </form>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-3 py-2 rounded text-sm font-medium ${
                  location.pathname === link.to
                    ? "text-white bg-white/5"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1 text-center py-2 text-sm text-gray-300 border border-white/10 rounded">Sign in</Link>
                <Link to="/register" className="flex-1 text-center py-2 text-sm font-medium text-black rounded" style={{ backgroundColor: "#f5a623" }}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

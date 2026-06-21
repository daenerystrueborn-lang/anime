import { Link } from "react-router-dom";
import { Tv } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Tv className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white">
                Anime<span className="text-primary-400">astral</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your universe for anime, manga, manhwa and novels.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Browse</h4>
            <ul className="space-y-2">
              {[
                { to: "/anime", label: "Anime" },
                { to: "/wiki", label: "Wiki" },
                { to: "/rankings", label: "Rankings" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Tools</h4>
            <ul className="space-y-2">
              {[
                { to: "/downloads", label: "Downloads" },
                { to: "/profile", label: "Library" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Account</h4>
            <ul className="space-y-2">
              {[
                { to: "/login", label: "Sign In" },
                { to: "/register", label: "Register" },
                { to: "/profile", label: "Profile" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Animeastral. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Data provided by AniList, MangaPill & NovelFire
          </p>
        </div>
      </div>
    </footer>
  );
}

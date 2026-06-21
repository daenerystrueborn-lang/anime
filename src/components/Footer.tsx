import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto" style={{ backgroundColor: "#050505" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded flex items-center justify-center text-black font-black text-sm" style={{ backgroundColor: "#f5a623" }}>
                A
              </div>
              <span className="font-bold text-white">Animeastral</span>
            </Link>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your universe for anime, manga, manhwa and novels.
            </p>
          </div>

          {[
            {
              title: "Browse",
              links: [
                { to: "/", label: "Home" },
                { to: "/rankings", label: "Rankings" },
                { to: "/wiki", label: "Wiki" },
              ],
            },
            {
              title: "Tools",
              links: [
                { to: "/downloads", label: "Downloads" },
                { to: "/anime", label: "Browse Anime" },
                { to: "/profile", label: "Library" },
              ],
            },
            {
              title: "Account",
              links: [
                { to: "/login", label: "Sign In" },
                { to: "/register", label: "Register" },
                { to: "/profile", label: "Profile" },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-gray-600 hover:text-gray-300 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-700">
            &copy; {new Date().getFullYear()} Animeastral. All rights reserved.
          </p>
          <p className="text-xs text-gray-700">
            Data via AniList · MangaPill · NovelFire
          </p>
        </div>
      </div>
    </footer>
  );
}

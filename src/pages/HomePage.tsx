import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, Search, ChevronRight, BookOpen, Star, Tv, Flame } from "lucide-react";
import { apiFetch } from "../lib/api";
import AnimeCard, { MediaItem } from "../components/AnimeCard";
import { SkeletonCard } from "../components/LoadingSpinner";

interface TrendingResponse {
  data?: {
    trending?: { media?: MediaItem[] };
    popular?: { media?: MediaItem[] };
  };
  results?: MediaItem[];
}

function useAnime(key: string, endpoint: string) {
  return useQuery<MediaItem[]>({
    queryKey: [key],
    queryFn: async () => {
      const res = await apiFetch<TrendingResponse>(endpoint);
      return res?.data?.trending?.media || res?.results || [];
    },
  });
}

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: trending = [], isLoading: loadingTrend } = useAnime(
    "trending-home",
    "/api/anime/trending?type=ANIME&perPage=12"
  );

  const { data: topManga = [], isLoading: loadingManga } = useQuery<MediaItem[]>({
    queryKey: ["top-manga-home"],
    queryFn: async () => {
      const res = await apiFetch<TrendingResponse>("/api/anime/trending?type=MANGA&perPage=6");
      return res?.data?.trending?.media || res?.results || [];
    },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/anime?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-950/60 via-surface to-surface pt-20 pb-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.15)_0%,transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Flame className="w-3.5 h-3.5" />
            Your universe for anime, manga & novels
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5">
            Discover{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
              Animeastral
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Browse thousands of anime, manga, manhwa and novels. Track your library, explore wikis, and download content.
          </p>

          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anime, manga, or characters..."
                className="input pl-11 h-12 text-base"
              />
            </div>
            <button type="submit" className="btn-primary px-6 h-12 text-base">
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {["Action", "Fantasy", "Romance", "Isekai", "Horror"].map((genre) => (
              <Link
                key={genre}
                to={`/anime?genre=${encodeURIComponent(genre)}`}
                className="text-xs text-gray-500 hover:text-primary-400 bg-white/5 hover:bg-primary-500/10 border border-white/10 hover:border-primary-500/30 px-3 py-1 rounded-full transition-all"
              >
                {genre}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-14">
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              <h2 className="text-xl font-bold text-white">Trending Anime</h2>
            </div>
            <Link
              to="/anime?sort=trending"
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-400 transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loadingTrend ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trending.slice(0, 12).map((item) => (
                <AnimeCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <Tv className="w-6 h-6" />,
              title: "Watch Anime",
              desc: "Stream your favorite anime series with episode tracking.",
              to: "/anime",
              label: "Browse Anime",
              color: "from-primary-500 to-purple-600",
            },
            {
              icon: <BookOpen className="w-6 h-6" />,
              title: "Read & Download",
              desc: "Download manga chapters and novel books in multiple formats.",
              to: "/downloads",
              label: "Downloads",
              color: "from-blue-500 to-cyan-600",
            },
            {
              icon: <Star className="w-6 h-6" />,
              title: "Rankings",
              desc: "Explore top-ranked anime, manga, manhwa and novels.",
              to: "/rankings",
              label: "See Rankings",
              color: "from-orange-500 to-red-600",
            },
          ].map((f) => (
            <div key={f.title} className="card p-6 hover:border-white/20 transition-colors group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{f.desc}</p>
              <Link
                to={f.to}
                className="text-sm font-medium text-primary-400 hover:text-primary-300 flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                {f.label} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-400" />
              <h2 className="text-xl font-bold text-white">Popular Manga</h2>
            </div>
            <Link
              to="/rankings?type=MANGA"
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-400 transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loadingManga ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topManga.slice(0, 6).map((item) => (
                <AnimeCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

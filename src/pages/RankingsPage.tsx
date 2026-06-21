import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Star, TrendingUp, Flame } from "lucide-react";
import { apiFetch } from "../lib/api";
import AnimeCard, { MediaItem } from "../components/AnimeCard";
import { SkeletonCard } from "../components/LoadingSpinner";

const TYPES = ["Anime", "Manga", "Manhwa", "Movies", "Novels"] as const;
type RankType = typeof TYPES[number];

const API_TYPE: Record<RankType, string> = {
  Anime: "ANIME",
  Manga: "MANGA",
  Manhwa: "MANGA",
  Movies: "ANIME",
  Novels: "MANGA",
};

const SORTS = [
  { value: "SCORE", label: "Score", icon: Star },
  { value: "POPULARITY", label: "Popularity", icon: Flame },
  { value: "TRENDING", label: "Trending", icon: TrendingUp },
] as const;

const GENRES = [
  "All", "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Horror", "Mystery", "Romance", "Sci-Fi", "Sports", "Thriller",
  "Isekai", "Mecha", "Historical",
];

interface RankingsResponse {
  data?: { Page?: { media?: MediaItem[] }; trending?: { media?: MediaItem[] } };
  results?: MediaItem[];
}

export default function RankingsPage() {
  const [type, setType] = useState<RankType>("Anime");
  const [sort, setSort] = useState("SCORE");
  const [genre, setGenre] = useState("All");

  const { data: items = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["rankings", type, sort, genre],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: API_TYPE[type],
        sort,
        perPage: "24",
      });
      if (genre !== "All") params.set("genre", genre);
      const res = await apiFetch<RankingsResponse>(`/api/anime/rankings?${params}`);
      return res?.data?.Page?.media || res?.data?.trending?.media || res?.results || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5" style={{ color: "#f5a623" }} />
        <h1 className="text-xl font-bold text-white">Rankings</h1>
      </div>

      {/* Type tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className="px-4 py-1.5 rounded text-sm font-medium transition-all"
            style={{
              backgroundColor: type === t ? "#f5a623" : "#111",
              color: type === t ? "#000" : "#aaa",
              border: `1px solid ${type === t ? "#f5a623" : "#222"}`,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="text-xs text-gray-600 self-center mr-1">Sort:</span>
        {SORTS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSort(s.value)}
            className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-all"
            style={{
              backgroundColor: sort === s.value ? "rgba(245,166,35,0.15)" : "#111",
              color: sort === s.value ? "#f5a623" : "#888",
              border: `1px solid ${sort === s.value ? "rgba(245,166,35,0.4)" : "#222"}`,
            }}
          >
            <s.icon className="w-3 h-3" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Genre */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        <span className="text-xs text-gray-600 self-center mr-1">Genre:</span>
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className="px-3 py-1 rounded text-xs transition-all"
            style={{
              backgroundColor: genre === g ? "#1a1a1a" : "transparent",
              color: genre === g ? "#fff" : "#666",
              border: `1px solid ${genre === g ? "#444" : "#222"}`,
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-600">No results found. Try different filters.</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {items.map((item, idx) => (
            <AnimeCard key={item.id} item={item} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

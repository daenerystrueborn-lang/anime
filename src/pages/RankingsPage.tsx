import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Star, TrendingUp, Flame } from "lucide-react";
import { apiFetch } from "../lib/api";
import AnimeCard, { MediaItem } from "../components/AnimeCard";
import { SkeletonCard } from "../components/LoadingSpinner";

const TYPES = [
  { value: "ANIME", label: "Anime" },
  { value: "MANGA", label: "Manga" },
  { value: "MANHWA", label: "Manhwa" },
  { value: "MOVIES", label: "Movies" },
  { value: "NOVELS", label: "Novels" },
] as const;

const SORTS = [
  { value: "SCORE", label: "Score", icon: Star },
  { value: "POPULARITY", label: "Popularity", icon: Flame },
  { value: "TRENDING", label: "Trending", icon: TrendingUp },
  { value: "TITLE", label: "Title", icon: null },
] as const;

const GENRES = [
  "All", "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Horror", "Mystery", "Romance", "Sci-Fi", "Sports", "Thriller",
  "Isekai", "Mecha", "Historical",
];

type MediaType = typeof TYPES[number]["value"];
type SortType = typeof SORTS[number]["value"];

interface RankingsResponse {
  data?: { Page?: { media?: MediaItem[] }; trending?: { media?: MediaItem[] } };
  results?: MediaItem[];
}

function buildRankUrl(type: MediaType, sort: SortType, genre: string, page: number): string {
  const params: Record<string, string> = {
    type,
    sort,
    page: String(page),
    perPage: "24",
  };
  if (genre && genre !== "All") params.genre = genre;
  return `/api/anime/rankings?${new URLSearchParams(params)}`;
}

export default function RankingsPage() {
  const [type, setType] = useState<MediaType>("ANIME");
  const [sort, setSort] = useState<SortType>("SCORE");
  const [genre, setGenre] = useState("All");

  const { data: items = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["rankings", type, sort, genre],
    queryFn: async () => {
      const url = buildRankUrl(type, sort, genre, 1);
      const res = await apiFetch<RankingsResponse>(url);
      return (
        res?.data?.Page?.media ||
        res?.data?.trending?.media ||
        res?.results ||
        []
      );
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Rankings
        </h1>
        <p className="text-gray-500 text-sm">Top-ranked anime, manga, manhwa and novels</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                type === t.value
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 font-medium self-center mr-1">Sort by:</span>
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                sort === s.value
                  ? "bg-primary-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
              }`}
            >
              {s.icon && <s.icon className="w-3 h-3" />}
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 font-medium self-center mr-1">Genre:</span>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                genre === g
                  ? "bg-primary-600 text-white"
                  : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300 border border-white/10"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No results found</p>
          <p className="text-gray-600 text-sm mt-1">Try adjusting the filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item, idx) => (
            <div key={item.id} className="relative">
              {idx < 3 && (
                <div
                  className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                    idx === 0
                      ? "bg-yellow-500 text-yellow-900"
                      : idx === 1
                      ? "bg-gray-300 text-gray-700"
                      : "bg-amber-600 text-amber-100"
                  }`}
                >
                  {idx + 1}
                </div>
              )}
              <AnimeCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

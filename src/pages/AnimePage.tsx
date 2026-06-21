import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { apiFetch } from "../lib/api";
import AnimeCard, { MediaItem } from "../components/AnimeCard";
import { SkeletonCard } from "../components/LoadingSpinner";

const GENRES = [
  "Action","Adventure","Comedy","Drama","Fantasy","Horror",
  "Mystery","Psychological","Romance","Sci-Fi","Sports",
  "Thriller","Isekai","Mecha","Historical","Slice of Life",
];

const TYPES = ["ANIME","MANGA","MANHWA"] as const;

interface SearchResponse {
  data?: { Page?: { media?: MediaItem[] } };
  results?: MediaItem[];
}

interface TrendResponse {
  data?: { trending?: { media?: MediaItem[] } };
  results?: MediaItem[];
}

export default function AnimePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "ANIME");
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (genre) p.set("genre", genre);
    if (type !== "ANIME") p.set("type", type);
    setSearchParams(p, { replace: true });
  }, [query, genre, type]);

  const { data: results = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["anime-browse", query, type, genre],
    queryFn: async () => {
      if (query) {
        const res = await apiFetch<SearchResponse>(
          `/api/anime/search?${new URLSearchParams({ q: query, type, perPage: "24" })}`
        );
        return res?.data?.Page?.media || res?.results || [];
      }
      if (genre) {
        const res = await apiFetch<SearchResponse>(
          `/api/anime/search?type=${type}&genre=${encodeURIComponent(genre)}&perPage=24`
        );
        return res?.data?.Page?.media || res?.results || [];
      }
      const res = await apiFetch<TrendResponse>(`/api/anime/trending?type=${type}&perPage=24`);
      return res?.data?.trending?.media || res?.results || [];
    },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(inputValue.trim());
    setGenre("");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-6">Browse</h1>

      <div className="space-y-4 mb-7">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search anime, manga..."
              className="input pl-9 h-10"
            />
          </div>
          <button
            type="submit"
            className="px-5 h-10 rounded text-sm font-semibold text-black transition-colors"
            style={{ backgroundColor: "#f5a623" }}
          >
            Search
          </button>
        </form>

        {/* Type */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-600 mr-1">Type:</span>
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setGenre(""); setQuery(""); setInputValue(""); }}
              className="px-3 py-1 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: type === t ? "#f5a623" : "#111",
                color: type === t ? "#000" : "#888",
                border: `1px solid ${type === t ? "#f5a623" : "#222"}`,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-600 self-center mr-1">Genre:</span>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => { setGenre(g === genre ? "" : g); setQuery(""); setInputValue(""); }}
              className="px-3 py-1 rounded text-xs transition-all"
              style={{
                backgroundColor: genre === g ? "#1a1a1a" : "transparent",
                color: genre === g ? "#f5a623" : "#666",
                border: `1px solid ${genre === g ? "#444" : "#222"}`,
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {query && <p className="text-sm text-gray-500 mb-4">Results for <span className="text-white">"{query}"</span></p>}
      {genre && !query && <p className="text-sm text-gray-500 mb-4">Genre: <span className="text-white">{genre}</span></p>}

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 text-gray-600">No results found</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {results.map((item) => <AnimeCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}

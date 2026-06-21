import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter, ChevronDown, Tv, TrendingUp } from "lucide-react";
import { apiFetch } from "../lib/api";
import AnimeCard, { MediaItem } from "../components/AnimeCard";
import { SkeletonCard, LoadingPage } from "../components/LoadingSpinner";

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Psychological", "Romance", "Sci-Fi", "Sports",
  "Thriller", "Isekai", "Mecha", "Historical", "Slice of Life",
];

const TYPES = ["ANIME", "MANGA", "MANHWA"];

const SORT_OPTIONS = [
  { label: "Trending", value: "trending" },
  { label: "Popularity", value: "popularity" },
  { label: "Score", value: "score" },
  { label: "Title", value: "title" },
];

interface SearchResponse {
  data?: { Page?: { media?: MediaItem[] } };
  results?: MediaItem[];
  media?: MediaItem[];
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
  const [sort, setSort] = useState(searchParams.get("sort") || "trending");
  const [inputValue, setInputValue] = useState(query);

  const isSearch = !!query;
  const isGenreFilter = !!genre;

  function buildParams(): URLSearchParams {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (genre) p.set("genre", genre);
    if (type !== "ANIME") p.set("type", type);
    if (sort !== "trending") p.set("sort", sort);
    return p;
  }

  useEffect(() => {
    setSearchParams(buildParams(), { replace: true });
  }, [query, genre, type, sort]);

  const { data: results = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["anime-browse", query, type, genre, sort],
    queryFn: async () => {
      if (isSearch) {
        const url = `/api/anime/search?${new URLSearchParams({ q: query, type, perPage: "24" })}`;
        const res = await apiFetch<SearchResponse>(url);
        return res?.data?.Page?.media || res?.results || [];
      }
      if (isGenreFilter) {
        const url = `/api/anime/search?type=${type}&genre=${encodeURIComponent(genre)}&perPage=24`;
        const res = await apiFetch<SearchResponse>(url);
        return res?.data?.Page?.media || res?.results || [];
      }
      const url = `/api/anime/trending?type=${type}&perPage=24`;
      const res = await apiFetch<TrendResponse>(url);
      return res?.data?.trending?.media || res?.results || [];
    },
    staleTime: 1000 * 60 * 3,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(inputValue.trim());
    setGenre("");
  }

  function selectGenre(g: string) {
    setGenre(g === genre ? "" : g);
    setQuery("");
    setInputValue("");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Tv className="w-6 h-6 text-primary-400" />
          Browse
        </h1>
        <p className="text-gray-500 text-sm">Search and discover anime, manga and manhwa</p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search anime, manga..."
              className="input pl-11 h-11"
            />
          </div>
          <button type="submit" className="btn-primary h-11 px-6">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 mr-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">Type:</span>
          </div>
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setGenre(""); setQuery(""); setInputValue(""); }}
              className={`text-xs px-3 py-1.5 rounded-full transition-all font-medium ${
                type === t
                  ? "bg-primary-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
              }`}
            >
              {t}
            </button>
          ))}

          <div className="flex items-center gap-1 ml-4 mr-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">Sort:</span>
          </div>
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all font-medium ${
                sort === s.value
                  ? "bg-primary-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 font-medium self-center">Genres:</span>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => selectGenre(g)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
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

      {query && (
        <p className="text-sm text-gray-500 mb-4">
          Results for <span className="text-white font-medium">"{query}"</span>
        </p>
      )}
      {genre && !query && (
        <p className="text-sm text-gray-500 mb-4">
          Showing <span className="text-white font-medium">{genre}</span> {type.toLowerCase()}
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No results found</p>
          <p className="text-gray-600 text-sm mt-1">Try different search terms or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((item) => (
            <AnimeCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

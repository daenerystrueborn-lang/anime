import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, BookOpen, Tv, Loader2 } from "lucide-react";
import { apiFetch } from "../lib/api";
import AnimeCard, { MediaItem } from "../components/AnimeCard";
import { SkeletonCard } from "../components/LoadingSpinner";

interface SearchResponse {
  data?: { Page?: { media?: MediaItem[] } };
  results?: MediaItem[];
}

export default function WikiPage() {
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [searchType, setSearchType] = useState<"ANIME" | "MANGA">("ANIME");

  const { data: animeResults = [], isLoading: animeLoading } = useQuery<MediaItem[]>({
    queryKey: ["wiki-search-anime", query],
    queryFn: async () => {
      if (!query) return [];
      const res = await apiFetch<SearchResponse>(
        `/api/anime/search?q=${encodeURIComponent(query)}&type=ANIME&perPage=4`
      );
      return res?.data?.Page?.media || res?.results || [];
    },
    enabled: !!query,
  });

  const { data: mangaResults = [], isLoading: mangaLoading } = useQuery<MediaItem[]>({
    queryKey: ["wiki-search-manga", query],
    queryFn: async () => {
      if (!query) return [];
      const res = await apiFetch<SearchResponse>(
        `/api/anime/search?q=${encodeURIComponent(query)}&type=MANGA&perPage=3`
      );
      return res?.data?.Page?.media || res?.results || [];
    },
    enabled: !!query,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(inputValue.trim());
  }

  const isLoading = animeLoading || mangaLoading;
  const hasResults = animeResults.length > 0 || mangaResults.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary-400" />
          Wiki
        </h1>
        <p className="text-gray-500 text-sm">Search for anime or manga to view detailed information</p>
      </div>

      <div className="max-w-2xl mb-8">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search for anime, manga, characters..."
              className="input pl-11 h-11"
            />
          </div>
          <button type="submit" className="btn-primary h-11 px-6">
            Search
          </button>
        </form>
      </div>

      {!query && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-600" />
          </div>
          <p className="text-gray-400 font-medium mb-2">Search the Wiki</p>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            Enter an anime or manga title to view detailed information, characters, and relations.
          </p>
        </div>
      )}

      {query && isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {query && !isLoading && !hasResults && (
        <div className="text-center py-20">
          <p className="text-gray-400 font-medium">No results found for "{query}"</p>
          <p className="text-gray-600 text-sm mt-1">Try a different search term</p>
        </div>
      )}

      {animeResults.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Tv className="w-4 h-4 text-primary-400" />
            <h2 className="font-semibold text-white">Anime</h2>
            <span className="text-xs text-gray-500">({animeResults.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {animeResults.map((item) => (
              <AnimeCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {mangaResults.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-primary-400" />
            <h2 className="font-semibold text-white">Manga</h2>
            <span className="text-xs text-gray-500">({mangaResults.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {mangaResults.map((item) => (
              <AnimeCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

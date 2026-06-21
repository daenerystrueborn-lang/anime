import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, BookOpen, Tv } from "lucide-react";
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

  const { data: animeResults = [], isLoading: animeLoading } = useQuery<MediaItem[]>({
    queryKey: ["wiki-anime", query],
    queryFn: async () => {
      const res = await apiFetch<SearchResponse>(
        `/api/anime/search?q=${encodeURIComponent(query)}&type=ANIME&perPage=4`
      );
      return res?.data?.Page?.media || res?.results || [];
    },
    enabled: !!query,
  });

  const { data: mangaResults = [], isLoading: mangaLoading } = useQuery<MediaItem[]>({
    queryKey: ["wiki-manga", query],
    queryFn: async () => {
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
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5" style={{ color: "#f5a623" }} />
        <h1 className="text-xl font-bold text-white">Wiki</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search for anime, manga, characters..."
            className="input pl-9 h-10"
          />
        </div>
        <button type="submit" className="px-5 h-10 rounded text-sm font-semibold text-black" style={{ backgroundColor: "#f5a623" }}>
          Search
        </button>
      </form>

      {!query && (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Search for an anime or manga to view its wiki page</p>
        </div>
      )}

      {query && isLoading && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {query && !isLoading && !hasResults && (
        <div className="text-center py-20 text-gray-600">No results for "{query}"</div>
      )}

      {animeResults.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Tv className="w-4 h-4" style={{ color: "#f5a623" }} />
            <h2 className="font-semibold text-white text-sm">Anime ({animeResults.length})</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {animeResults.map((item) => <AnimeCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {mangaResults.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4" style={{ color: "#f5a623" }} />
            <h2 className="font-semibold text-white text-sm">Manga ({mangaResults.length})</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {mangaResults.map((item) => <AnimeCard key={item.id} item={item} />)}
          </div>
        </section>
      )}
    </div>
  );
}

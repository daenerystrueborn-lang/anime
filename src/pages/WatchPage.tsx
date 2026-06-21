import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft, ChevronRight, Play, Clock, BookOpen,
  ExternalLink, List, Star, Calendar, Film
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { LoadingPage } from "../components/LoadingSpinner";
import LibraryModal from "../components/LibraryModal";
import { MediaItem } from "../components/AnimeCard";

interface Episode {
  id: string;
  number: number;
  title?: string;
  image?: string;
  airDate?: string;
  description?: string;
}

interface AnimeDetails extends MediaItem {
  description?: string;
  trailer?: { id?: string; site?: string };
  relations?: { edges?: { relationType?: string; node?: MediaItem }[] };
  characters?: { edges?: { node?: { id: number; name?: { full?: string }; image?: { large?: string } }; role?: string }[] };
}

interface EpisodesResponse {
  episodes?: Episode[];
  results?: Episode[];
}

interface DetailsResponse {
  data?: { Media?: AnimeDetails };
  results?: AnimeDetails;
}

const WATCH_HISTORY_KEY = "watch-history";

function getHistory(): Record<string, { episodeNumber: number; animeId: string }> {
  try {
    return JSON.parse(localStorage.getItem(WATCH_HISTORY_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveHistory(animeId: string, episodeNumber: number) {
  const history = getHistory();
  history[animeId] = { episodeNumber, animeId };
  localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
}

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedEp, setSelectedEp] = useState<Episode | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(true);

  const { data: details, isLoading: detailsLoading } = useQuery<AnimeDetails>({
    queryKey: ["anime-details", id],
    queryFn: async () => {
      const res = await apiFetch<DetailsResponse>(`/api/anime/details/${id}`);
      return res?.data?.Media || (res as unknown as AnimeDetails);
    },
    enabled: !!id,
  });

  const { data: episodesData, isLoading: epsLoading } = useQuery<Episode[]>({
    queryKey: ["anime-episodes", id],
    queryFn: async () => {
      const res = await apiFetch<EpisodesResponse>(`/api/anime/episodes/${id}`);
      return res?.episodes || res?.results || [];
    },
    enabled: !!id,
  });

  const episodes = episodesData || [];

  useEffect(() => {
    if (episodes.length > 0 && !selectedEp) {
      const history = getHistory();
      const lastEp = history[id || ""];
      const ep = lastEp
        ? episodes.find((e) => e.number === lastEp.episodeNumber) || episodes[0]
        : episodes[0];
      setSelectedEp(ep);
    }
  }, [episodes, id]);

  function selectEpisode(ep: Episode) {
    setSelectedEp(ep);
    if (id) saveHistory(id, ep.number);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const title =
    typeof details?.title === "string"
      ? details.title
      : details?.title?.english || details?.title?.romaji || "Loading...";

  if (detailsLoading) return <LoadingPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <Link
        to={`/wiki/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-5 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Wiki
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <div className="card overflow-hidden">
            {selectedEp ? (
              <div>
                <div className="relative bg-black aspect-video flex items-center justify-center">
                  {selectedEp.image ? (
                    <img
                      src={selectedEp.image}
                      alt={`Episode ${selectedEp.number}`}
                      className="w-full h-full object-cover opacity-30"
                    />
                  ) : null}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-primary-600/80 flex items-center justify-center">
                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                    </div>
                    <p className="text-gray-300 text-sm">Episode {selectedEp.number}</p>
                    {selectedEp.title && (
                      <p className="text-gray-400 text-xs px-4 text-center">{selectedEp.title}</p>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-white">
                    Episode {selectedEp.number}
                    {selectedEp.title && ` — ${selectedEp.title}`}
                  </h2>
                  {selectedEp.airDate && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {selectedEp.airDate}
                    </p>
                  )}
                  {selectedEp.description && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-3">{selectedEp.description}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-white/5 flex items-center justify-center">
                <p className="text-gray-500">Select an episode to watch</p>
              </div>
            )}
          </div>

          <div className="card p-4">
            <div className="flex items-start gap-4">
              {typeof details?.coverImage !== "string" && details?.coverImage?.large && (
                <img
                  src={details.coverImage.large}
                  alt={title}
                  className="w-20 rounded-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-white mb-1">{title}</h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  {details?.averageScore && (
                    <span className="badge bg-yellow-500/10 text-yellow-400">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {(details.averageScore / 10).toFixed(1)}
                    </span>
                  )}
                  {details?.format && (
                    <span className="badge bg-white/10 text-gray-300">
                      <Film className="w-3 h-3" />
                      {details.format}
                    </span>
                  )}
                  {details?.status && (
                    <span className="badge bg-white/10 text-gray-300">
                      {details.status}
                    </span>
                  )}
                </div>
                {details?.description && (
                  <p
                    className="text-sm text-gray-400 line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: details.description.replace(/<[^>]+>/g, ""),
                    }}
                  />
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setShowLibrary(true)}
                    className="btn-primary text-sm h-8 px-4"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Library
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div
            className="flex items-center justify-between p-4 border-b border-border cursor-pointer"
            onClick={() => setShowEpisodeList((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-primary-400" />
              <h3 className="font-semibold text-white text-sm">
                Episodes {episodes.length > 0 && `(${episodes.length})`}
              </h3>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-gray-400 transition-transform ${showEpisodeList ? "rotate-90" : ""}`}
            />
          </div>

          {showEpisodeList && (
            <div className="max-h-[600px] overflow-y-auto">
              {epsLoading ? (
                <div className="p-4 text-center text-gray-500 text-sm">Loading episodes...</div>
              ) : episodes.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No episodes found</div>
              ) : (
                <div className="p-2 space-y-1">
                  {episodes.map((ep) => (
                    <button
                      key={ep.id || ep.number}
                      onClick={() => selectEpisode(ep)}
                      className={`w-full text-left p-3 rounded-lg transition-colors group ${
                        selectedEp?.number === ep.number
                          ? "bg-primary-600 text-white"
                          : "hover:bg-white/5 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold w-8 ${selectedEp?.number === ep.number ? "text-white" : "text-gray-500"}`}>
                          {ep.number}
                        </span>
                        <span className="text-sm truncate flex-1">
                          {ep.title || `Episode ${ep.number}`}
                        </span>
                        {selectedEp?.number === ep.number && (
                          <Play className="w-3 h-3 fill-white shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showLibrary && details && (
        <LibraryModal
          item={details}
          mediaType="ANIME"
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Play, BookOpen, List, Star, Calendar, Film, ChevronDown } from "lucide-react";
import { apiFetch } from "../lib/api";
import { LoadingPage } from "../components/LoadingSpinner";
import LibraryModal from "../components/LibraryModal";
import { MediaItem, getTitle, getCover } from "../components/AnimeCard";

interface Episode { id: string; number: number; title?: string; image?: string; airDate?: string; description?: string; }
interface WikiDetail extends MediaItem { description?: string; }

const WATCH_HISTORY_KEY = "watch-history";
function getHistory(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(WATCH_HISTORY_KEY) || "{}"); } catch { return {}; }
}
function saveHistory(id: string, ep: number) {
  const h = getHistory(); h[id] = ep; localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(h));
}

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedEp, setSelectedEp] = useState<Episode | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showEpList, setShowEpList] = useState(true);

  const { data: detail, isLoading } = useQuery<WikiDetail>({
    queryKey: ["anime-details", id],
    queryFn: async () => {
      const res = await apiFetch<{ data?: { Media?: WikiDetail } }>(`/api/anime/details/${id}`);
      return res?.data?.Media || (res as unknown as WikiDetail);
    },
    enabled: !!id,
  });

  const { data: episodes = [], isLoading: epsLoading } = useQuery<Episode[]>({
    queryKey: ["anime-episodes", id],
    queryFn: async () => {
      const res = await apiFetch<{ episodes?: Episode[]; results?: Episode[] }>(`/api/anime/episodes/${id}`);
      return res?.episodes || res?.results || [];
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (episodes.length > 0 && !selectedEp) {
      const last = getHistory()[id || ""];
      setSelectedEp(episodes.find((e) => e.number === last) || episodes[0]);
    }
  }, [episodes, id]);

  function pickEp(ep: Episode) {
    setSelectedEp(ep);
    if (id) saveHistory(id, ep.number);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (isLoading) return <LoadingPage />;

  const title = detail ? getTitle(detail) : "";
  const cover = detail ? getCover(detail) : "";
  const score = detail?.averageScore ? (detail.averageScore / 10).toFixed(1) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <Link to={`/wiki/${id}`} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-300 mb-5 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> Back to Wiki
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Player + Info */}
        <div className="space-y-4">
          {/* Player */}
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#111", border: "1px solid #222" }}>
            <div className="relative bg-black flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
              {selectedEp?.image && (
                <img src={selectedEp.image} alt="" className="w-full h-full object-cover opacity-25 absolute inset-0" />
              )}
              <div className="relative flex flex-col items-center gap-3 z-10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(245,166,35,0.2)", border: "1px solid rgba(245,166,35,0.4)" }}>
                  <Play className="w-7 h-7 fill-white text-white ml-1" />
                </div>
                {selectedEp && (
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">Episode {selectedEp.number}</p>
                    {selectedEp.title && <p className="text-gray-500 text-xs mt-0.5">{selectedEp.title}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg p-4" style={{ backgroundColor: "#111", border: "1px solid #222" }}>
            <div className="flex gap-4">
              {cover && <img src={cover} alt={title} className="w-16 rounded shrink-0" />}
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-white mb-1 uppercase">{title}</h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  {score && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "#f5a623", color: "#000" }}>
                      <Star className="w-2.5 h-2.5 fill-black" />{score}
                    </span>
                  )}
                  {detail?.format && <span className="text-xs text-gray-500 px-2 py-0.5 rounded" style={{ backgroundColor: "#1a1a1a" }}>{detail.format}</span>}
                  {detail?.status && <span className="text-xs text-gray-500 px-2 py-0.5 rounded" style={{ backgroundColor: "#1a1a1a" }}>{detail.status}</span>}
                </div>
                {detail?.description && (
                  <p className="text-xs text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: detail.description.replace(/<[^>]+>/g, "") }} />
                )}
                <button onClick={() => setShowLibrary(true)} className="btn-primary text-xs h-7 px-3 mt-3">
                  <BookOpen className="w-3 h-3" /> Library
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Episode list */}
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#111", border: "1px solid #222" }}>
          <button
            onClick={() => setShowEpList((v) => !v)}
            className="w-full flex items-center justify-between p-4 border-b text-sm font-semibold text-white hover:bg-white/5 transition-colors"
            style={{ borderColor: "#222" }}
          >
            <div className="flex items-center gap-2">
              <List className="w-4 h-4" style={{ color: "#f5a623" }} />
              Episodes {episodes.length > 0 && `(${episodes.length})`}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showEpList ? "rotate-180" : ""}`} />
          </button>

          {showEpList && (
            <div className="overflow-y-auto" style={{ maxHeight: "520px" }}>
              {epsLoading ? (
                <div className="p-4 text-center text-xs text-gray-600">Loading episodes…</div>
              ) : episodes.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-600">No episodes found</div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {episodes.map((ep) => {
                    const active = selectedEp?.number === ep.number;
                    return (
                      <button
                        key={ep.id || ep.number}
                        onClick={() => pickEp(ep)}
                        className="w-full text-left px-3 py-2.5 rounded transition-colors flex items-center gap-2"
                        style={{
                          backgroundColor: active ? "rgba(245,166,35,0.15)" : "transparent",
                          border: active ? "1px solid rgba(245,166,35,0.3)" : "1px solid transparent",
                        }}
                      >
                        <span className="text-xs font-bold w-7 shrink-0" style={{ color: active ? "#f5a623" : "#555" }}>
                          {ep.number}
                        </span>
                        <span className="text-xs text-gray-300 truncate flex-1">
                          {ep.title || `Episode ${ep.number}`}
                        </span>
                        {active && <Play className="w-3 h-3 shrink-0" style={{ color: "#f5a623", fill: "#f5a623" }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showLibrary && detail && (
        <LibraryModal item={detail} mediaType="ANIME" onClose={() => setShowLibrary(false)} />
      )}
    </div>
  );
}

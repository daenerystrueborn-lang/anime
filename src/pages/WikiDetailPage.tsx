import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Star, Play, BookOpen, Film, Calendar } from "lucide-react";
import { apiFetch } from "../lib/api";
import { LoadingPage } from "../components/LoadingSpinner";
import LibraryModal from "../components/LibraryModal";
import { MediaItem, getTitle, getCover } from "../components/AnimeCard";

interface WikiDetail extends MediaItem {
  description?: string;
  tags?: { name: string; rank?: number }[];
  relations?: { edges?: { relationType?: string; node?: MediaItem }[] };
  characters?: { edges?: { node?: { id: number; name?: { full?: string }; image?: { large?: string } }; role?: string }[] };
  source?: string;
  studios?: { nodes?: { name?: string }[] };
}

const TABS = ["About", "Characters", "Relations"] as const;
type Tab = typeof TABS[number];

export default function WikiDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("About");
  const [showLibrary, setShowLibrary] = useState(false);

  const { data: detail, isLoading } = useQuery<WikiDetail>({
    queryKey: ["wiki-detail", id],
    queryFn: async () => {
      const res = await apiFetch<{ data?: { Media?: WikiDetail } }>(`/api/anime/details/${id}`);
      return res?.data?.Media || (res as unknown as WikiDetail);
    },
    enabled: !!id,
  });

  if (isLoading) return <LoadingPage />;

  const title = detail ? getTitle(detail) : "";
  const cover = detail ? getCover(detail) : "";
  const score = detail?.averageScore ? (detail.averageScore / 10).toFixed(1) : null;
  const isAnime = detail?.type === "ANIME" || detail?.episodes != null;
  const mediaType = isAnime ? "ANIME" : "MANGA";
  const relations = detail?.relations?.edges || [];
  const characters = detail?.characters?.edges || [];

  return (
    <div className="animate-fade-in" style={{ backgroundColor: "#000" }}>
      {/* Banner */}
      {detail?.bannerImage && (
        <div className="relative h-44 sm:h-64 overflow-hidden">
          <img src={detail.bannerImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, #000 100%)" }} />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <Link to="/wiki" className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-300 mt-4 mb-4 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Wiki
        </Link>

        {/* Header */}
        <div className={`flex gap-5 ${detail?.bannerImage ? "-mt-16" : ""} mb-6 relative z-10`}>
          {cover && (
            <img src={cover} alt={title} className="w-28 sm:w-36 rounded-lg shadow-2xl shrink-0 ring-1 ring-white/10" />
          )}
          <div className="pt-2 sm:pt-6 min-w-0 flex-1">
            {/* Format / genres */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {detail?.format && (
                <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: "rgba(245,166,35,0.15)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.3)" }}>
                  {detail.format}
                </span>
              )}
              {detail?.status && (
                <span className="text-xs px-2 py-0.5 rounded text-gray-400" style={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}>
                  {detail.status}
                </span>
              )}
              {detail?.genres?.slice(0, 3).map((g) => (
                <Link key={g} to={`/anime?genre=${encodeURIComponent(g)}`} className="text-xs px-2 py-0.5 rounded text-gray-500 hover:text-gray-300 transition-colors" style={{ backgroundColor: "#111", border: "1px solid #222" }}>
                  {g}
                </Link>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-1 uppercase">{title}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
              {score && (
                <span className="flex items-center gap-1 text-yellow-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" /> {score}
                </span>
              )}
              {detail?.episodes && <span className="flex items-center gap-1"><Film className="w-3.5 h-3.5" />{detail.episodes} eps</span>}
              {detail?.chapters && <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{detail.chapters} ch</span>}
              {detail?.seasonYear && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{detail.season && `${detail.season} `}{detail.seasonYear}</span>}
            </div>

            <div className="flex flex-wrap gap-2">
              {isAnime && (
                <Link to={`/watch/${id}`} className="btn-watch text-sm py-2 px-4">
                  <Play className="w-3.5 h-3.5 fill-white" /> Watch Now
                </Link>
              )}
              <button onClick={() => setShowLibrary(true)} className="btn-wiki text-sm py-2 px-4">
                <BookOpen className="w-3.5 h-3.5" /> Add to Library
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b mb-6" style={{ borderColor: "#222" }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2.5 text-sm font-medium transition-colors border-b-2"
              style={{
                borderColor: tab === t ? "#f5a623" : "transparent",
                color: tab === t ? "#f5a623" : "#666",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="pb-16">
          {tab === "About" && (
            <div className="space-y-6 max-w-3xl">
              {detail?.description && (
                <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: detail.description }} />
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Format", value: detail?.format },
                  { label: "Status", value: detail?.status },
                  { label: "Episodes", value: detail?.episodes },
                  { label: "Chapters", value: detail?.chapters },
                  { label: "Year", value: detail?.seasonYear },
                  { label: "Season", value: detail?.season },
                  { label: "Source", value: detail?.source },
                  { label: "Studio", value: detail?.studios?.nodes?.[0]?.name },
                ].filter((f) => f.value).map((f) => (
                  <div key={f.label} className="rounded p-3" style={{ backgroundColor: "#111", border: "1px solid #222" }}>
                    <p className="text-xs text-gray-600 mb-1">{f.label}</p>
                    <p className="text-sm text-white font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Characters" && (
            characters.length === 0 ? (
              <div className="text-center py-16 text-gray-600">No character data available</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {characters.map((edge, i) => {
                  const char = edge.node;
                  if (!char) return null;
                  return (
                    <div key={char.id || i} className="rounded overflow-hidden" style={{ backgroundColor: "#111", border: "1px solid #222" }}>
                      {char.image?.large && (
                        <div className="aspect-[3/4] overflow-hidden">
                          <img src={char.image.large} alt={char.name?.full} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-medium text-white line-clamp-1">{char.name?.full}</p>
                        {edge.role && <p className="text-xs text-gray-600">{edge.role}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {tab === "Relations" && (
            relations.length === 0 ? (
              <div className="text-center py-16 text-gray-600">No relation data available</div>
            ) : (
              <div className="space-y-6">
                {["SEQUEL","PREQUEL","ADAPTATION","SIDE_STORY","OTHER"].map((relType) => {
                  const rels = relations.filter((r) => r.relationType?.toUpperCase() === relType && r.node);
                  if (!rels.length) return null;
                  const label = relType.charAt(0) + relType.slice(1).toLowerCase().replace("_"," ");
                  return (
                    <div key={relType}>
                      <h3 className="text-sm font-semibold mb-3" style={{ color: "#f5a623" }}>{label}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {rels.map((rel, i) => rel.node && <Link key={i} to={`/wiki/${rel.node.id}`}><div className="rounded overflow-hidden hover:border-accent/50 transition-all" style={{ backgroundColor: "#111", border: "1px solid #222" }}>{typeof rel.node.coverImage !== "string" && rel.node.coverImage?.large && <div className="aspect-[3/4] overflow-hidden"><img src={rel.node.coverImage.large} alt="" className="w-full h-full object-cover" loading="lazy" /></div>}<div className="p-2"><p className="text-xs font-medium text-white line-clamp-2">{getTitle(rel.node)}</p></div></div></Link>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {showLibrary && detail && (
        <LibraryModal item={detail} mediaType={mediaType} onClose={() => setShowLibrary(false)} />
      )}
    </div>
  );
}

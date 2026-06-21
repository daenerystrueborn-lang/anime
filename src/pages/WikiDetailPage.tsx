import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft, Star, Play, BookOpen, Users, Heart,
  Clock, Film, Calendar, ExternalLink, ArrowRight
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { LoadingPage } from "../components/LoadingSpinner";
import LibraryModal from "../components/LibraryModal";
import { MediaItem } from "../components/AnimeCard";

interface Character {
  id: number;
  name?: { full?: string; native?: string };
  image?: { large?: string };
  gender?: string;
  age?: string;
  description?: string;
}

interface CharacterEdge {
  node?: Character;
  role?: string;
  voiceActors?: { id: number; name?: { full?: string }; image?: { large?: string } }[];
}

interface Relation {
  relationType?: string;
  node?: MediaItem;
}

interface WikiDetail extends MediaItem {
  description?: string;
  tags?: { name: string; rank?: number }[];
  relations?: { edges?: { relationType?: string; node?: MediaItem }[] };
  characters?: { edges?: CharacterEdge[] };
  trailer?: { id?: string; site?: string };
  source?: string;
  studios?: { nodes?: { name?: string }[] };
  recommendations?: { nodes?: { mediaRecommendation?: MediaItem }[] };
}

interface DetailsResponse {
  data?: { Media?: WikiDetail };
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
      const res = await apiFetch<DetailsResponse>(`/api/anime/details/${id}`);
      return res?.data?.Media || (res as unknown as WikiDetail);
    },
    enabled: !!id,
  });

  if (isLoading) return <LoadingPage />;

  const title =
    typeof detail?.title === "string"
      ? detail.title
      : detail?.title?.english || detail?.title?.romaji || "Unknown";

  const cover =
    typeof detail?.coverImage === "string"
      ? detail.coverImage
      : detail?.coverImage?.large || detail?.coverImage?.medium || "";

  const score = detail?.averageScore ? (detail.averageScore / 10).toFixed(1) : null;
  const isAnime = detail?.type === "ANIME" || detail?.format === "TV" || detail?.episodes != null;
  const mediaType = isAnime ? "ANIME" : "MANGA";

  const relations = detail?.relations?.edges || [];
  const characters = detail?.characters?.edges || [];

  return (
    <div className="animate-fade-in">
      {detail?.bannerImage && (
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img
            src={detail.bannerImage}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface" />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`flex gap-6 ${detail?.bannerImage ? "-mt-20" : "mt-6"} mb-6 relative z-10`}>
          {cover && (
            <div className="shrink-0">
              <img
                src={cover}
                alt={title}
                className="w-28 sm:w-40 rounded-xl shadow-2xl ring-2 ring-white/10"
              />
            </div>
          )}
          <div className="pt-6 sm:pt-8 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              {detail?.format && (
                <span className="badge bg-primary-500/20 text-primary-300 border border-primary-500/30">
                  {detail.format}
                </span>
              )}
              {detail?.status && (
                <span className="badge bg-white/10 text-gray-300">
                  {detail.status}
                </span>
              )}
              {detail?.genres?.slice(0, 3).map((g) => (
                <span key={g} className="badge bg-white/5 text-gray-400 border border-white/10">
                  {g}
                </span>
              ))}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
              {title}
            </h1>
            {detail?.title && typeof detail.title !== "string" && detail.title.romaji && (
              <p className="text-gray-500 text-sm mb-3">{detail.title.romaji}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
              {score && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  <span className="font-bold">{score}</span>
                </span>
              )}
              {detail?.episodes && (
                <span className="flex items-center gap-1">
                  <Film className="w-4 h-4 text-gray-500" />
                  {detail.episodes} episodes
                </span>
              )}
              {detail?.chapters && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  {detail.chapters} chapters
                </span>
              )}
              {(detail?.seasonYear || detail?.year) && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {detail.season && `${detail.season} `}{detail.seasonYear || detail.year}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {isAnime && (
                <Link to={`/watch/${id}`} className="btn-primary text-sm h-9 px-4">
                  <Play className="w-4 h-4 fill-white" />
                  Watch
                </Link>
              )}
              <button
                onClick={() => setShowLibrary(true)}
                className="btn-secondary text-sm h-9 px-4"
              >
                <BookOpen className="w-4 h-4" />
                Add to Library
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-border mb-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-primary-500 text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="pb-12">
          {tab === "About" && (
            <div className="space-y-6 max-w-3xl">
              {detail?.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Synopsis</h3>
                  <p
                    className="text-sm text-gray-400 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: detail.description,
                    }}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Format", value: detail?.format },
                  { label: "Status", value: detail?.status },
                  { label: "Episodes", value: detail?.episodes },
                  { label: "Chapters", value: detail?.chapters },
                  { label: "Duration", value: detail?.episodes && "~ 24 min" },
                  { label: "Year", value: detail?.seasonYear || detail?.year },
                  { label: "Season", value: detail?.season },
                  { label: "Source", value: detail?.source },
                  { label: "Studio", value: detail?.studios?.nodes?.[0]?.name },
                ].filter((f) => f.value).map((f) => (
                  <div key={f.label} className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{f.label}</p>
                    <p className="text-sm text-white font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
              {detail?.genres && detail.genres.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {detail.genres.map((g) => (
                      <Link
                        key={g}
                        to={`/anime?genre=${encodeURIComponent(g)}`}
                        className="badge bg-white/5 border border-white/10 text-gray-400 hover:text-primary-400 hover:border-primary-500/30 transition-colors"
                      >
                        {g}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "Characters" && (
            <div>
              {characters.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No character data available</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {characters.map((edge, i) => {
                    const char = edge.node;
                    if (!char) return null;
                    const charName = char.name?.full || "Unknown";
                    const charImg = char.image?.large || "";
                    return (
                      <Link
                        key={char.id || i}
                        to={`/wiki/character-${char.id}`}
                        className="card hover:border-primary-500/50 transition-all group"
                      >
                        {charImg && (
                          <div className="aspect-[3/4] overflow-hidden bg-white/5">
                            <img
                              src={charImg}
                              alt={charName}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-100 line-clamp-1">{charName}</p>
                          {edge.role && (
                            <p className="text-xs text-gray-500 mt-0.5">{edge.role}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "Relations" && (
            <div>
              {relations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No relation data available</div>
              ) : (
                <div className="space-y-6">
                  {["SEQUEL", "PREQUEL", "ADAPTATION", "SIDE_STORY", "SUMMARY", "OTHER"].map((relType) => {
                    const rels = relations.filter(
                      (r) => r.relationType?.toUpperCase() === relType && r.node
                    );
                    if (!rels.length) return null;
                    const label = relType.charAt(0) + relType.slice(1).toLowerCase().replace("_", " ");
                    return (
                      <div key={relType}>
                        <h3 className="text-sm font-semibold text-gray-300 mb-3">{label}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {rels.map((rel, i) => {
                            const node = rel.node!;
                            const relTitle = typeof node.title === "string"
                              ? node.title
                              : node.title?.english || node.title?.romaji || "";
                            const relCover = typeof node.coverImage === "string"
                              ? node.coverImage
                              : node.coverImage?.large || "";
                            return (
                              <Link
                                key={i}
                                to={`/wiki/${node.id}`}
                                className="card hover:border-primary-500/50 transition-all group"
                              >
                                {relCover && (
                                  <div className="aspect-[3/4] overflow-hidden bg-white/5">
                                    <img
                                      src={relCover}
                                      alt={relTitle}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                                <div className="p-3">
                                  <p className="text-xs text-primary-400 font-medium mb-1">{label}</p>
                                  <p className="text-sm font-medium text-gray-100 line-clamp-2">{relTitle}</p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showLibrary && detail && (
        <LibraryModal
          item={detail}
          mediaType={mediaType}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
}

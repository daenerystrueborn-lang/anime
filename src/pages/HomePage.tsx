import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, Play, BookOpen, ChevronLeft, ChevronRight, Star, ChevronRight as SeeAll } from "lucide-react";
import { apiFetch } from "../lib/api";
import AnimeCard, { MediaItem, getTitle, getCover } from "../components/AnimeCard";
import { SkeletonCard } from "../components/LoadingSpinner";

const TYPE_TABS = ["Anime", "Manhwa", "Movies", "Novels"] as const;
type TypeTab = typeof TYPE_TABS[number];

const TYPE_MAP: Record<TypeTab, string> = {
  Anime: "ANIME",
  Manhwa: "MANGA",
  Movies: "ANIME",
  Novels: "MANGA",
};

interface TrendingResponse {
  data?: { trending?: { media?: MediaItem[] } };
  results?: MediaItem[];
}

function useTrending(type: string) {
  return useQuery<MediaItem[]>({
    queryKey: ["trending", type],
    queryFn: async () => {
      const res = await apiFetch<TrendingResponse>(`/api/anime/trending?type=${type}&perPage=24`);
      return res?.data?.trending?.media || res?.results || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/* ── Hero Carousel ─────────────────────────────────────────────── */
function HeroCarousel({ items }: { items: MediaItem[] }) {
  const [index, setIndex] = useState(0);

  const prev = useCallback(() => setIndex((i) => (i === 0 ? items.length - 1 : i - 1)), [items.length]);
  const next = useCallback(() => setIndex((i) => (i === items.length - 1 ? 0 : i + 1)), [items.length]);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(next, 7000);
    return () => clearInterval(t);
  }, [next, items.length]);

  if (!items.length) return null;

  const item = items[index];
  const title = getTitle(item);
  const banner = item.bannerImage || getCover(item);
  const score = item.averageScore ? (item.averageScore / 10).toFixed(1) : null;
  const genres = item.genres?.slice(0, 2).join(" / ") || "";
  const year = item.seasonYear || item.year || "";
  const format = item.format || "TV";

  // description — strip html tags, clamp
  const rawDesc = typeof (item as MediaItem & { description?: string }).description === "string"
    ? ((item as MediaItem & { description?: string }).description || "").replace(/<[^>]+>/g, "")
    : "";

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "clamp(360px, 52vw, 560px)" }}>
      {/* Background */}
      <div
        key={index}
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{ backgroundImage: `url(${banner})` }}
      />
      {/* Overlays */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.1) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)" }} />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-xl animate-fade-in" key={`content-${index}`}>
            {/* Trending badge */}
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "#f5a623" }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#f5a623" }}>
                Trending This Week
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-none mb-2 tracking-tight uppercase">
              {title}
            </h1>

            {/* Meta */}
            <p className="text-sm text-gray-400 mb-2">
              {format}{year ? ` · ${year}` : ""}{genres ? ` · ${genres}` : ""}
            </p>

            {/* Description */}
            {rawDesc && (
              <p className="text-sm text-gray-300 leading-relaxed mb-4 line-clamp-3 max-w-md">
                {rawDesc}
              </p>
            )}

            {/* Score */}
            {score && (
              <div className="flex items-center gap-1.5 mb-5">
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
                  style={{ backgroundColor: "#f5a623", color: "#000" }}
                >
                  <Star className="w-3 h-3 fill-black" />
                  {score}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <Link to={`/watch/${item.id}`} className="btn-watch">
                <Play className="w-4 h-4 fill-white" />
                Watch Now
              </Link>
              <Link to={`/wiki/${item.id}`} className="btn-wiki">
                <BookOpen className="w-4 h-4" />
                Wiki Page
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel nav — dots + arrows on right */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
        <button onClick={prev} className="text-white/50 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex flex-col gap-1.5">
          {items.slice(0, 8).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="w-1 rounded-full transition-all duration-300"
              style={{
                height: i === index ? "20px" : "6px",
                backgroundColor: i === index ? "#f5a623" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
        <button onClick={next} className="text-white/50 hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Ad Banner ─────────────────────────────────────────────────── */
function AdBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-4">
      <div
        className="w-full py-5 flex items-center justify-center text-xs text-gray-600 tracking-widest uppercase rounded"
        style={{ border: "1px dashed #333" }}
      >
        Advertisement
      </div>
    </div>
  );
}

/* ── Section Row ───────────────────────────────────────────────── */
function SectionRow({
  title,
  items,
  loading,
  seeAllTo,
  showRank = false,
}: {
  title: string;
  items: MediaItem[];
  loading: boolean;
  seeAllTo: string;
  showRank?: boolean;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white">{title}</h2>
        <Link
          to={seeAllTo}
          className="flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          See all <SeeAll className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : items.slice(0, 8).map((item, i) => (
              <AnimeCard key={item.id} item={item} rank={showRank ? i + 1 : undefined} />
            ))}
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TypeTab>("Anime");
  const apiType = TYPE_MAP[activeTab];

  const { data: heroItems = [], isLoading: heroLoading } = useTrending("ANIME");
  const { data: tabItems = [], isLoading: tabLoading } = useTrending(apiType);

  const { data: mangaItems = [], isLoading: mangaLoading } = useQuery<MediaItem[]>({
    queryKey: ["trending-manga-home"],
    queryFn: async () => {
      const res = await apiFetch<TrendingResponse>("/api/anime/trending?type=MANGA&perPage=8");
      return res?.data?.trending?.media || res?.results || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div style={{ backgroundColor: "#000" }}>
      {/* Hero */}
      {heroLoading ? (
        <div className="shimmer w-full" style={{ height: "clamp(360px,52vw,560px)" }} />
      ) : (
        <HeroCarousel items={heroItems} />
      )}

      {/* Ad */}
      <AdBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {/* Type tabs */}
        <div className="flex items-center gap-1.5 mb-6 mt-2">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`type-tab ${activeTab === tab ? "type-tab-active" : "type-tab-inactive"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Top 10 for active tab */}
        <SectionRow
          title={`Top 10 ${activeTab}`}
          items={tabItems}
          loading={tabLoading}
          seeAllTo={`/rankings?type=${apiType}`}
          showRank
        />

        {/* Top Manga row */}
        <SectionRow
          title="Top Manga"
          items={mangaItems}
          loading={mangaLoading}
          seeAllTo="/rankings?type=MANGA"
        />

        {/* Trending this season */}
        <SectionRow
          title="Trending This Season"
          items={heroItems.slice(8)}
          loading={heroLoading}
          seeAllTo="/anime?sort=trending"
        />
      </div>
    </div>
  );
}

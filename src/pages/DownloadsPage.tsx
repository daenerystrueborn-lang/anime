import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Search, BookOpen, BookMarked, Loader2, ChevronDown, ChevronRight, ExternalLink, FileText } from "lucide-react";
import { apiFetch } from "../lib/api";

type DownloadMode = "manga" | "novel";

interface MangaSearchResult {
  title: string;
  url: string;
  cover?: string;
  latestChapter?: string;
}

interface MangaChapter {
  title: string;
  url: string;
  number?: string | number;
}

interface MangaSeriesDetail {
  title?: string;
  cover?: string;
  chapters?: MangaChapter[];
}

interface NovelBook {
  title: string;
  slug: string;
  cover?: string;
  author?: string;
  description?: string;
  latestChapter?: string;
}

interface NovelBookDetail {
  title?: string;
  cover?: string;
  author?: string;
  description?: string;
  downloadUrl?: string;
  url?: string;
}

interface NovelSearchResponse {
  results?: NovelBook[];
  books?: NovelBook[];
}

interface MangaSearchResponse {
  results?: MangaSearchResult[];
}

interface MangaSeriesResponse {
  series?: MangaSeriesDetail;
  results?: MangaSeriesDetail;
}

interface NovelBookResponse {
  book?: NovelBookDetail;
  results?: NovelBookDetail;
}

const NOVEL_FORMATS = ["epub", "pdf", "txt"] as const;
type NovelFormat = typeof NOVEL_FORMATS[number];

export default function DownloadsPage() {
  const [mode, setMode] = useState<DownloadMode>("manga");

  const [mangaQuery, setMangaQuery] = useState("");
  const [mangaInput, setMangaInput] = useState("");
  const [selectedSeries, setSelectedSeries] = useState<MangaSearchResult | null>(null);
  const [expandedChapters, setExpandedChapters] = useState(false);
  const [downloadingChapter, setDownloadingChapter] = useState<string | null>(null);

  const [novelQuery, setNovelQuery] = useState("");
  const [novelInput, setNovelInput] = useState("");
  const [selectedNovel, setSelectedNovel] = useState<NovelBook | null>(null);
  const [novelFormat, setNovelFormat] = useState<NovelFormat>("epub");
  const [downloading, setDownloading] = useState(false);

  const { data: mangaResults = [], isLoading: mangaSearching } = useQuery<MangaSearchResult[]>({
    queryKey: ["manga-search", mangaQuery],
    queryFn: async () => {
      const res = await apiFetch<MangaSearchResponse>(
        `/api/mangapill/search?q=${encodeURIComponent(mangaQuery)}`
      );
      return res?.results || [];
    },
    enabled: !!mangaQuery,
  });

  const { data: seriesDetail, isLoading: seriesLoading } = useQuery<MangaSeriesDetail>({
    queryKey: ["manga-series", selectedSeries?.url],
    queryFn: async () => {
      const res = await apiFetch<MangaSeriesResponse>(
        `/api/mangapill/series?url=${encodeURIComponent(selectedSeries!.url)}`
      );
      return res?.series || res?.results || {};
    },
    enabled: !!selectedSeries?.url,
  });

  const { data: popularNovels = [], isLoading: popularLoading } = useQuery<NovelBook[]>({
    queryKey: ["novel-popular"],
    queryFn: async () => {
      const res = await apiFetch<NovelSearchResponse>("/api/novelfire/popular");
      return res?.results || res?.books || [];
    },
    enabled: mode === "novel" && !novelQuery,
  });

  const { data: novelResults = [], isLoading: novelSearching } = useQuery<NovelBook[]>({
    queryKey: ["novel-search", novelQuery],
    queryFn: async () => {
      const res = await apiFetch<NovelSearchResponse>(
        `/api/novelfire/search?q=${encodeURIComponent(novelQuery)}`
      );
      return res?.results || res?.books || [];
    },
    enabled: !!novelQuery,
  });

  const { data: novelDetail, isLoading: novelDetailLoading } = useQuery<NovelBookDetail>({
    queryKey: ["novel-detail", selectedNovel?.slug],
    queryFn: async () => {
      const res = await apiFetch<NovelBookResponse>(
        `/api/novelfire/book?slug=${encodeURIComponent(selectedNovel!.slug)}`
      );
      return res?.book || res?.results || {};
    },
    enabled: !!selectedNovel?.slug,
  });

  function handleMangaSearch(e: React.FormEvent) {
    e.preventDefault();
    setMangaQuery(mangaInput.trim());
    setSelectedSeries(null);
  }

  function handleNovelSearch(e: React.FormEvent) {
    e.preventDefault();
    setNovelQuery(novelInput.trim());
    setSelectedNovel(null);
  }

  async function downloadChapter(chapterUrl: string, chapterTitle: string) {
    setDownloadingChapter(chapterUrl);
    try {
      const url = `/api/mangapill/download?url=${encodeURIComponent(chapterUrl)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${chapterTitle.replace(/[^\w\s-]/g, "")}.cbz`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Chapter download error:", err);
    } finally {
      setDownloadingChapter(null);
    }
  }

  async function downloadNovel() {
    if (!novelDetail) return;
    const url = novelDetail.downloadUrl || novelDetail.url;
    if (!url) return;
    setDownloading(true);
    try {
      const downloadUrl = `/api/novelfire/download?url=${encodeURIComponent(url)}&format=${novelFormat}`;
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${(novelDetail.title || "novel").replace(/[^\w\s-]/g, "")}.${novelFormat}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Novel download error:", err);
    } finally {
      setDownloading(false);
    }
  }

  const displayNovels = novelQuery ? novelResults : popularNovels;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Download className="w-6 h-6 text-primary-400" />
          Downloads
        </h1>
        <p className="text-gray-500 text-sm">Download manga chapters and novel books</p>
      </div>

      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-8 max-w-xs">
        {(["manga", "novel"] as DownloadMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              mode === m
                ? "bg-primary-600 text-white shadow"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {m === "manga" ? <BookOpen className="w-4 h-4" /> : <BookMarked className="w-4 h-4" />}
            {m === "manga" ? "Manga" : "Novels"}
          </button>
        ))}
      </div>

      {mode === "manga" && (
        <div className="space-y-6">
          <form onSubmit={handleMangaSearch} className="flex gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={mangaInput}
                onChange={(e) => setMangaInput(e.target.value)}
                placeholder="Search manga title..."
                className="input pl-11 h-11"
              />
            </div>
            <button type="submit" className="btn-primary h-11 px-6">Search</button>
          </form>

          {mangaSearching && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching...
            </div>
          )}

          {mangaResults.length > 0 && !selectedSeries && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mangaResults.map((m) => (
                <button
                  key={m.url}
                  onClick={() => setSelectedSeries(m)}
                  className="card p-4 text-left hover:border-primary-500/50 transition-all group"
                >
                  <div className="flex gap-3 items-start">
                    {m.cover && (
                      <img
                        src={m.cover}
                        alt={m.title}
                        className="w-12 h-16 object-cover rounded-lg shrink-0"
                        loading="lazy"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary-400 transition-colors">
                        {m.title}
                      </p>
                      {m.latestChapter && (
                        <p className="text-xs text-gray-500 mt-1">Latest: {m.latestChapter}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedSeries && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(seriesDetail?.cover || selectedSeries.cover) && (
                    <img
                      src={seriesDetail?.cover || selectedSeries.cover}
                      alt={selectedSeries.title}
                      className="w-12 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-white">{selectedSeries.title}</h3>
                    {seriesDetail?.chapters && (
                      <p className="text-xs text-gray-500 mt-0.5">{seriesDetail.chapters.length} chapters</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSeries(null)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Change
                </button>
              </div>

              {seriesLoading ? (
                <div className="p-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading chapters...
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setExpandedChapters((v) => !v)}
                    className="w-full flex items-center justify-between p-4 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium">Chapters ({seriesDetail?.chapters?.length || 0})</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedChapters ? "rotate-180" : ""}`} />
                  </button>
                  {expandedChapters && (
                    <div className="max-h-96 overflow-y-auto border-t border-border">
                      {(seriesDetail?.chapters || []).map((ch, i) => (
                        <div
                          key={ch.url || i}
                          className="flex items-center justify-between px-4 py-3 hover:bg-white/5 border-b border-border/50 transition-colors"
                        >
                          <span className="text-sm text-gray-300">{ch.title || `Chapter ${ch.number || i + 1}`}</span>
                          <button
                            onClick={() => downloadChapter(ch.url, ch.title || `chapter-${ch.number || i + 1}`)}
                            disabled={downloadingChapter === ch.url}
                            className="btn-secondary text-xs h-7 px-3"
                          >
                            {downloadingChapter === ch.url ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                            {downloadingChapter === ch.url ? "..." : "CBZ"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {mode === "novel" && (
        <div className="space-y-6">
          <form onSubmit={handleNovelSearch} className="flex gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={novelInput}
                onChange={(e) => setNovelInput(e.target.value)}
                placeholder="Search novel title..."
                className="input pl-11 h-11"
              />
            </div>
            <button type="submit" className="btn-primary h-11 px-6">Search</button>
          </form>

          {selectedNovel && (
            <div className="card p-4 space-y-4">
              <div className="flex gap-4">
                {novelDetail?.cover && (
                  <img src={novelDetail.cover} alt="" className="w-20 h-28 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white mb-1">{novelDetail?.title || selectedNovel.title}</p>
                  {novelDetail?.author && (
                    <p className="text-xs text-gray-500 mb-2">by {novelDetail.author}</p>
                  )}
                  {novelDetail?.description && (
                    <p className="text-xs text-gray-400 line-clamp-3">{novelDetail.description}</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Download format:</p>
                <div className="flex gap-2 mb-3">
                  {NOVEL_FORMATS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setNovelFormat(f)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all uppercase ${
                        novelFormat === f
                          ? "bg-primary-600 text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={downloadNovel}
                    disabled={downloading || novelDetailLoading}
                    className="btn-primary text-sm"
                  >
                    {downloading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Downloading...</>
                    ) : (
                      <><Download className="w-4 h-4" /> Download {novelFormat.toUpperCase()}</>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedNovel(null)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {!selectedNovel && (
            <>
              {(novelSearching || popularLoading) && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {novelQuery ? "Searching..." : "Loading popular novels..."}
                </div>
              )}
              {!novelQuery && !popularLoading && (
                <h2 className="text-sm font-semibold text-gray-400">Popular Novels</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayNovels.map((novel) => (
                  <button
                    key={novel.slug}
                    onClick={() => setSelectedNovel(novel)}
                    className="card p-4 text-left hover:border-primary-500/50 transition-all group"
                  >
                    <div className="flex gap-3">
                      {novel.cover && (
                        <img
                          src={novel.cover}
                          alt={novel.title}
                          className="w-12 h-16 object-cover rounded-lg shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary-400 transition-colors">
                          {novel.title}
                        </p>
                        {novel.author && (
                          <p className="text-xs text-gray-500 mt-1">by {novel.author}</p>
                        )}
                        {novel.latestChapter && (
                          <p className="text-xs text-gray-600 mt-1 truncate">{novel.latestChapter}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

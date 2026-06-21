import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Search, BookOpen, BookMarked, Loader2, ChevronDown, FileText } from "lucide-react";
import { apiFetch } from "../lib/api";

type Mode = "manga" | "novel";
type NovelFormat = "epub" | "pdf" | "txt";

interface MangaResult { title: string; url: string; cover?: string; latestChapter?: string; }
interface MangaChapter { title: string; url: string; number?: string | number; }
interface MangaSeries { title?: string; cover?: string; chapters?: MangaChapter[]; }
interface NovelBook { title: string; slug: string; cover?: string; author?: string; latestChapter?: string; }
interface NovelDetail { title?: string; cover?: string; author?: string; description?: string; downloadUrl?: string; url?: string; }

export default function DownloadsPage() {
  const [mode, setMode] = useState<Mode>("manga");

  const [mangaInput, setMangaInput] = useState("");
  const [mangaQuery, setMangaQuery] = useState("");
  const [selectedSeries, setSelectedSeries] = useState<MangaResult | null>(null);
  const [expandedChapters, setExpandedChapters] = useState(false);
  const [downloadingChapter, setDownloadingChapter] = useState<string | null>(null);

  const [novelInput, setNovelInput] = useState("");
  const [novelQuery, setNovelQuery] = useState("");
  const [selectedNovel, setSelectedNovel] = useState<NovelBook | null>(null);
  const [novelFormat, setNovelFormat] = useState<NovelFormat>("epub");
  const [downloading, setDownloading] = useState(false);

  const { data: mangaResults = [], isLoading: mangaSearching } = useQuery<MangaResult[]>({
    queryKey: ["manga-search", mangaQuery],
    queryFn: async () => {
      const res = await apiFetch<{ results?: MangaResult[] }>(`/api/mangapill/search?q=${encodeURIComponent(mangaQuery)}`);
      return res?.results || [];
    },
    enabled: !!mangaQuery,
  });

  const { data: seriesDetail, isLoading: seriesLoading } = useQuery<MangaSeries>({
    queryKey: ["manga-series", selectedSeries?.url],
    queryFn: async () => {
      const res = await apiFetch<{ series?: MangaSeries; results?: MangaSeries }>(`/api/mangapill/series?url=${encodeURIComponent(selectedSeries!.url)}`);
      return res?.series || res?.results || {};
    },
    enabled: !!selectedSeries?.url,
  });

  const { data: popularNovels = [], isLoading: popularLoading } = useQuery<NovelBook[]>({
    queryKey: ["novel-popular"],
    queryFn: async () => {
      const res = await apiFetch<{ results?: NovelBook[]; books?: NovelBook[] }>("/api/novelfire/popular");
      return res?.results || res?.books || [];
    },
    enabled: mode === "novel" && !novelQuery,
  });

  const { data: novelResults = [], isLoading: novelSearching } = useQuery<NovelBook[]>({
    queryKey: ["novel-search", novelQuery],
    queryFn: async () => {
      const res = await apiFetch<{ results?: NovelBook[] }>(`/api/novelfire/search?q=${encodeURIComponent(novelQuery)}`);
      return res?.results || [];
    },
    enabled: !!novelQuery,
  });

  const { data: novelDetail, isLoading: novelDetailLoading } = useQuery<NovelDetail>({
    queryKey: ["novel-detail", selectedNovel?.slug],
    queryFn: async () => {
      const res = await apiFetch<{ book?: NovelDetail; results?: NovelDetail }>(`/api/novelfire/book?slug=${encodeURIComponent(selectedNovel!.slug)}`);
      return res?.book || res?.results || {};
    },
    enabled: !!selectedNovel?.slug,
  });

  async function downloadChapter(chapterUrl: string, chapterTitle: string) {
    setDownloadingChapter(chapterUrl);
    try {
      const res = await fetch(`/api/mangapill/download?url=${encodeURIComponent(chapterUrl)}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${chapterTitle.replace(/[^\w\s-]/g, "")}.cbz`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) { console.error(err); } finally { setDownloadingChapter(null); }
  }

  async function downloadNovel() {
    if (!novelDetail) return;
    const url = novelDetail.downloadUrl || novelDetail.url;
    if (!url) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/novelfire/download?url=${encodeURIComponent(url)}&format=${novelFormat}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${(novelDetail.title || "novel").replace(/[^\w\s-]/g, "")}.${novelFormat}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) { console.error(err); } finally { setDownloading(false); }
  }

  const displayNovels = novelQuery ? novelResults : popularNovels;

  const tabStyle = (active: boolean) => ({
    backgroundColor: active ? "#f5a623" : "transparent",
    color: active ? "#000" : "#888",
    border: `1px solid ${active ? "#f5a623" : "#222"}`,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Download className="w-5 h-5" style={{ color: "#f5a623" }} />
        <h1 className="text-xl font-bold text-white">Downloads</h1>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1.5 mb-8">
        {(["manga","novel"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} className="flex items-center gap-2 px-5 py-2 rounded text-sm font-medium transition-all capitalize" style={tabStyle(mode === m)}>
            {m === "manga" ? <BookOpen className="w-4 h-4" /> : <BookMarked className="w-4 h-4" />}
            {m === "manga" ? "Manga" : "Novels"}
          </button>
        ))}
      </div>

      {mode === "manga" && (
        <div className="space-y-5">
          <form onSubmit={(e) => { e.preventDefault(); setMangaQuery(mangaInput.trim()); setSelectedSeries(null); }} className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input type="text" value={mangaInput} onChange={(e) => setMangaInput(e.target.value)} placeholder="Search manga title..." className="input pl-9 h-10" />
            </div>
            <button type="submit" className="px-5 h-10 rounded text-sm font-semibold text-black" style={{ backgroundColor: "#f5a623" }}>Search</button>
          </form>

          {mangaSearching && <div className="flex items-center gap-2 text-xs text-gray-600"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…</div>}

          {mangaResults.length > 0 && !selectedSeries && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mangaResults.map((m) => (
                <button key={m.url} onClick={() => setSelectedSeries(m)} className="text-left p-3 rounded-lg transition-all hover:border-accent/50" style={{ backgroundColor: "#111", border: "1px solid #222" }}>
                  <div className="flex gap-3">
                    {m.cover && <img src={m.cover} alt={m.title} className="w-10 h-14 object-cover rounded shrink-0" loading="lazy" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-2">{m.title}</p>
                      {m.latestChapter && <p className="text-xs text-gray-600 mt-1">{m.latestChapter}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedSeries && (
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#111", border: "1px solid #222" }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "#222" }}>
                <div className="flex items-center gap-3">
                  {(seriesDetail?.cover || selectedSeries.cover) && <img src={seriesDetail?.cover || selectedSeries.cover} alt="" className="w-10 h-14 object-cover rounded" />}
                  <div>
                    <h3 className="font-semibold text-white text-sm">{selectedSeries.title}</h3>
                    {seriesDetail?.chapters && <p className="text-xs text-gray-600">{seriesDetail.chapters.length} chapters</p>}
                  </div>
                </div>
                <button onClick={() => setSelectedSeries(null)} className="text-xs text-gray-600 hover:text-gray-300 transition-colors">Change</button>
              </div>
              {seriesLoading ? (
                <div className="p-4 text-center text-xs text-gray-600"><Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" />Loading chapters…</div>
              ) : (
                <>
                  <button onClick={() => setExpandedChapters((v) => !v)} className="w-full flex items-center justify-between p-3 text-sm text-gray-400 hover:bg-white/5 transition-colors">
                    <span>Chapters ({seriesDetail?.chapters?.length || 0})</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedChapters ? "rotate-180" : ""}`} />
                  </button>
                  {expandedChapters && (
                    <div className="max-h-80 overflow-y-auto border-t" style={{ borderColor: "#222" }}>
                      {(seriesDetail?.chapters || []).map((ch, i) => (
                        <div key={ch.url || i} className="flex items-center justify-between px-4 py-2.5 border-b hover:bg-white/5 transition-colors" style={{ borderColor: "#1a1a1a" }}>
                          <span className="text-xs text-gray-400">{ch.title || `Chapter ${ch.number || i + 1}`}</span>
                          <button onClick={() => downloadChapter(ch.url, ch.title || `chapter-${i + 1}`)} disabled={downloadingChapter === ch.url} className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors text-black" style={{ backgroundColor: "#f5a623" }}>
                            {downloadingChapter === ch.url ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                            CBZ
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {mode === "novel" && (
        <div className="space-y-5">
          <form onSubmit={(e) => { e.preventDefault(); setNovelQuery(novelInput.trim()); setSelectedNovel(null); }} className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input type="text" value={novelInput} onChange={(e) => setNovelInput(e.target.value)} placeholder="Search novel title..." className="input pl-9 h-10" />
            </div>
            <button type="submit" className="px-5 h-10 rounded text-sm font-semibold text-black" style={{ backgroundColor: "#f5a623" }}>Search</button>
          </form>

          {selectedNovel && (
            <div className="rounded-lg p-4 space-y-4" style={{ backgroundColor: "#111", border: "1px solid #222" }}>
              <div className="flex gap-4">
                {novelDetail?.cover && <img src={novelDetail.cover} alt="" className="w-16 h-22 object-cover rounded shrink-0" />}
                <div className="min-w-0">
                  <p className="font-semibold text-white">{novelDetail?.title || selectedNovel.title}</p>
                  {novelDetail?.author && <p className="text-xs text-gray-600 mt-1">by {novelDetail.author}</p>}
                  {novelDetail?.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{novelDetail.description}</p>}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2">Format:</p>
                <div className="flex gap-2 mb-3">
                  {(["epub","pdf","txt"] as NovelFormat[]).map((f) => (
                    <button key={f} onClick={() => setNovelFormat(f)} className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold uppercase transition-all" style={tabStyle(novelFormat === f)}>
                      <FileText className="w-3 h-3" />{f}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={downloadNovel} disabled={downloading || novelDetailLoading} className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-black transition-colors" style={{ backgroundColor: "#f5a623" }}>
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download {novelFormat.toUpperCase()}
                  </button>
                  <button onClick={() => setSelectedNovel(null)} className="px-4 py-2 rounded text-sm text-gray-400 hover:text-white transition-colors" style={{ backgroundColor: "#1a1a1a" }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {!selectedNovel && (
            <>
              {(novelSearching || popularLoading) && <div className="flex items-center gap-2 text-xs text-gray-600"><Loader2 className="w-3.5 h-3.5 animate-spin" />{novelQuery ? "Searching…" : "Loading popular novels…"}</div>}
              {!novelQuery && !popularLoading && <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Popular Novels</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayNovels.map((novel) => (
                  <button key={novel.slug} onClick={() => setSelectedNovel(novel)} className="text-left p-3 rounded-lg transition-all" style={{ backgroundColor: "#111", border: "1px solid #222" }}>
                    <div className="flex gap-3">
                      {novel.cover && <img src={novel.cover} alt={novel.title} className="w-10 h-14 object-cover rounded shrink-0" loading="lazy" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white line-clamp-2">{novel.title}</p>
                        {novel.author && <p className="text-xs text-gray-600 mt-1">by {novel.author}</p>}
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

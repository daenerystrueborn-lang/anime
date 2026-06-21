import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Camera, Loader2, BookOpen, Tv, Trash2, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch, apiUrl } from "../lib/api";

type LibraryFilter = "all" | "Watching" | "Reading" | "Completed" | "Dropped";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Watching: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  Reading: { bg: "rgba(34,197,94,0.15)", color: "#4ade80" },
  Completed: { bg: "rgba(245,166,35,0.15)", color: "#f5a623" },
  Dropped: { bg: "rgba(239,68,68,0.15)", color: "#f87171" },
};

export default function ProfilePage() {
  const { user, library, logout, refreshUser, removeFromLibrary, loading } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const pfpUrl = user?.pfp ? apiUrl(user.pfp) : null;

  async function handlePfpChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) { setUploadError("Max 5MB"); return; }
    setUploading(true); setUploadError("");
    try {
      const fd = new FormData(); fd.append("pfp", file);
      const res = await fetch(apiUrl("/api/uploads/pfp"), { method: "POST", credentials: "include", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      await apiFetch("/api/auth/pfp", { method: "POST", body: JSON.stringify({ pfp: data.url || data.path }) });
      await refreshUser();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally { setUploading(false); }
  }

  async function handleRemove(mediaId: string, mediaType: string) {
    setRemovingId(mediaId);
    try { await removeFromLibrary(mediaId, mediaType); } finally { setRemovingId(null); }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#f5a623" }} /></div>;

  if (!user) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#111", border: "1px solid #222" }}>
        <User className="w-10 h-10 text-gray-700" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Sign in to view your profile</h2>
      <p className="text-gray-600 text-sm mb-6">Track your library, watch history, and more.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/login" className="px-4 py-2 rounded text-sm font-medium text-white transition-colors" style={{ backgroundColor: "#111", border: "1px solid #333" }}>Sign in</Link>
        <Link to="/register" className="px-4 py-2 rounded text-sm font-medium text-black" style={{ backgroundColor: "#f5a623" }}>Create account</Link>
      </div>
    </div>
  );

  const stats = {
    watching: library.filter((e) => e.status === "Watching").length,
    reading: library.filter((e) => e.status === "Reading").length,
    completed: library.filter((e) => e.status === "Completed").length,
    dropped: library.filter((e) => e.status === "Dropped").length,
  };

  const filtered = filter === "all" ? library : library.filter((e) => e.status === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Profile card */}
      <div className="rounded-lg p-6 mb-8" style={{ backgroundColor: "#111", border: "1px solid #222" }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden" style={{ outline: "2px solid #f5a623", outlineOffset: "2px" }}>
              {pfpUrl ? (
                <img src={pfpUrl} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black text-2xl font-black" style={{ backgroundColor: "#f5a623" }}>
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-black transition-colors" style={{ backgroundColor: "#f5a623" }}>
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePfpChange} className="hidden" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">{user.username}</h1>
            <p className="text-sm text-gray-600">{user.email}</p>
            {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
            <div className="grid grid-cols-4 gap-2 mt-4 max-w-xs">
              {[
                { label: "Watching", value: stats.watching, color: "#60a5fa" },
                { label: "Reading", value: stats.reading, color: "#4ade80" },
                { label: "Completed", value: stats.completed, color: "#f5a623" },
                { label: "Dropped", value: stats.dropped, color: "#f87171" },
              ].map((s) => (
                <div key={s.label} className="rounded p-2 text-center" style={{ backgroundColor: "#1a1a1a" }}>
                  <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-gray-600">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-2 px-4 py-2 rounded text-sm text-red-400 hover:text-red-300 transition-colors" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      {/* Library */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4" style={{ color: "#f5a623" }} />
          <h2 className="font-bold text-white">My Library</h2>
          <span className="text-sm text-gray-600">({library.length})</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {(["all","Watching","Reading","Completed","Dropped"] as LibraryFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded text-xs font-medium transition-all capitalize"
              style={{
                backgroundColor: filter === f ? "#f5a623" : "#111",
                color: filter === f ? "#000" : "#888",
                border: `1px solid ${filter === f ? "#f5a623" : "#222"}`,
              }}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            {filter === "all" ? "Your library is empty" : `Nothing in ${filter}`}
            <div className="mt-4">
              <Link to="/anime" className="text-sm font-medium" style={{ color: "#f5a623" }}>Browse Anime</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filtered.map((entry) => {
              const st = STATUS_STYLE[entry.status] || { bg: "#1a1a1a", color: "#888" };
              return (
                <div key={`${entry.mediaType}-${entry.mediaId}`} className="rounded overflow-hidden group" style={{ backgroundColor: "#111", border: "1px solid #222" }}>
                  <Link to={`/wiki/${entry.mediaId}`} className="block">
                    {entry.coverImage ? (
                      <div className="overflow-hidden" style={{ aspectRatio: "3/4" }}>
                        <img src={entry.coverImage} alt={entry.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center bg-white/5" style={{ aspectRatio: "3/4" }}>
                        {entry.mediaType === "ANIME" ? <Tv className="w-8 h-8 text-gray-700" /> : <BookOpen className="w-8 h-8 text-gray-700" />}
                      </div>
                    )}
                  </Link>
                  <div className="p-2">
                    <Link to={`/wiki/${entry.mediaId}`}>
                      <p className="text-xs font-medium text-gray-300 line-clamp-1 hover:text-white transition-colors mb-1">{entry.title}</p>
                    </Link>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: st.bg, color: st.color }}>{entry.status}</span>
                      <button onClick={() => handleRemove(entry.mediaId, entry.mediaType)} disabled={removingId === entry.mediaId} className="text-gray-700 hover:text-red-400 transition-colors p-0.5">
                        {removingId === entry.mediaId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

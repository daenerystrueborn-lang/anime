import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Camera, Loader2, BookOpen, Tv, CheckCircle, XCircle, Trash2, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch, apiUrl } from "../lib/api";
import { MediaItem } from "../components/AnimeCard";

type LibraryFilter = "all" | "Watching" | "Reading" | "Completed" | "Dropped";

const FILTER_TABS: { value: LibraryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Watching", label: "Watching" },
  { value: "Reading", label: "Reading" },
  { value: "Completed", label: "Completed" },
  { value: "Dropped", label: "Dropped" },
];

const STATUS_COLORS: Record<string, string> = {
  Watching: "bg-blue-500/20 text-blue-400",
  Reading: "bg-green-500/20 text-green-400",
  Completed: "bg-primary-500/20 text-primary-400",
  Dropped: "bg-red-500/20 text-red-400",
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
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be smaller than 5MB");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("pfp", file);
      const res = await fetch(apiUrl("/api/uploads/pfp"), {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      await apiFetch("/api/auth/pfp", {
        method: "POST",
        body: JSON.stringify({ pfp: data.url || data.path }),
      });
      await refreshUser();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(mediaId: string, mediaType: string) {
    setRemovingId(mediaId);
    try {
      await removeFromLibrary(mediaId, mediaType);
    } finally {
      setRemovingId(null);
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sign in to view your profile</h2>
        <p className="text-gray-500 text-sm mb-6">
          Create an account to track your library, watch history, and more.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="btn-secondary">Sign in</Link>
          <Link to="/register" className="btn-primary">Create account</Link>
        </div>
      </div>
    );
  }

  const filteredLibrary =
    filter === "all" ? library : library.filter((e) => e.status === filter);

  const stats = {
    watching: library.filter((e) => e.status === "Watching").length,
    reading: library.filter((e) => e.status === "Reading").length,
    completed: library.filter((e) => e.status === "Completed").length,
    dropped: library.filter((e) => e.status === "Dropped").length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-600 ring-4 ring-primary-500/30">
              {pfpUrl ? (
                <img src={pfpUrl} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-500 flex items-center justify-center text-white shadow-lg transition-colors"
              title="Change profile picture"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePfpChange}
              className="hidden"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{user.username}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            {uploadError && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> {uploadError}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { label: "Watching", value: stats.watching, color: "text-blue-400" },
                { label: "Reading", value: stats.reading, color: "text-green-400" },
                { label: "Completed", value: stats.completed, color: "text-primary-400" },
                { label: "Dropped", value: stats.dropped, color: "text-red-400" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-lg p-3 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-5">
          <BookOpen className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-bold text-white">My Library</h2>
          <span className="text-sm text-gray-500">({library.length})</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === tab.value
                  ? "bg-primary-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
              }`}
            >
              {tab.label}
              {tab.value !== "all" && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({tab.value === "Watching" ? stats.watching : tab.value === "Reading" ? stats.reading : tab.value === "Completed" ? stats.completed : stats.dropped})
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredLibrary.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">
              {filter === "all" ? "Your library is empty" : `Nothing in ${filter}`}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Browse anime or manga and add them to your library
            </p>
            <Link to="/anime" className="btn-primary text-sm mt-4 inline-flex">
              Browse Anime
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredLibrary.map((entry) => (
              <div key={`${entry.mediaType}-${entry.mediaId}`} className="card overflow-hidden group relative">
                <Link to={`/wiki/${entry.mediaId}`} className="block">
                  {entry.coverImage ? (
                    <div className="aspect-[3/4] overflow-hidden bg-white/5">
                      <img
                        src={entry.coverImage}
                        alt={entry.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-white/5 flex items-center justify-center">
                      {entry.mediaType === "ANIME" ? (
                        <Tv className="w-8 h-8 text-gray-600" />
                      ) : (
                        <BookOpen className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
                  )}
                </Link>
                <div className="p-2.5">
                  <Link to={`/wiki/${entry.mediaId}`}>
                    <p className="text-xs font-medium text-gray-100 line-clamp-2 hover:text-primary-400 transition-colors">
                      {entry.title}
                    </p>
                  </Link>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[entry.status] || "bg-white/10 text-gray-400"}`}>
                      {entry.status}
                    </span>
                    <button
                      onClick={() => handleRemove(entry.mediaId, entry.mediaType)}
                      disabled={removingId === entry.mediaId}
                      className="p-1 text-gray-600 hover:text-red-400 transition-colors rounded"
                      title="Remove from library"
                    >
                      {removingId === entry.mediaId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

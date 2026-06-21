import { useState } from "react";
import { X, BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { MediaItem, getTitle, getCover } from "./AnimeCard";
import { Link } from "react-router-dom";

type LibraryStatus = "Watching" | "Reading" | "Completed" | "Dropped";

interface LibraryModalProps {
  item: MediaItem;
  mediaType: "ANIME" | "MANGA" | "NOVEL";
  onClose: () => void;
}

const STATUSES: Record<string, LibraryStatus[]> = {
  ANIME: ["Watching", "Completed", "Dropped"],
  MANGA: ["Reading", "Completed", "Dropped"],
  NOVEL: ["Reading", "Completed", "Dropped"],
};

export default function LibraryModal({ item, mediaType, onClose }: LibraryModalProps) {
  const { user, library, updateLibrary, removeFromLibrary } = useAuth();
  const [loading, setLoading] = useState(false);

  const title = getTitle(item);
  const cover = getCover(item);
  const mediaId = String(item.id);
  const existing = library.find((e) => e.mediaId === mediaId && e.mediaType === mediaType);
  const statuses = STATUSES[mediaType] || STATUSES.MANGA;

  async function handleStatus(status: LibraryStatus) {
    if (!user) return;
    setLoading(true);
    try {
      await updateLibrary(mediaId, mediaType, status, title, cover);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    if (!user) return;
    setLoading(true);
    try {
      await removeFromLibrary(mediaId, mediaType);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-lg shadow-2xl animate-slide-up"
        style={{ backgroundColor: "#111", border: "1px solid #222" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: "#f5a623" }} />
            <h3 className="font-semibold text-white text-sm">Add to Library</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-3 mb-4">
            {cover && (
              <img src={cover} alt={title} className="w-14 h-20 object-cover rounded shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-white line-clamp-2">{title}</p>
              {existing && (
                <span
                  className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: "rgba(245,166,35,0.15)", color: "#f5a623" }}
                >
                  {existing.status}
                </span>
              )}
            </div>
          </div>

          {!user ? (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500 mb-3">Sign in to manage your library</p>
              <Link to="/login" onClick={onClose} className="btn-primary">Sign in</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatus(status)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded text-sm font-medium transition-all"
                  style={{
                    backgroundColor: existing?.status === status ? "#f5a623" : "#1a1a1a",
                    color: existing?.status === status ? "#000" : "#ccc",
                    border: `1px solid ${existing?.status === status ? "#f5a623" : "#333"}`,
                  }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : status}
                </button>
              ))}
              {existing && (
                <button
                  onClick={handleRemove}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded text-sm font-medium transition-all"
                  style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  Remove from Library
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

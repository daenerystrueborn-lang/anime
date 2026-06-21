import { useState } from "react";
import { X, BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { MediaItem } from "./AnimeCard";
import { Link } from "react-router-dom";

type LibraryStatus = "Watching" | "Reading" | "Completed" | "Dropped";

interface LibraryModalProps {
  item: MediaItem;
  mediaType: "ANIME" | "MANGA" | "NOVEL";
  onClose: () => void;
}

const ANIME_STATUSES: LibraryStatus[] = ["Watching", "Completed", "Dropped"];
const MANGA_STATUSES: LibraryStatus[] = ["Reading", "Completed", "Dropped"];

export default function LibraryModal({ item, mediaType, onClose }: LibraryModalProps) {
  const { user, library, updateLibrary, removeFromLibrary } = useAuth();
  const [loading, setLoading] = useState(false);

  const title =
    typeof item.title === "string"
      ? item.title
      : item.title?.english || item.title?.romaji || "Unknown";
  const cover =
    typeof item.coverImage === "string"
      ? item.coverImage
      : item.coverImage?.large || "";

  const mediaId = String(item.id);
  const existing = library.find(
    (e) => e.mediaId === mediaId && e.mediaType === mediaType
  );

  const statuses = mediaType === "ANIME" ? ANIME_STATUSES : MANGA_STATUSES;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-sm shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-400" />
            <h3 className="font-semibold text-white text-sm">Add to Library</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-300 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-3 mb-4">
            {cover && (
              <img
                src={cover}
                alt={title}
                className="w-14 h-20 object-cover rounded-lg shrink-0"
              />
            )}
            <div>
              <p className="text-sm font-medium text-white line-clamp-2">{title}</p>
              {existing && (
                <span className="inline-block mt-1 text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">
                  Currently: {existing.status}
                </span>
              )}
            </div>
          </div>

          {!user ? (
            <div className="text-center py-2">
              <p className="text-sm text-gray-400 mb-3">Sign in to manage your library</p>
              <Link to="/login" onClick={onClose} className="btn-primary text-sm">
                Sign in
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatus(status)}
                  disabled={loading}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    existing?.status === status
                      ? "bg-primary-600 text-white"
                      : "bg-white/5 hover:bg-white/10 text-gray-300"
                  }`}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : status}
                </button>
              ))}
              {existing && (
                <button
                  onClick={handleRemove}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
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

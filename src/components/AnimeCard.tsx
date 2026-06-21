import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export interface MediaItem {
  id: number | string;
  title?: { romaji?: string; english?: string; native?: string } | string;
  coverImage?: { large?: string; medium?: string } | string;
  bannerImage?: string;
  format?: string;
  status?: string;
  episodes?: number;
  chapters?: number;
  averageScore?: number;
  genres?: string[];
  type?: string;
  season?: string;
  seasonYear?: number;
  year?: number;
  description?: string;
}

export function getTitle(item: MediaItem): string {
  if (typeof item.title === "string") return item.title;
  return item.title?.english || item.title?.romaji || item.title?.native || "Unknown";
}

export function getCover(item: MediaItem): string {
  if (typeof item.coverImage === "string") return item.coverImage;
  return item.coverImage?.large || item.coverImage?.medium || "";
}

interface AnimeCardProps {
  item: MediaItem;
  linkTo?: string;
  rank?: number;
}

export default function AnimeCard({ item, linkTo, rank }: AnimeCardProps) {
  const title = getTitle(item);
  const cover = getCover(item);
  const score = item.averageScore ? (item.averageScore / 10).toFixed(1) : null;
  const href = linkTo || `/wiki/${item.id}`;

  return (
    <Link to={href} className="group block shrink-0">
      <div
        className="rounded overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl"
        style={{ backgroundColor: "#111" }}
      >
        <div className="relative" style={{ aspectRatio: "3/4" }}>
          {cover ? (
            <img
              src={cover}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <span className="text-gray-700 text-xs">No image</span>
            </div>
          )}

          {/* Rank badge */}
          {rank !== undefined && rank <= 3 && (
            <div
              className="absolute top-0 left-0 w-7 h-7 flex items-center justify-center text-xs font-black"
              style={{
                backgroundColor:
                  rank === 1 ? "#f5a623" : rank === 2 ? "#aaa" : "#cd7f32",
                color: rank === 1 ? "#000" : "#fff",
              }}
            >
              {rank}
            </div>
          )}
          {rank !== undefined && rank > 3 && (
            <div className="absolute top-1.5 left-1.5 bg-black/80 text-gray-300 text-xs font-bold px-1.5 py-0.5 rounded">
              #{rank}
            </div>
          )}

          {/* Score badge */}
          {score && !rank && (
            <div className="score-badge">
              <Star className="w-2.5 h-2.5 fill-yellow-400" />
              {score}
            </div>
          )}
          {score && rank !== undefined && (
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-black/80 text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded">
              <Star className="w-2.5 h-2.5 fill-yellow-400" />
              {score}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="px-2 py-2">
          <h3 className="text-xs font-medium text-gray-200 line-clamp-2 group-hover:text-white transition-colors leading-tight">
            {title}
          </h3>
          {(item.episodes || item.chapters || item.seasonYear) && (
            <p className="text-xs text-gray-600 mt-1">
              {item.episodes && `${item.episodes} eps`}
              {item.chapters && `${item.chapters} ch`}
              {item.seasonYear && ` · ${item.seasonYear}`}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

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
}

function getTitle(item: MediaItem): string {
  if (typeof item.title === "string") return item.title;
  return item.title?.english || item.title?.romaji || item.title?.native || "Unknown";
}

function getCover(item: MediaItem): string {
  if (typeof item.coverImage === "string") return item.coverImage;
  return item.coverImage?.large || item.coverImage?.medium || "/placeholder.svg";
}

interface AnimeCardProps {
  item: MediaItem;
  linkTo?: string;
}

export default function AnimeCard({ item, linkTo }: AnimeCardProps) {
  const title = getTitle(item);
  const cover = getCover(item);
  const score = item.averageScore ? (item.averageScore / 10).toFixed(1) : null;
  const href = linkTo || `/wiki/${item.id}`;

  return (
    <Link to={href} className="group block">
      <div className="card hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-1">
        <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          {score && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-medium px-2 py-1 rounded-full">
              <Star className="w-3 h-3 fill-yellow-400" />
              {score}
            </div>
          )}
          {item.format && (
            <div className="absolute top-2 right-2 bg-primary-600/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
              {item.format}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-100 line-clamp-2 group-hover:text-primary-400 transition-colors">
            {title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            {item.episodes && <span>{item.episodes} eps</span>}
            {item.chapters && <span>{item.chapters} ch</span>}
            {(item.seasonYear || item.year) && (
              <span>{item.seasonYear || item.year}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

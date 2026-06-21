export default function LoadingSpinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const s = { sm: "h-4 w-4 border-2", md: "h-8 w-8 border-2", lg: "h-12 w-12 border-[3px]" }[size];
  return (
    <div
      className={`rounded-full animate-spin ${s} ${className}`}
      style={{ borderColor: "#222", borderTopColor: "#f5a623" }}
    />
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded overflow-hidden shrink-0" style={{ backgroundColor: "#111" }}>
      <div className="shimmer" style={{ aspectRatio: "3/4", width: "100%" }} />
      <div className="px-2 py-2 space-y-1.5">
        <div className="shimmer h-3 rounded w-3/4" />
        <div className="shimmer h-2.5 rounded w-1/2" />
      </div>
    </div>
  );
}

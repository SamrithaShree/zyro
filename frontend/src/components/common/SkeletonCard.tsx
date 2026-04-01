interface SkeletonCardProps {
  lines?: number;
  height?: string;
  className?: string;
}

export function SkeletonCard({
  lines = 3,
  height = "h-4",
  className = "",
}: SkeletonCardProps) {
  return (
    <div
      className={`bg-card border border-border rounded-2xl p-5 space-y-3 ${className}`}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${height} rounded-lg bg-muted animate-pulse`}
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

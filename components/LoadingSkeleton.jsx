export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md" aria-busy="true" aria-label="Loading report data">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-canvas border border-hairline rounded-md p-lg motion-safe:animate-pulse">
          <div className="h-3 w-24 bg-hairline rounded mb-xs" />
          <div className="h-4 w-32 bg-hairline rounded mb-lg" />
          <div className="h-9 w-20 bg-hairline rounded" />
        </div>
      ))}
    </div>
  );
}

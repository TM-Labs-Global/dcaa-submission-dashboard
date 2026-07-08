// The design system's one other reserved use of green: a "live/last
// updated" signal, shown wherever fetched data is displayed to reassure
// the viewer the numbers are current, not stale.
export function LiveStatusDot({ lastUpdated }) {
  if (!lastUpdated) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-[color:var(--color-secondary)] opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-[color:var(--color-secondary)]" />
      </span>
      Last updated {lastUpdated}
    </span>
  );
}

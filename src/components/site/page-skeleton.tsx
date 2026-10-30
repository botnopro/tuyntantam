export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Đang tải">
      <div className="bg-surface-warm">
        <div className="container-page py-14">
          <div className="h-4 w-40 animate-pulse rounded-xs bg-surface-container" />
          <div className="mt-5 h-12 w-3/4 max-w-2xl animate-pulse rounded-sm bg-surface-container" />
          <div className="mt-4 h-5 w-1/2 max-w-xl animate-pulse rounded-xs bg-surface-container-low" />
        </div>
      </div>
      <div className="container-page grid gap-6 py-12 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-lg bg-surface-container-low" />
        ))}
      </div>
    </div>
  );
}

export default function LeadsLoading() {
  return (
    <div className="p-4 md:p-6">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-8 w-32 bg-foreground/10 rounded mb-2"></div>
          <div className="h-4 w-64 bg-foreground/10 rounded"></div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-xl p-4">
              <div className="h-4 w-20 bg-foreground/10 rounded mb-2"></div>
              <div className="h-8 w-16 bg-foreground/10 rounded"></div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-foreground/10 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

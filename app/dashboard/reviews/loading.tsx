export default function ReviewsLoading() {
  return (
    <div className="p-4 md:p-6">
      {/* Skeleton for reviews page */}
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-8 w-64 bg-foreground/10 rounded mb-2"></div>
          <div className="h-4 w-96 bg-foreground/10 rounded"></div>
        </div>

        {/* Stats skeleton */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-xl p-4">
              <div className="h-4 bg-foreground/10 rounded w-24 mb-2"></div>
              <div className="h-8 bg-foreground/10 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="glass rounded-2xl p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-foreground/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-6">
      {/* Skeleton for dashboard */}
      <div className="animate-pulse">
        {/* Welcome section skeleton */}
        <div className="glass rounded-2xl p-6 mt-6">
          <div className="h-6 w-48 bg-foreground/10 rounded mb-2"></div>
          <div className="h-4 w-96 bg-foreground/10 rounded"></div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-16 bg-foreground/10 rounded"></div>
                <div className="h-5 w-5 bg-foreground/10 rounded"></div>
              </div>
              <div className="h-8 w-12 bg-foreground/10 rounded mb-1"></div>
              <div className="h-3 w-20 bg-foreground/10 rounded"></div>
            </div>
          ))}
        </div>

        {/* Content grid skeleton */}
        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          <div className="glass rounded-2xl p-6 lg:col-span-1">
            <div className="h-6 w-32 bg-foreground/10 rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-foreground/10 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <div className="h-6 w-40 bg-foreground/10 rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-foreground/10 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

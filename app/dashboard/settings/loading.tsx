export default function SettingsLoading() {
  return (
    <div className="p-4 md:p-6">
      {/* Skeleton for settings page */}
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-foreground/10 rounded mb-6"></div>
        <div className="glass rounded-2xl p-6">
          <div className="space-y-4">
            <div className="h-4 bg-foreground/10 rounded w-3/4"></div>
            <div className="h-4 bg-foreground/10 rounded w-1/2"></div>
            <div className="h-4 bg-foreground/10 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

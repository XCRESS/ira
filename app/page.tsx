import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern - Subtle gradient without white overlay */}
      <div className="fixed inset-0 -z-10 bg-linear-to-br from-primary/5 via-background to-accent/5" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 min-h-screen flex flex-col items-center justify-center gap-12">

        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
            IRA Platform
          </h1>
          <p className="text-xl text-muted-foreground">
            IPO Readiness Assessment Score Calculator
          </p>
          <div className="glass-subtle rounded-full px-6 py-2 inline-block">
            <span className="text-sm text-muted-foreground">
              Internal Tool • Investment Banking Team
            </span>
          </div>
        </div>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Demo Cards Section */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Score Card Example */}
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Assessment Score</h3>
              <div className="glass-subtle rounded-full px-3 py-1">
                <span className="text-xs font-medium text-success">IPO Ready</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">72%</div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-primary to-accent w-[72%] rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="glass-subtle rounded-lg py-2">
                <div className="font-semibold text-foreground">48/60</div>
                <div className="text-muted-foreground">Company</div>
              </div>
              <div className="glass-subtle rounded-lg py-2">
                <div className="font-semibold text-foreground">10/14</div>
                <div className="text-muted-foreground">Financial</div>
              </div>
              <div className="glass-subtle rounded-lg py-2">
                <div className="font-semibold text-foreground">28/40</div>
                <div className="text-muted-foreground">Sector</div>
              </div>
            </div>
          </div>

          {/* Status Card Example */}
          <div className="glass rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Assessments</h3>
            <div className="space-y-3">
              {[
                { name: 'ABC Corp', status: 'Completed', color: 'success' },
                { name: 'XYZ Ltd', status: 'In Review', color: 'warning' },
                { name: 'Tech Startup', status: 'Draft', color: 'muted' },
              ].map((item, i) => (
                <div key={i} className="glass-subtle rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-${item.color}/10 text-${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card Example */}
          <div className="glass rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full glass-strong rounded-lg p-3 text-left hover:bg-primary/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">New Assessment</div>
                    <div className="text-xs text-muted-foreground">Start scoring a client</div>
                  </div>
                </div>
              </button>

              <button className="w-full glass-strong rounded-lg p-3 text-left hover:bg-secondary/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                    <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">View Reports</div>
                    <div className="text-xs text-muted-foreground">Access all assessments</div>
                  </div>
                </div>
              </button>

              <button className="w-full glass-strong rounded-lg p-3 text-left hover:bg-accent/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Settings</div>
                    <div className="text-xs text-muted-foreground">Manage preferences</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="glass-subtle rounded-full px-6 py-3 text-center">
          <p className="text-sm text-muted-foreground">
            Built with Next.js 16 • Tailwind CSS 4 • Glassmorphism Design
          </p>
        </div>
      </main>
    </div>
  );
}

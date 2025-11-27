import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-provider";
import { Toaster } from "@/components/toaster";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PerformanceMonitor } from "@/components/performance-monitor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IPO Readiness Assessment - Free Eligibility Test | IRA",
  description: "Professional IPO readiness assessment for BSE, NSE, NYSE & NASDAQ. Free 90-second eligibility check. Expert financial analysis for companies planning to go public.",
  icons: {
    icon: '/ira_logo.png',
    apple: '/ira_logo.png',
  },
  openGraph: {
    title: "IPO Readiness Assessment - IRA",
    description: "Expert IPO advisory services. Check your eligibility in 90 seconds - free.",
    images: ['/ira_logo.png'],
  },
  keywords: ['IPO readiness', 'IPO assessment', 'BSE listing', 'NSE listing', 'SEBI compliance', 'IPO advisory'],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IRA",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#265eb5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="catppuccin-mocha"
          enableSystem={false}
          storageKey="ira-theme"
        >
          {children}
          <Toaster />
          {/* Only load analytics in production (Vercel deployment) */}
          {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
          <PerformanceMonitor />
        </ThemeProvider>
      </body>
    </html>
  );
}

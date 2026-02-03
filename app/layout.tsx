import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-provider";
import { Toaster } from "@/components/toaster";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { OrganizationSchema, WebApplicationSchema, ServiceSchema } from "@/components/structured-data";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "IPO Readiness Assessment - Free Eligibility Test | IRA",
    template: "%s | IRA - IPO Readiness Assessment",
  },
  description: "Professional IPO readiness assessment for BSE, NSE, NYSE & NASDAQ. Free 90-second eligibility check. Expert financial analysis for companies planning to go public.",
  applicationName: "IRA - IPO Readiness Assessment",
  authors: [{ name: "IRA Team" }],
  generator: "Next.js",
  keywords: [
    'IPO readiness',
    'IPO assessment',
    'BSE listing',
    'NSE listing',
    'NYSE listing',
    'NASDAQ listing',
    'SEBI compliance',
    'IPO advisory',
    'IPO eligibility',
    'IPO consultant',
    'going public',
    'initial public offering',
    'IPO preparation',
    'IPO due diligence',
    'financial assessment',
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'IRA Team',
  publisher: 'IRA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/ira_logo.png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/ira_logo.png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/ira_logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://irascore.com',
    siteName: 'IRA - IPO Readiness Assessment',
    title: "IPO Readiness Assessment - Expert Advisory | IRA",
    description: "Professional IPO readiness assessment for BSE, NSE, NYSE & NASDAQ. Free 90-second eligibility check. Expert financial analysis for companies planning to go public.",
    images: [
      {
        url: '/ira_logo.png',
        width: 1200,
        height: 1200,
        alt: 'IRA - IPO Readiness Assessment',
        type: 'image/png',
      },
      {
        url: '/ira_logo.png',
        width: 1200,
        height: 630,
        alt: 'IRA - IPO Readiness Assessment',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "IPO Readiness Assessment - Expert Advisory | IRA",
    description: "Professional IPO readiness assessment for BSE, NSE, NYSE & NASDAQ. Free eligibility check in 90 seconds.",
    creator: '@irascore',
    site: '@irascore',
    images: ['/ira_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IRA",
    startupImage: [
      {
        url: '/ira_logo.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/ira_logo.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/ira_logo.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    other: {
      me: [process.env.NEXT_PUBLIC_APP_URL || 'https://irascore.com'],
    },
  },
  category: 'business',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#265eb5" },
    { media: "(prefers-color-scheme: dark)", color: "#265eb5" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <WebApplicationSchema />
        <ServiceSchema />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="catppuccin-mocha"
          enableSystem={false}
          storageKey="ira-theme"
        >
          <ServiceWorkerRegister />
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
import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { ViewTransitions } from "next-view-transitions";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import ThreeDProvider from "@/components/providers/ThreeDMode";
import UIModeProvider from "@/components/providers/UIMode";
import Cursor from "@/components/ui/Cursor";
import AmbientSound from "@/components/ui/AmbientSound";
import WaveformOverlay from "@/components/ui/WaveformOverlay";
import Preloader from "@/components/layout/Preloader";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    // Child pages set a short title; this appends the name for a consistent
    // "<Page> · Temiye Akinyemi" shape. The homepage uses `default` untouched.
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0e0c" },
    { media: "(prefers-color-scheme: light)", color: "#f3efe6" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Set theme + view mode before first paint to avoid a flash. */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}try{var m=localStorage.getItem('view-mode');document.documentElement.setAttribute('data-view-mode',m==='3d'?'3d':'2d');}catch(e){document.documentElement.setAttribute('data-view-mode','2d');}try{var u=localStorage.getItem('ui-mode');document.documentElement.setAttribute('data-ui-mode',u==='dashboard'?'dashboard':'site');}catch(e){document.documentElement.setAttribute('data-ui-mode','site');}})();`,
            }}
          />
        </head>
        <body
          suppressHydrationWarning
          className={`${fraunces.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <a
            href="#work"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10001] focus:rounded focus:bg-[var(--color-ink)] focus:px-4 focus:py-2 focus:text-sm focus:text-[var(--color-ground)]"
          >
            Skip to content
          </a>
          <SmoothScroll>
            <ThreeDProvider>
              <UIModeProvider>
                <Preloader />
                {children}
              </UIModeProvider>
            </ThreeDProvider>
          </SmoothScroll>
          <WaveformOverlay />
          <Cursor />
          <AmbientSound />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ViewTransitions>
  );
}

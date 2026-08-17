import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Cursor from "@/components/ui/Cursor";
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
  metadataBase: new URL("https://temiye.dev"),
  title: {
    default: "Temiye Akinyemi, Software Engineer",
    template: "%s",
  },
  description:
    "Temiye Akinyemi is a software engineer in Lagos building production web apps across healthcare, AI marketplaces, and consumer platforms.",
  openGraph: {
    title: "Temiye Akinyemi, Software Engineer",
    description:
      "Software engineer building production web apps across healthcare, AI marketplaces, and consumer platforms.",
    type: "website",
  },
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
          {/* Set the theme before first paint to avoid a flash. Dark is default. */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
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
            <Preloader />
            {children}
          </SmoothScroll>
          <Cursor />
        </body>
      </html>
    </ViewTransitions>
  );
}

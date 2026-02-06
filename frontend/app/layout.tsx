import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/Providers';
import BatchPopup from "@/components/onboarding/BatchPopup";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://jobgrid.in'),
  title: {
    default: "JobPortal - Premium Government & Private Jobs in India",
    template: "%s | JobPortal"
  },
  description: "India's #1 AI-powered job discovery platform. Find the latest government and private sector job openings with competitive salaries. Updated daily.",
  keywords: ["jobs", "government jobs", "private jobs", "careers", "india jobs", "job portal", "employment", "freshers jobs", "IT jobs", "banking jobs"],
  authors: [{ name: "JobPortal" }],
  creator: "JobPortal",
  publisher: "JobPortal",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://jobportal.com",
    siteName: "JobPortal",
    title: "JobPortal - Premium Government & Private Jobs in India",
    description: "India's #1 AI-powered job discovery platform. Find the latest government and private sector job openings.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JobPortal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JobPortal - Premium Government & Private Jobs",
    description: "India's #1 AI-powered job discovery platform",
    images: ["/og-image.png"],
  },
  verification: {
    google: "vZ7c5Hm0Ph_6jXcY0HC8N1UdGazM7_hdp68l8SH-jR0",
  },
  alternates: {
    canonical: "https://jobportal.com",
  },
  other: {
    'google-adsense-account': 'ca-pub-3356299280733421',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <BatchPopup />
        </Providers>
      </body>
    </html>
  );
}

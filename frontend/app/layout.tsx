import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/Providers';
import BatchPopup from "@/components/onboarding/BatchPopup";
import EmailSubscriptionTrigger from '@/components/EmailSubscriptionTrigger';
import { Analytics } from '@vercel/analytics/next';

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://jobgrid.in'),
  title: {
    default: "JobGrid - #1 Platform for B.Tech, IT & Software Jobs in India 2025",
    template: "%s | JobGrid"
  },
  description: "India's leading AI-powered job portal for B.Tech freshers & IT professionals. Discover 10,000+ software engineering, SDE, full-stack, backend, frontend & data science jobs. Updated hourly. Apply now!",
  keywords: [
    // Batch-focused keywords (priority)
    "2026 batch jobs", "2027 batch jobs", "2028 batch jobs",
    "2024 batch jobs", "2025 batch jobs", "2029 batch jobs",
    "fresher jobs 2026", "fresher jobs 2027", "fresher jobs 2028",
    "btech 2026 batch", "btech 2027 batch", "btech 2028 batch",
    // Core keywords
    "btech jobs", "btech fresher jobs", "IT jobs India", "software engineer jobs",
    "SDE jobs", "full stack developer jobs", "backend developer jobs", "frontend developer jobs",
    "software jobs India", "tech jobs", "engineering jobs", "computer science jobs",
    "data scientist jobs", "machine learning jobs", "Python developer jobs", "Java developer jobs",
    "React developer jobs", "Node.js jobs", "remote IT jobs India", "startup jobs India",
    "MNC jobs", "product based company jobs", "off campus jobs", "campus placement 2026"
  ],
  authors: [{ name: "JobGrid" }],
  creator: "JobGrid",
  publisher: "JobGrid",
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
    url: "https://jobgrid.in",
    siteName: "JobGrid",
    title: "JobGrid - B.Tech, IT & Software Engineering Jobs in India",
    description: "Discover 10,000+ tech jobs for B.Tech graduates & IT professionals. SDE, Full-Stack, Data Science & more. AI-powered job matching. Updated hourly.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JobGrid - India's #1 Tech Jobs Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JobGrid - B.Tech & IT Jobs in India 2025",
    description: "India's AI-powered job portal for software engineers. 10K+ jobs updated hourly.",
    images: ["/og-image.png"],
    creator: "@jobgridin",
  },
  verification: {
    google: "vZ7c5Hm0Ph_6jXcY0HC8N1UdGazM7_hdp68l8SH-jR0",
  },
  alternates: {
    canonical: "https://jobgrid.in",
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
          <EmailSubscriptionTrigger />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

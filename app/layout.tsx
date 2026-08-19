import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://portfolio-wine-delta-35.vercel.app";
const SITE_TITLE = "Kush Bhardwaj | Portfolio";
const SITE_DESCRIPTION =
  "Full-Stack Developer & 2026 CS Graduate crafting interactive, high-performance digital experiences at VM One Technologies.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: "Kush Bhardwaj",
      url: SITE_URL,
      jobTitle: "Full-Stack Developer",
      worksFor: {
        "@type": "Organization",
        name: "VM One Technologies",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "GLA University",
      },
      sameAs: [
        "https://github.com/KUSH-Q-37",
        "https://www.linkedin.com/in/kush-bhardwaj-73a65628b/",
        "https://leetcode.com/u/kush968/",
      ],
    },
    {
      "@type": "WebSite",
      name: SITE_TITLE,
      url: SITE_URL,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased custom-scrollbar`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
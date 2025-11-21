import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: {
    default: "Taemni's Blog",
    template: "%s | Taemni's Blog",
  },
  description: "개발 여정을 기록하는 기술 블로그입니다. Next.js, React, TypeScript, 백엔드 개발에 대한 경험과 학습을 공유합니다.",
  keywords: ["Next.js", "React", "TypeScript", "웹 개발", "프론트엔드", "백엔드", "기술 블로그"],
  authors: [{ name: "Taemni", url: "https://github.com/taemni" }],
  creator: "Taemni",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://taemni.dev",
    title: "Taemni's Blog",
    description: "개발 여정을 기록하는 기술 블로그",
    siteName: "Taemni's Blog",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Taemni's Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taemni's Blog",
    description: "개발 여정을 기록하는 기술 블로그",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${notoSansKR.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}

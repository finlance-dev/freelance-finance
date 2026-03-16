import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Finlance - ผู้ช่วยการเงินอัจฉริยะสำหรับฟรีแลนซ์ | จัดการรายรับรายจ่าย ภาษี กระแสเงินสด",
    template: "%s | Finlance",
  },
  description: "Finlance ช่วยฟรีแลนซ์ไทยติดตามรายได้ ประมาณภาษี สร้างใบแจ้งหนี้ และพยากรณ์กระแสเงินสด ใช้ฟรี ไม่ต้องใช้บัตรเครดิต",
  keywords: [
    "ฟรีแลนซ์", "การเงินฟรีแลนซ์", "ภาษีฟรีแลนซ์", "รายรับรายจ่าย", "ใบแจ้งหนี้",
    "คำนวณภาษี", "กระแสเงินสด", "แดชบอร์ดการเงิน", "บัญชีฟรีแลนซ์",
    "freelance finance", "freelance tax Thailand", "invoice generator",
    "expense tracker", "income tracker", "PromptPay QR",
  ],
  authors: [{ name: "Finlance", url: "https://finlance.co" }],
  creator: "Finlance",
  publisher: "Finlance",
  openGraph: {
    title: "Finlance - ผู้ช่วยการเงินอัจฉริยะสำหรับฟรีแลนซ์",
    description: "ติดตามรายได้ ประมาณภาษี สร้างใบแจ้งหนี้ และพยากรณ์กระแสเงินสด — ออกแบบมาเพื่อฟรีแลนซ์ไทยโดยเฉพาะ ใช้ฟรี",
    url: "https://finlance.co",
    siteName: "Finlance",
    locale: "th_TH",
    alternateLocale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finlance - ผู้ช่วยการเงินอัจฉริยะสำหรับฟรีแลนซ์",
    description: "ติดตามรายได้ ประมาณภาษี สร้างใบแจ้งหนี้ และพยากรณ์กระแสเงินสด — ใช้ฟรี",
    creator: "@finlance_co",
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
  metadataBase: new URL("https://finlance.co"),
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://finlance.co",
    languages: {
      "th-TH": "https://finlance.co",
      "en-US": "https://finlance.co",
    },
  },
  category: "finance",
  other: {
    "google-site-verification": "jnPAkpLp9YgByvTQ-kaffB1FwijXulNczpjehOz05FM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-RJ9KSNE7JS" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-RJ9KSNE7JS');`,
          }}
        />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        {/* PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Finlance" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Finlance",
              url: "https://finlance.co",
              logo: "https://finlance.co/icons/icon-512.svg",
              description: "ผู้ช่วยการเงินอัจฉริยะสำหรับฟรีแลนซ์ไทย",
              sameAs: [],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                availableLanguage: ["Thai", "English"],
              },
            }),
          }}
        />

        {/* JSON-LD: WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Finlance",
              url: "https://finlance.co",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "THB",
                description: "แพลนฟรี — ติดตามรายรับรายจ่าย ลูกค้า 3 ราย",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
                bestRating: "5",
              },
              featureList: [
                "ติดตามรายรับ-รายจ่าย",
                "ประมาณภาษีอัตโนมัติ",
                "สร้างใบแจ้งหนี้พร้อม PromptPay QR",
                "พยากรณ์กระแสเงินสด",
                "จัดการลูกค้าและโปรเจกต์",
                "รายงานรายเดือน",
              ],
              inLanguage: ["th", "en"],
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${notoSansThai.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}`
          }}
        />
      </body>
    </html>
  );
}

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
  title: "Finlance - ผู้ช่วยการเงินอัจฉริยะสำหรับฟรีแลนซ์",
  description: "ติดตามรายได้ ประมาณภาษี และพยากรณ์กระแสเงินสด — ออกแบบมาเพื่อฟรีแลนซ์โดยเฉพาะ",
  keywords: ["ฟรีแลนซ์", "การเงิน", "ภาษี", "รายรับรายจ่าย", "freelance", "finance", "tax", "Thailand", "แดชบอร์ด", "กระแสเงินสด"],
  authors: [{ name: "Finlance" }],
  openGraph: {
    title: "Finlance - ผู้ช่วยการเงินอัจฉริยะสำหรับฟรีแลนซ์",
    description: "ติดตามรายได้ ประมาณภาษี และพยากรณ์กระแสเงินสด — ออกแบบมาเพื่อฟรีแลนซ์โดยเฉพาะ",
    url: "https://finlance.co",
    siteName: "Finlance",
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finlance - ผู้ช่วยการเงินอัจฉริยะสำหรับฟรีแลนซ์",
    description: "ติดตามรายได้ ประมาณภาษี และพยากรณ์กระแสเงินสด — ออกแบบมาเพื่อฟรีแลนซ์โดยเฉพาะ",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://finlance.co"),
  manifest: "/manifest.json",
  alternates: { canonical: "https://finlance.co" },
  other: {
    "google-site-verification": "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${inter.variable} ${notoSansThai.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}

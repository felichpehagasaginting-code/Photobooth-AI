import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Photobooth - Abadikan Momen dengan Sentuhan AI",
  description:
    "Transform your photos with AI-powered filters. Cyberpunk, Anime, Watercolor, and more!",
  keywords: [
    "AI Photobooth",
    "Photo Filter",
    "Anime",
    "Cyberpunk",
    "AI Photo",
  ],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0A0F] text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

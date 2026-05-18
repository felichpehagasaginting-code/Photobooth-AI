import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0F",
};

export const metadata: Metadata = {
  title: "AI Photobooth — Abadikan Momen dengan Sentuhan AI",
  description:
    "Transform your photos with AI-powered filters. Anime Ghibli, Cyberpunk Neon, Watercolor, Comic Book, and more — instantly!",
  keywords: [
    "AI Photobooth",
    "Photo Filter",
    "Anime",
    "Cyberpunk",
    "AI Photo",
    "Photobooth Indonesia",
    "AI Art Filter",
    "Gemini AI",
  ],
  openGraph: {
    title: "AI Photobooth — Abadikan Momen dengan Sentuhan AI",
    description: "Transform your photos with AI-powered artistic filters.",
    type: "website",
  },
  icons: {
    icon: "/logo-icon.svg",
    apple: "/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={`${outfit.variable} ${inter.variable}`}>
      <body className="antialiased bg-[#0A0A0F] text-white font-outfit">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

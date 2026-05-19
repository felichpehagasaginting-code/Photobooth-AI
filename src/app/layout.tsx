import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

/* Editorial display — weight + italics for headline drama */
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

/* Clean, high-legibility body — not a default AI choice */
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0c0a09",
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
    <html lang="id" suppressHydrationWarning className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="antialiased bg-[#0c0a09] text-[#f0ebe3] font-body">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

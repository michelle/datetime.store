import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ORIGINAL_COPY } from "@/lib/copy";

const chivo = localFont({ src: "../assets/Chivo-Medium.ttf", weight: "500", variable: "--font-chivo", display: "swap" });

export const metadata: Metadata = {
  title: ORIGINAL_COPY.pageTitle,
  description: ORIGINAL_COPY.tagline,
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  openGraph: {
    title: ORIGINAL_COPY.pageTitle,
    description: ORIGINAL_COPY.tagline,
    type: "website",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={chivo.variable}>
      <body>{children}</body>
    </html>
  );
}

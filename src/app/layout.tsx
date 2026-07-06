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
  title: "FAISAL | SEO Expert, WordPress Web Design & Creative Graphics",
  description:
    "FAISAL (@metamehar) — Digital Growth Architect from Pakistan. SEO, WordPress web design, brand identity, and Canva design services. Serving clients worldwide in 5 languages.",
  keywords: [
    "FAISAL",
    "metamehar",
    "SEO expert",
    "WordPress web design",
    "brand identity",
    "Canva design",
    "Digital Growth Architect",
    "Pakistan freelancer",
  ],
  authors: [{ name: "FAISAL" }],
  openGraph: {
    title: "FAISAL | Digital Growth Architect",
    description:
      "Expert SEO, WordPress Web Design and Creative Graphics. Serving clients worldwide in 5 languages.",
    url: "https://github.com/metamehar/portfolio",
    siteName: "FAISAL Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAISAL | Digital Growth Architect",
    description:
      "Expert SEO, WordPress Web Design and Creative Graphics. Serving clients worldwide in 5 languages.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

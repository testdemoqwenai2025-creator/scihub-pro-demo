import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ClientProviders } from "@/components/ClientProviders";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MainNavbar, Footer } from "@/components/MainNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SciHub Pro - The Scientific GitHub for the Modern Age",
  description: "Open-source unified scientific computing platform for Bioinformatics, Cheminformatics, Molecular Modelling, Materials Science, Physics, and ML/Data Science. Powered by AETHEL AI.",
  keywords: ["SciHub Pro", "scientific computing", "bioinformatics", "cheminformatics", "molecular modelling", "materials science", "physics", "machine learning", "data science", "AETHEL", "research platform", "open source", "polyglot architecture"],
  authors: [{ name: "SciHub Pro Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "SciHub Pro - The Scientific GitHub for the Modern Age",
    description: "Unified scientific computing platform with AETHEL AI integration. Open-source, polyglot architecture.",
    siteName: "SciHub Pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SciHub Pro - Scientific Computing Platform",
    description: "Open-source unified scientific computing for tomorrow's world.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ClientProviders>
          <ErrorBoundary>
            <MainNavbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ErrorBoundary>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}

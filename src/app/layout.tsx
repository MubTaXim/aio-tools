import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Wrench, ExternalLink } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIO Tools - All-In-One Web Utilities",
  description: "Professional web-based tools for PDFs, code, images, and more. Free, fast, and private - all processing happens in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="p-1.5 rounded-lg bg-primary">
                <Wrench className="h-4 w-4 text-primary-foreground" />
              </div>
              <span>AIO Tools</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border/40 py-6 mt-auto">
          <div className="container max-w-screen-2xl text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-1">
              Made with <span className="text-red-500">❤️</span> by{" "}
              <a
                href="https://github.com/MubTaXim"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors hover:underline inline-flex items-center gap-0.5"
              >
                MubTaXim
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

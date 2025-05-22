import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import localFont from "next/font/local";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const safiro = localFont({
  variable: "--font-safiro",
  src: "./fonts/Safiro-Medium.ttf",
  display: "swap",
  weight: "500",
});

export const metadata: Metadata = {
  title: "Analog",
  description: "Beyond Scheduling. A calendar that understands your life.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${safiro.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <div className="mx-auto w-full max-w-7xl">
            <Toaster
              richColors
              closeButton
              position="bottom-right"
            />
            <Header />
            <div className="py-20 sm:py-28 md:py-32 lg:py-40 min-h-[calc(100vh-8rem)]">
              {children}
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

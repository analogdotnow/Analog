import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

import localFont from "next/font/local";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

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
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${safiro.variable} antialiased`}
      >
        <Providers>
          <Header />
          <div className="py-40"> {children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

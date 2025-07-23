import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Provider from "./provider";
import PageTransition from "@/components/PageTransition";
import Preloader from "@/components/Preloader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DOQ - Qenz Intelligence | AI Medical Voice Platform",
  description: "Transform healthcare with Qenz Intelligence's AI-powered voice platform. Real-time medical consultations, secure patient interactions, and intelligent healthcare automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Preloader />
          <Provider>
            <PageTransition>{children}</PageTransition>
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/providers/auth";
import { Toaster } from "sonner";
import { CalculatorProvider } from "@/contexts/CarculatorContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bill Splitter",
  description: "A simple Electricity bill splitter app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <NextAuthProvider>
        <CalculatorProvider>
          <main className="bg-gradient-to-br from-slate-50 to-slate-500">{children}</main>
          <Toaster />
          </CalculatorProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}

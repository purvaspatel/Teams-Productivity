// app/layout.tsx
'use client';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
    <html lang="en">
      <body className={inter.variable}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
    </SessionProvider>
  );
}
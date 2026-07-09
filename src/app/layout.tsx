import type { Metadata } from "next";
import AuthProvider from '@/components/providers/AuthProvider';
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LuxeLane",
  description: "A modern full-stack e-commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        <AuthProvider> {children}</AuthProvider>
      </body>
    </html>
  );
}
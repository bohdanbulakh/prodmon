import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from '@/components/layout/Providers';
import Header from '@/components/layout/header/Header';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = 'ProdMon';
const description = 'A demo app for monitoring productivity of your hosts';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <Providers>
        <Header />
        <div className="min-h-[50vh] h-full w-full items-center justify-center px-4 mt-10">
          {children}
        </div>
      </Providers>
      <Analytics />
      <Toaster />
      </body>
    </html>
  );
}

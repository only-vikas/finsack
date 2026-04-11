import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinSack OS — FinTech Education Platform",
  description:
    "A premium browser-based operating system for financial education. Learn trading strategies, track markets, and get AI-powered insights.",
  keywords: [
    "fintech",
    "trading",
    "education",
    "investing",
    "options",
    "swing trading",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { cn } from "@/utils/theme";

const inter = Inter({
  subsets: ["latin", "cyrillic"], // добавь cyrillic если нужна кириллица
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Multistream",
  description: "Watch multiple Twitch streams simultaneously",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={cn(inter.variable, "font-inter")}
    >
      <body
        className="font-inter min-h-screen bg-base-100 text-base-content"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

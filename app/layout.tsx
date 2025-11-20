import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" data-theme="dark">
      <body 
        className="min-h-screen bg-base-100 text-base-content"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

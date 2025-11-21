import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { cn } from "@/utils/theme";
import { Header } from "@/components/organisms/Header";
import { AppProvider } from "@/contexts/AppContext";

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
      suppressHydrationWarning
    >
      <body
        className="font-inter min-h-screen bg-base-100 text-base-content"
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('multistream_theme');
                  if (theme) {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <AppProvider>
          <Header />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

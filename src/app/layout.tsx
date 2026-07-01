import type { Metadata } from "next";
import "./globals.css";

import { I18nProvider } from "@/i18n/I18nProvider";
import { TripProvider } from "@/context/TripContext";

export const metadata: Metadata = {
  title: "WanderApp — AI Travel Route Planner",
  description: "Plan your perfect trip. Paste a TikTok link, and we handle the rest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-950">
        <TripProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </TripProvider>
      </body>
    </html>
  );
}

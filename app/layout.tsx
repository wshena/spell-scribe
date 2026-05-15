import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";
import { ManaSymbolProvider } from "@/components/providers/ManaSymbolProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpellScribe",
  description:
    "A tool to help you create better decks for Magic: The Gathering.",
  keywords: [
    "Magic: The Gathering",
    "MTG",
    "deck building",
    "card game",
    "spellscribe",
  ],
  authors: [{ name: "wshena", url: "https://yourwebsite.com" }],
  openGraph: {
    title: "SpellScribe",
    description:
      "A tool to help you create better decks for Magic: The Gathering.",
    siteName: "SpellScribe",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ManaSymbolProvider>{children}</ManaSymbolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

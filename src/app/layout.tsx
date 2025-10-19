import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { NavBar } from "./_components/layout/NavBar";
import { Toaster } from "~/components/ui/sonner";
import ProvidersWrapper from "./_components/providers/ProvidersWrapper";

export const metadata: Metadata = {
  title: {
    default: "Silentletter - Learn to Spell with Audio",
    template: "%s | Silentletter",
  },
  description:
    "Master spelling and pronunciation through interactive audio exercises. Learn at your own pace with CEFR-leveled content in multiple languages.",
  authors: [{ name: "Youssef Abdelrahim" }],
  creator: "Youssef Abdelrahim",
  publisher: "Youssef Abdelrahim",
  applicationName: "Silentletter",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: [
    "spelling",
    "pronunciation",
    "language learning",
    "audio learning",
    "CEFR",
    "English learning",
    "German learning",
    "vocabulary",
    "education",
    "listening practice",
  ],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body className="bg-background flex min-h-screen flex-col">
        <ProvidersWrapper>
          <nav className="bg-background flex w-full justify-center">
            <NavBar />
          </nav>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          <Toaster duration={3000} position="top-center" />
        </ProvidersWrapper>
      </body>
    </html>
  );
}

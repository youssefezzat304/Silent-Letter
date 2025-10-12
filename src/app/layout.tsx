import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { NavBar } from "./_components/layout/NavBar";
import { Toaster } from "~/components/ui/sonner";
import ProvidersWrapper from "./_components/providers/ProvidersWrapper";

export const metadata: Metadata = {
  title: "Hear & Spell",
  description: "Learn to spell.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  creator: "Youssef Abdelrahim",
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
      <body className="flex min-h-screen flex-col bg-background">
        <ProvidersWrapper>
          <nav className="flex w-full justify-center bg-background">
            <NavBar />
          </nav>
          <TRPCReactProvider>
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </TRPCReactProvider>

          <Toaster duration={3000} position="top-center" />
        </ProvidersWrapper>
      </body>
    </html>
  );
}

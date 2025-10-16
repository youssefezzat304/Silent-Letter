"use server";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export default async function ProvidersWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

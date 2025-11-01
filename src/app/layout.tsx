// app/layout.tsx
import { AuthHydrator } from "@/src/components/providers/AuthHydrator";
import { QueryProvider } from "@/src/components/providers/QueryProvider";
import { Toaster } from "sonner";
import React from "react";
import { Noto_Sans_Arabic } from "next/font/google";
import "@/src/app/globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-arabic",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={notoSansArabic.variable} suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AuthHydrator />
          {children}
        </QueryProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}

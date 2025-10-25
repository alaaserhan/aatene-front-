// app/layout.tsx
import { AuthHydrator } from "@/src/components/providers/AuthHydrator";
import { QueryProvider } from "@/src/components/providers/QueryProvider";
import { Toaster } from "sonner";
import React from "react";
import { Cairo } from "next/font/google";
import { cookies } from "next/headers"; // (1) استدعاء دالة الكوكيز
import "@/src/app/globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-cairo",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar"; // الافتراضي عربي
  const dir = lang === "ar" || lang === "he" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} className={cairo.variable} suppressHydrationWarning={true}>
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
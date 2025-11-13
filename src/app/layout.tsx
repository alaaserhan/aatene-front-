// app/layout.tsx
import { AuthHydrator } from "@/src/components/providers/AuthHydrator";
import { QueryProvider } from "@/src/components/providers/QueryProvider";
import { Toaster } from "sonner";
import React from "react";
import localFont from "next/font/local";
import "@/src/app/globals.css";

const pingAr = localFont({
  src: [
    {
      path: "./fonts/PingAR+LT-Hairline.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-Thin.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-ExtraLight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-Heavy.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-ping-ar",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={pingAr.variable}
      suppressHydrationWarning
    >
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
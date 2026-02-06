// app/[lang]/(web)/layout.tsx
import Footer from "@/src/components/(web)/Footer";
import Navbar from "@/src/components/(web)/Navbar";
import React from "react";

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen justify-between">
      <Navbar />
      <main className="flex-1 flex flex-col bg-white">{children}</main>
      <Footer />
    </div>
  );
}
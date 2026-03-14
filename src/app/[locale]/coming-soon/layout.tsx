import Navbar from "@/src/components/(web)/Navbar";
import Footer from "@/src/components/(web)/Footer";
import React from "react";

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="pointer-events-none select-none" aria-disabled="true">
        <Navbar />
      </div>

      <main className="flex flex-1 flex-col">{children}</main>

      <div className="pointer-events-none select-none" aria-disabled="true">
        <Footer />
      </div>
    </div>
  );
}

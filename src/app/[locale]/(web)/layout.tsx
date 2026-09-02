import Footer from "@/src/components/(web)/Footer";
import Navbar from "@/src/components/(web)/Navbar";
import { MaintenanceGuard } from "@/src/components/providers/MaintenanceGuard";
import React from "react";

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen justify-between">
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col">
        <MaintenanceGuard>
          <div className="flex min-h-0 w-full flex-1 flex-col">{children}</div>
        </MaintenanceGuard>
      </main>
      <Footer />
    </div>
  );
}

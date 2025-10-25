// app/[lang]/(web)/layout.tsx
import React from "react";

// (هنا هنحط الـ Navbar والـ Footer بتوعنا بعدين)
// import { Navbar } from "@/src/components/(web)/Navbar";
// import { Footer } from "@/src/components/(web)/Footer";

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Navbar /> */}
      <main className="flex-grow">{children}</main>
      {/* <Footer /> */}
    </div>
  );
}
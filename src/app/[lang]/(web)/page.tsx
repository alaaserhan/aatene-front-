// app/[lang]/(web)/page.tsx
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  description: "الصفحة الرئيسية لموقع أعطيني...",
  // مفيش title هنا
};

export default function HomePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold">أهلاً بك في أعطيني</h1>
      <p>دي الصفحة الرئيسية.</p>
    </div>
  );
}
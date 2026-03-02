import { Metadata } from "next";
import React from "react";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardHome");

export default function HomePage() {
  return (
    <div className="container mx-auto py-10">

    </div>
  );
}
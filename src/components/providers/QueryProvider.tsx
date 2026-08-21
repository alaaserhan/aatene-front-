"use client";

import React, { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { makeQueryClient } from "@/src/lib/queryClient";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // بنعمل الـ client مرة واحدة بس عشان نحافظ على الكاش
  // الديفولتس متشاركة مع الـ server client عشان الداتا اللي جاية من الـ SSR
  // متبقاش stale وتتعمل لها refetch على طول.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* دي أداة الـ debug، بتشتغل بس في الـ development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
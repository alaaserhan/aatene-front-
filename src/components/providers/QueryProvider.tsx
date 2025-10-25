"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // بنعمل الـ client مرة واحدة بس عشان نحافظ على الكاش
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // إعدادات افتراضية للمشروع كله
            // إحنا أصلاً قافلين الـ retry في useApiQuery، بس ده أمان زيادة
            retry: false,
            // متعملش refetch تلقائي لما اليوزر يرجع لصفحة الموقع
            refetchOnWindowFocus: false,
            // مدة بقاء الداتا "جديدة" قبل ما يحصلها refetch في الخلفية
            staleTime: 5 * 60 * 1000, // 5 دقائق
            // مدة بقاء الداتا في الكاش بعد ما الكومبوننت يتمسح
            gcTime: 10 * 60 * 1000, // 10 دقائق
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* دي أداة الـ debug، بتشتغل بس في الـ development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
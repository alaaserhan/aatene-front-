"use client";

import { useAuthStore } from "@/src/stores/auth-store";
import { useEffect } from "react";

/**
 * كومبوننت بيعمل مزامنة للـ Auth Store مع الكوكيز
 * بيشتغل مرة واحدة بس أول ما الصفحة تفتح
 */
export function AuthHydrator() {
  // بناخد الدالة والحالة من الـ store
  const { isHydrated, hydrate } = useAuthStore();

  useEffect(() => {
    // لو الـ store معملوش مزامنة قبل كدا...
    if (!isHydrated) {
      hydrate();
    }
  }, []); // ⭐️ بيشتغل مرة واحدة بس عند التحميل

  return null; // الكومبوننت ده مبيظهرش أي حاجة
}
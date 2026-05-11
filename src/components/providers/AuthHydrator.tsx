"use client";

import { useAuthStore } from "@/src/stores/auth-store";
import { useEffect } from "react";
import { getAccount } from "@/src/features/(web)/settings/api";
import Cookies from "js-cookie";

/**
 * كومبوننت بيعمل مزامنة للـ Auth Store مع الكوكيز
 * ويُحدِّث بيانات المستخدم (avatar_url وغيرها) من الـ API عند كل تحميل
 */
export function AuthHydrator() {
  const { isHydrated, hydrate, isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // بعد الـ hydration، لو المستخدم مسجل دخول نُحدِّث بياناته من الـ API
  useEffect(() => {
    const token = Cookies.get("token");
    if (isHydrated && isLoggedIn && token) {
      getAccount()
        .then((data) => {
          if (data?.user) {
            useAuthStore.getState().updateUser(data.user);
          }
        })
        .catch(() => {
          // silent fail - لو فشل الطلب نستمر بالبيانات المحلية
        });
    }
  }, [isHydrated, isLoggedIn]);

  return null;
}

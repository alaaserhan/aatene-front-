import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { ErrorResponse } from "../types";
import { useAuthStore } from "@/src/stores/auth-store";

export let isLoggingOut = false;
export function setLoggingOut(value: boolean) {
  isLoggingOut = value;
}

// --- (1) إنشاء الـ Axios Instance ---
const api: AxiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://backend.aatene.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});
// --------------------------------------------------------

// --- (2) Request Interceptor (بيشتغل قبل ما الطلب يتبعت) ---
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {

    let token: string | undefined;
    let lang: string | undefined;

    if (typeof window === "undefined") {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        token = cookieStore.get("token")?.value;
        lang = cookieStore.get("lang")?.value;
      } catch (error) {
        console.warn("Could not read server cookies in axios.ts:", error);
      }
    } else {
      token = Cookies.get("token");
      lang = Cookies.get("lang");
    }

    // We no longer abort requests if there's no token. 
    // Public endpoints should be accessible, and private ones will be handled by the response interceptor (401).


    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    lang = lang || "en";
    if (lang && config.headers) {
      config.headers["X-Culture"] = lang;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);
// --------------------------------------------------------

// --- (4) Response Interceptor (بيشتغل بعد ما الرد يرجع) ---
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (axios.isCancel(error) || error.message === "Canceled" || isLoggingOut) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        if (!window.location.pathname.includes("/login")) {
          toast.error("Your session has expired. Please log in again.");
          /** إزالة كل كوكيز الجلسة — كان يُمسح token فقط فيسبب حالة «مسجّل» في الواجهة بدون token للسيرفر */
          useAuthStore.getState().logout();
          try {
            localStorage.removeItem("auth-storage");
          } catch {
            /* ignore */
          }
          const lang = Cookies.get("lang") || "ar";
          window.location.href = `/${lang}/login`;
        }
      }
    }

    if (error.response && error.response.status !== 401) {
      // x-silent: الطلبات التي ترسل هذا الهيدر لا نعرض toast عند خطأها (مثل user-guide-videos)
      if (error.config?.headers?.["x-silent"] === "true") {
        return Promise.reject(error);
      }

      const responseData = error.response.data as ErrorResponse;
      let message = responseData?.message || "هناك خطأ ما";

      // ⭐ أولاً: حاول أخذ أول خطأ من errors object
      if (typeof responseData?.errors === "string") {
        message = responseData.errors;
      } else if (responseData?.errors && typeof responseData.errors === "object" && Object.keys(responseData.errors).length > 0) {
        const firstErrorKey = Object.keys(responseData.errors)[0];
        const firstErrorValue = responseData.errors[firstErrorKey];
        if (Array.isArray(firstErrorValue) && firstErrorValue.length > 0) {
          message = firstErrorValue[0];
        } else if (typeof firstErrorValue === "string") {
          message = firstErrorValue;
        }
      }

      if (typeof window !== "undefined") {
        toast.error(message);
      }
    }
    else if (!error.response) {
      if (typeof window !== "undefined") {
        toast.error("خطأ في الاتصال، يرجى التحقق من اتصالك بالإنترنت.");
      }
    }

    return Promise.reject(error);
  }
);
// --------------------------------------------------------

export default api;
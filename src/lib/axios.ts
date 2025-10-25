import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { ErrorResponse } from "../types";

// --- (1) إنشاء الـ Axios Instance ---
const api: AxiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://aatene.dev/api", 
  headers: {
    "Content-Type": "application/json",
  },
});
// --------------------------------------------------------

// --- (2) Request Interceptor (بيشتغل قبل ما الطلب يتبعت) ---
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    
    // --- (3) دالة جلب الكوكيز (سيرفر أو كلاينت) ---
    let token: string | undefined;
    let lang: string | undefined;
    // let currency: string | undefined;
    // let countryCode: string | undefined;

    if (typeof window === "undefined") {
      // (Server-Side)
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        token = cookieStore.get("token")?.value;
        lang = cookieStore.get("lang")?.value;
        // currency = cookieStore.get("currency")?.value;
        // countryCode = cookieStore.get("countryCode")?.value;
      } catch (error) {
        console.warn("Could not read server cookies in axios.ts:", error);
      }
    } else {
      // (Client-Side)
      token = Cookies.get("token");
      lang = Cookies.get("lang");
      // currency = Cookies.get("currency");
      // countryCode = Cookies.get("countryCode");
    }
    // --- نهاية دالة جلب الكوكيز ---

    // 1️⃣ إضافة التوكن (Authorization) (فقط لو موجود)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2️⃣ إضافة اللغة (X-Culture)
    lang = lang || "en"; // حط لغة افتراضية
    if (lang && config.headers) {
      config.headers["X-Culture"] = lang;
    }

    // // 3️⃣ إضافة العملة (X-Currency)
    // if (currency && config.headers) {
    //   config.headers["X-Currency"] = currency;
    // }

    // // 4️⃣ إضافة الدولة (X-Country)
    // if (countryCode && config.headers) {
    //   config.headers["X-Country"] = countryCode;
    // }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);
// --------------------------------------------------------

// --- (4) Response Interceptor (بيشتغل بعد ما الرد يرجع) ---
api.interceptors.response.use(
  // (أ) في حالة النجاح: رجّع الرد زي ما هو
  (response: AxiosResponse) => response,

  // (ب) في حالة الفشل: اهندل الخطأ
  async (error: AxiosError) => {
    
    // (السيناريو الأول) الخطأ 401: التوكن خلص أو مش موجود
    if (error.response?.status === 401) {
      // شيلنا كل لوجيك الـ refresh
      // شغالين في المتصفح بس (عشان نـ redirect)
      if (typeof window !== "undefined") {
        
        // امنع الـ redirect لو كنا أصلاً في صفحة اللوجن
        if (!window.location.pathname.includes("/login")) {
          toast.error("Your session has expired. Please log in again.");
          // امسح الكوكي
          Cookies.remove("token"); // ⭐️ اتأكد من اسم الكوكي
          // وديه لصفحة اللوجن
          window.location.href = "/login";
        }
      }
    }

    // (السيناريو الثاني) أي خطأ تاني (400, 404, 500, ...)
    if (error.response && error.response.status !== 401) {
      let message = "An unexpected error occurred.";

      const responseData = error.response.data as ErrorResponse;

      if (responseData && responseData.message) {
        message = responseData.message;
      } 

      if (typeof window !== "undefined") {
        toast.error(message);
      }
    }
    // (السيناريو الثالث) مفيش نت أو السيرفر واقع
    else if (!error.response) {
      if (typeof window !== "undefined") {
        toast.error("Network Error: Please check your connection.");
      }
    }

    // لازم ترمي الخطأ تاني عشان الـ useQuery يحس بيه
    return Promise.reject(error);
  }
);
// --------------------------------------------------------

export default api;
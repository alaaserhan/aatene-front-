import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import Cookies from "js-cookie";
import { ErrorResponse } from "../types";
import { toast } from "sonner";
import { loginUrlWithAuthRequired } from "@/src/auth/links";
import { AUTH_COOKIE, LANG_COOKIE } from "@/src/auth/cookies";
import { API_BASE_URL } from "@/src/lib/config";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Suppress the global error toast for this request. Prefer over the legacy `x-silent` header. */
    silent?: boolean;
  }
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token: string | undefined;
    let lang: string | undefined;

    if (typeof window === "undefined") {
      try {
        const { cookies } = await import("next/headers");
        const jar = await cookies();
        token = jar.get(AUTH_COOKIE)?.value;
        lang = jar.get(LANG_COOKIE)?.value;
      } catch (error) {
        console.warn("Could not read server cookies in axios.ts:", error);
      }
    } else {
      token = Cookies.get(AUTH_COOKIE);
      lang = Cookies.get(LANG_COOKIE);
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers) {
      config.headers["X-Culture"] = lang ?? "ar";
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

function isSilent(config?: InternalAxiosRequestConfig): boolean {
  if (!config) return false;
  if (config.silent === true) return true;
  // Back-compat: x-silent header is still honored.
  return config.headers?.["x-silent"] === "true";
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (axios.isCancel(error) || error.message === "Canceled") {
      return Promise.reject(error);
    }

    // Lazy import breaks the cycle: actions.ts → auth/api.ts → axios.ts.
    const { isSigningOut, forceSignOut } = await import("@/src/auth/actions");
    if (isSigningOut()) return Promise.reject(error);

    if (error.response?.status === 401 && typeof window !== "undefined") {
      const token = Cookies.get(AUTH_COOKIE);
      // Guests hitting a protected endpoint legitimately get 401 — don't redirect them.
      // Only sign-out when we HAD a session and the server invalidated it.
      if (token && !window.location.pathname.includes("/login")) {
        const lang = Cookies.get(LANG_COOKIE) || "ar";
        // No explicit target: loginUrlWithAuthRequired captures the current
        // page so the user comes back here after re-authenticating.
        forceSignOut(loginUrlWithAuthRequired(lang));
      }
      return Promise.reject(error);
    }

    const silent = isSilent(error.config as InternalAxiosRequestConfig | undefined);
    if (!silent && typeof window !== "undefined") {
      if (error.response) {
        const responseData = error.response.data as ErrorResponse | undefined;
        let message = responseData?.message || "هناك خطأ ما";

        if (typeof responseData?.errors === "string") {
          message = responseData.errors;
        } else if (
          responseData?.errors &&
          typeof responseData.errors === "object" &&
          Object.keys(responseData.errors).length > 0
        ) {
          const firstKey = Object.keys(responseData.errors)[0];
          const firstVal = responseData.errors[firstKey];
          if (Array.isArray(firstVal) && firstVal.length > 0) {
            message = firstVal[0];
          } else if (typeof firstVal === "string") {
            message = firstVal;
          }
        }
        toast.error(message);
      } else {
        toast.error("خطأ في الاتصال، يرجى التحقق من اتصالك بالإنترنت.");
      }
    }

    return Promise.reject(error);
  }
);

export default api;

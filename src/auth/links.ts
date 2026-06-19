/** يقرأها `LoginForm` لعرض رسالة بعد إعادة التوجيه من إجراء يتطلب تسجيل دخول */
export const LOGIN_AUTH_REQUIRED_REASON = "auth_required";

export function loginUrlWithAuthRequired(locale: string): string {
  const lc = (locale || "ar").replace(/^\/+|\/+$/g, "");
  return `/${lc}/login?reason=${LOGIN_AUTH_REQUIRED_REASON}`;
}

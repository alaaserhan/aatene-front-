// src/lib/api-helper.ts
import Cookies from "js-cookie";

export const getDynamicEndpoint = (path: string) => {
  const userType = Cookies.get("user_type");
  const prefix = userType === "merchant" ? "/merchants" : "/admin";

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${prefix}${cleanPath}`;
};
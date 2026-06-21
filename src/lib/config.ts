export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";
export const API_BASE_URL = `${BASE_URL}/api`;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
}

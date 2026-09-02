// src/features/auth/types.ts

/**
 * The canonical User shape. The backend returns different subsets from
 * different endpoints:
 *   - /auth/login + /auth/register: include `slug`, `is_active`, `referral_code`,
 *     `last_login_at`, `created_at`, and (for admins) `permissions`
 *   - /auth/account: includes `city` / `district`, may omit the audit fields
 *
 * Anything not guaranteed on every response is optional here. Consumers must
 * use `?.` or guard before reading; that's the price of one User type that
 * survives every endpoint.
 */
export interface User {
  // Always present
  id: number;
  user_type: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  fullname: string;
  avatar: string | null;

  // Image URLs — backend is inconsistent; normalizeUser keeps `*_url` URL-shaped
  avatar_url?: string | null;
  /** رابط صورة الغلاف (تعاد من ProfileResource كـ `cover` — نحتفظ بالاثنين للتوافق) */
  cover?: string | null;
  cover_url?: string | null;

  /** Registration doesn't enforce it, so the email can be unverified. Backend sends true/false or 1/0. */
  is_email_verified?: boolean | number | string;

  // Profile fields — present on most endpoints
  gender?: string | null;
  bio?: string | null;
  date_of_birth?: string | null;
  followers_count?: number | string;
  followings_count?: number | string;

  // /auth/account adds these
  city?: { id: number; name: string } | null;
  district?: { id: number; name: string } | null;

  // /auth/login + /auth/register surface these; /auth/account may not
  slug?: string;
  is_active?: string | boolean;
  referral_code?: string | null;
  last_login_at?: string;
  created_at?: string;

  // Admin tokens only
  permissions?: string[];
}


// Response for successful Login or Register
export interface AuthResponse {
  status: boolean;
  message: string;
  user: User;
  token: string;
}

export interface AccountResponse {
  status: boolean;
  message: string;
  user: User;
}

// Response for successful Logout
export interface LogoutResponse {
  status: boolean;
  message: string;
}

// Response for sending password reset code
export interface SendCodeResponse {
  status: boolean;
  message: string;
  id: string; // The ID needed for resend/verify
  code: string;
}

// Response for verifying password reset code
export interface VerifyCodeResponse {
  status: boolean;
  message: string;
  verified: boolean;
  id: string;
}

// Response for resending OTP code
export interface ResendCodeResponse {
  status: boolean;
  message: string;
  id: string;
  code: string;
}

export interface ResetPasswordResponse {
  status: boolean;
  message: string;
}

// Generic API Error structure (adjust if needed based on actual errors)
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>; // For validation errors
}

// --- Input Types for API functions ---

export interface LoginCredentials {
  login: string; // email or phone
  password?: string;
  device_token?: string | null;
  device_name?: string | null;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password?: string;
  device_token?: string | null;
  device_name?: string | null;
}

export interface SendCodePayload {
  identifier: string; // email@email.com
}

export interface ResendCodePayload {
  id: string;
  otp: boolean;
}

export interface VerifyCodePayload {
  id: string;
  code: string;
}

export interface ResetPasswordPayload {
  id: string;
  code: string;
  password: string;
  password_confirmation: string;
}

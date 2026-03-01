// src/features/auth/types.ts

// The structure of the User object returned by login/register
export interface User {
  id: number;
  fullname: string;
  avatar: string | null;
  avatar_url: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_active: string | boolean; // API seems inconsistent (string "1" vs boolean true)
  gender: string | null;
  referral_code: string | null;
  last_login_at: string; // ISO date string
  followers_count: number | string;
  followings_count: number | string;
  bio: string | null;
  date_of_birth: string | null; // Assuming ISO date string or similar
  user_type: string;
  permissions?: string[];
  created_at: string;
}


// Response for successful Login or Register
export interface AuthResponse {
  status: boolean;
  message: string;
  user: User;
  token: string;
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

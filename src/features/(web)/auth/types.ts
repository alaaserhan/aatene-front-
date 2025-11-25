// src/features/auth/types.ts

// The structure of the User object returned by login/register
export interface User {
  id: number;
  fullname: string;
  avatar: string;
  avatar_url: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_active: string | boolean; // API seems inconsistent (string "1" vs boolean true)
  gender: string | null;
  referral_code: string | null;
  last_login_at: string; // ISO date string
  followers_count: number;
  followings_count: number;
  bio: string | null;
  date_of_birth: string | null; // Assuming ISO date string or similar
  user_type: string; // e.g., "client"
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
}

// Response for verifying password reset code (assuming structure)
export interface VerifyCodeResponse {
  status: boolean;
  message: string;
  // Maybe returns a token if it logs the user in? Add if needed
  // token?: string;
  // user?: User;
}

// Response for resending OTP code (assuming structure)
export interface ResendCodeResponse {
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
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password?: string;
}   

export interface SendCodePayload {
  identifier: string; // email or phone
}

export interface VerifyCodePayload {
  code: string;
  password?: string;
}
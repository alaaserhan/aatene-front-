/**
 * Public surface of the auth module.
 *
 * Everything auth-related lives here:
 *   - cookies / token lifecycle
 *   - REST endpoints + React Query hooks
 *   - useSession (single source of truth for the authenticated user)
 *   - signIn / signOut actions
 *   - sign-out event hook for other slices to subscribe to
 *   - Form components (LoginForm, SignupForm, ForgotPasswordForm)
 */

export {
  AUTH_COOKIE,
  USER_TYPE_COOKIE,
  ADMIN_PERMISSIONS_COOKIE,
  LANG_COOKIE,
  AUTH_COOKIE_ATTRS,
  getAuthToken,
  getAuthTokenClient,
  getAuthTokenServer,
  getLangClient,
  setAuthCookies,
  clearAuthCookies,
} from "./cookies";

export { sessionQueryKey } from "./keys";
export { normalizeUser } from "./normalize";

export {
  signIn,
  signOut,
  forceSignOut,
  isSigningOut,
  onSignOut,
} from "./actions";

export {
  useSession,
  useUser,
  useIsAuthenticated,
  type Session,
} from "./session";

export {
  AuthBootProvider,
  useAuth,
  type AuthContextValue,
} from "./context";

export {
  useLogin,
  useRegister,
  useLogout,
  useSendCode,
  useResendCode,
  useVerifyCode,
  useResetPassword,
} from "./hooks";

export {
  getAccount,
  loginUser,
  registerUser,
  logoutUser,
  sendCode,
  resendCode,
  verifyCode,
  resetPassword,
  createFormData,
} from "./api";

export type {
  User,
  AccountResponse,
  AuthResponse,
  LogoutResponse,
  LoginCredentials,
  RegisterData,
  SendCodePayload,
  SendCodeResponse,
  ResendCodePayload,
  ResendCodeResponse,
  VerifyCodePayload,
  VerifyCodeResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  ApiError,
} from "./types";

export {
  LOGIN_AUTH_REQUIRED_REASON,
  loginUrlWithAuthRequired,
} from "./links";

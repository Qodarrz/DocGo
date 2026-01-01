// client/auth.ts
import { API_BASE_URL, AUTH_ENDPOINTS } from "./apiurls";
import { apiFetch } from "./http";

// Payload types
export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type VerifyPayload = {
  email: string;
  otp: string;
};

// Login
export async function login(payload: LoginPayload) {
  return apiFetch(`${AUTH_ENDPOINTS.LOGIN}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Register
export async function register(payload: RegisterPayload) {
  return apiFetch(`${AUTH_ENDPOINTS.REGISTER}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Logout
export async function logout() {
  return apiFetch(`${AUTH_ENDPOINTS.LOGOUT}`, {
    method: "POST",
  });
}

// Verify OTP
export async function verify(payload: VerifyPayload) {
  return apiFetch(`${AUTH_ENDPOINTS.VERIFY}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Resend OTP
export async function resendOtp(email: string) {
  return apiFetch(`/auth/resend-otp`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Get current user
export async function getMe() {
  return apiFetch(`${AUTH_ENDPOINTS.ME}`);
}

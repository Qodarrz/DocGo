// client/http.ts
import { getTokenCookie } from "./token";

// Tambahkan base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";


/**
 * Fetch biasa dengan token (authed)
 */
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getTokenCookie();
  const fullUrl = API_BASE_URL + (url.startsWith("http") ? url : url);

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    const error = new Error(
      errorData.message || `Request failed: ${response.status}`
    );
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
}

/**
 * Fetch publik tanpa token
 */
export async function apiFetchPublic(url: string, options: RequestInit = {}) {
  const fullUrl = API_BASE_URL + (url.startsWith("http") ? url : url);

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    const error = new Error(
      errorData.message || `Request failed: ${response.status}`
    );
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
}

// versi helper GET publik
export async function apiGetPublic(url: string) {
  return apiFetchPublic(url, { method: "GET" });
}

// Helper function untuk GET request
export async function apiGet(url: string) {
  return apiFetch(url, { method: "GET" });
}

// Helper function untuk POST request
export async function apiPost(url: string, data: any) {
  return apiFetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Helper function untuk PUT request
export async function apiPut(url: string, data: any) {
  return apiFetch(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Helper function untuk PATCH request
export async function apiPatch(url: string, data: any) {
  return apiFetch(url, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Helper function untuk DELETE request
export async function apiDelete(url: string) {
  return apiFetch(url, { method: "DELETE" });
}

import type { ContactSignupResponse, ProductArchivePage, SignupStatus } from '../types';

const rawApiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8080';
const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, '');
const sessionStorageKey = 'bar-scan-session';
const authExpiredEventName = 'bar-scan-auth-expired';
const authRefreshedEventName = 'bar-scan-auth-refreshed';
const tokenRefreshWindowMs = 60_000;

type ApiErrorBody = {
  message?: string;
  error?: string;
};

type StoredSession = {
  token?: string;
};

function getStoredToken() {
  const storedValue = localStorage.getItem(sessionStorageKey);

  if (!storedValue) {
    return undefined;
  }

  if (!storedValue.startsWith('{')) {
    return storedValue;
  }

  try {
    const token = (JSON.parse(storedValue) as StoredSession).token;

    if (token) {
      localStorage.setItem(sessionStorageKey, token);
      return token;
    }
  } catch {
    // Fall through and clear malformed legacy session values.
  }

  localStorage.removeItem(sessionStorageKey);
  return undefined;
}

function getRequiredToken() {
  const token = getStoredToken();

  if (!token) {
    throw new Error('Missing authentication token.');
  }

  return token;
}

function decodeTokenExpiry(token: string) {
  try {
    const [, payload] = token.split('.');
    if (!payload) {
      return 0;
    }
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const claims = JSON.parse(atob(padded)) as { exp?: number };
    return claims.exp ? claims.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

function storeToken(token: string) {
  localStorage.setItem(sessionStorageKey, token);
  window.dispatchEvent(new CustomEvent(authRefreshedEventName, { detail: { token } }));
}

function clearTokenAndNotify() {
  localStorage.removeItem(sessionStorageKey);
  window.dispatchEvent(new Event(authExpiredEventName));
}

async function refreshToken(token: string): Promise<string | undefined> {
  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return undefined;
  }

  const body = (await response.json()) as { token?: string };
  if (!body.token) {
    return undefined;
  }

  storeToken(body.token);
  return body.token;
}

export async function refreshStoredSessionToken(): Promise<string | undefined> {
  const token = getStoredToken();
  if (!token) {
    return undefined;
  }

  return refreshToken(token);
}

async function getRequestToken() {
  const token = getRequiredToken();
  const expiresAt = decodeTokenExpiry(token);

  if (expiresAt > Date.now() + tokenRefreshWindowMs) {
    return token;
  }

  const refreshedToken = await refreshToken(token);
  if (!refreshedToken) {
    clearTokenAndNotify();
    throw new Error('Authentication expired. Please log in again.');
  }

  return refreshedToken;
}

async function retryAfterRefresh(response: Response, retry: (token: string) => Promise<Response>) {
  if (response.status !== 401) {
    return response;
  }

  const token = getStoredToken();
  if (!token) {
    clearTokenAndNotify();
    return response;
  }

  const refreshedToken = await refreshToken(token);
  if (!refreshedToken) {
    clearTokenAndNotify();
    return response;
  }

  const retryResponse = await retry(refreshedToken);
  if (retryResponse.status === 401) {
    clearTokenAndNotify();
  }

  return retryResponse;
}

async function parseError(response: Response): Promise<Error> {
  if (!response.ok) {
    let errorMessage = `${response.status} ${response.statusText}`;

    try {
      const errorBody = (await response.json()) as ApiErrorBody;
      errorMessage = errorBody.message ?? errorBody.error ?? errorMessage;
    } catch {
      // Keep the HTTP status fallback when the backend has no JSON error body.
    }

    return new Error(errorMessage);
  }

  return new Error('Unexpected API response');
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = await getRequestToken();
  const request = (nextToken: string) => fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${nextToken}`,
    },
  });
  const response = await retryAfterRefresh(await request(token), request);

  return readJson<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const token = await getRequestToken();
  const request = (nextToken: string) => fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${nextToken}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const response = await retryAfterRefresh(await request(token), request);

  return readJson<T>(response);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const token = await getRequestToken();
  const request = (nextToken: string) => fetch(`${apiBaseUrl}${path}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${nextToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const response = await retryAfterRefresh(await request(token), request);

  return readJson<T>(response);
}

export async function apiDelete(path: string): Promise<void> {
  const token = await getRequestToken();
  const request = (nextToken: string) => fetch(`${apiBaseUrl}${path}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${nextToken}`,
    },
  });
  const response = await retryAfterRefresh(await request(token), request);

  if (!response.ok) {
    throw await parseError(response);
  }
}

export function login(payload: { username: string; password: string }) {
  return publicApiPost<{ token: string }>('/auth/login', { ...payload, clientType: 'web' });
}

export function requestContactSignup(payload: {
  companyName: string;
  allowedUserCount: number;
  adminEmail: string;
  message: string;
}) {
  return publicApiPost<ContactSignupResponse>('/signup/contact', payload);
}

export function getSignupStatus(signupId: string) {
  return publicApiGet<SignupStatus>(`/signup/${signupId}`);
}

export function completeDevPayment(paymentSessionId: string) {
  return publicApiPost<SignupStatus>(`/payments/dev/complete/${paymentSessionId}`);
}

async function publicApiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  return readJson<T>(response);
}

async function publicApiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return readJson<T>(response);
}

async function apiGetBlob(path: string, accept: 'text/csv' | 'text/plain'): Promise<Blob> {
  const token = await getRequestToken();
  const request = (nextToken: string) => fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: accept,
      Authorization: `Bearer ${nextToken}`,
    },
  });
  const response = await retryAfterRefresh(await request(token), request);

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.blob();
}

export function getProductArchiveProducts(params: {
  shopId: string;
  startDate: string;
  endDate: string;
  page: number;
  size: number;
}) {
  const query = new URLSearchParams({
    shopId: params.shopId,
    startDate: params.startDate,
    endDate: params.endDate,
    page: String(params.page),
    size: String(params.size),
  });

  return apiGet<ProductArchivePage>(`/products/archive/products?${query.toString()}`);
}

export async function exportProductArchiveProducts(params: {
  shopId: string;
  startDate: string;
  endDate: string;
  format: 'csv' | 'txt';
}) {
  const query = new URLSearchParams({
    shopId: params.shopId,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return apiGetBlob(`/products/archive/export?${query.toString()}`, params.format === 'txt' ? 'text/plain' : 'text/csv');
}


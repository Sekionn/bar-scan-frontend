import type { ContactSignupResponse, CreatedUser, Product, Role, Shop, SignupStatus } from '../types';

const rawApiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8080';
const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, '');

type RequestOptions = Omit<RequestInit, 'body'> & {
  token?: string;
  body?: unknown;
};

type ApiErrorBody = {
  message?: string;
  error?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let errorMessage = `${response.status} ${response.statusText}`;

    try {
      const errorBody = (await response.json()) as ApiErrorBody;
      errorMessage = errorBody.message ?? errorBody.error ?? errorMessage;
    } catch {
      // Keep the HTTP status fallback when the backend has no JSON error body.
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function startSignup(payload: {
  companyName: string;
  locationName: string;
  allowedUserCount: number;
  adminEmail: string;
  adminPassword: string;
}) {
  return request<SignupStatus>('/signup/start', {
    method: 'POST',
    body: payload,
  });
}

export function requestContactSignup(payload: {
  companyName: string;
  locationName: string;
  allowedUserCount: number;
  adminEmail: string;
  message: string;
}) {
  return request<ContactSignupResponse>('/signup/contact', {
    method: 'POST',
    body: payload,
  });
}

export function completeDevPayment(paymentSessionId: string) {
  return request<SignupStatus>(`/payments/dev/complete/${paymentSessionId}`, {
    method: 'POST',
  });
}

export function getSignupStatus(signupId: string) {
  return request<SignupStatus>(`/signup/${signupId}`);
}

export function login(payload: { username: string; password: string }) {
  return request<{ token: string }>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function getCurrentUser(token: string) {
  return request<{ username: string }>('/auth/me', { token });
}

export function registerUser(token: string, payload: {
  username: string;
  password: string;
  shopId?: string;
  role?: Extract<Role, 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MANAGER'>;
}) {
  return request<CreatedUser>('/auth/register', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function getShops(token: string) {
  return request<Shop[]>('/shops', { token });
}

export function createShop(token: string, payload: { name: string }) {
  return request<Shop>('/shops', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function setInitialAdminPassword(token: string, adminUserId: string, password: string) {
  return request<CreatedUser>(`/super/users/${adminUserId}/password`, {
    method: 'PUT',
    token,
    body: { password },
  });
}

export function getProducts(token: string, quarter?: string) {
  const query = quarter ? `?quarter=${encodeURIComponent(quarter)}` : '';
  return request<Product[]>(`/products${query}`, { token });
}

export async function exportProducts(token: string, quarter: string | undefined, format: 'csv' | 'txt') {
  const params = new URLSearchParams({ format });

  if (quarter) {
    params.set('quarter', quarter);
  }

  const response = await fetch(`${apiBaseUrl}/products/export?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Export failed: ${response.status} ${response.statusText}`);
  }

  return response.blob();
}

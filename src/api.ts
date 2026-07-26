const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const apiBaseUrl = configuredBaseUrl.replace(/\/$/, '');

export function apiUrl(path: string): string {
  return `${apiBaseUrl}/${path.replace(/^\//, '')}`;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(apiUrl(path), options);

  if (!response.ok) {
    throw new Error(`API request failed (${response.status} ${response.statusText})`);
  }

  return response;
}

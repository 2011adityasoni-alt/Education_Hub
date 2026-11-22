const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/** Mirrors the API's structured error body (apps/api/src/common/filters). */
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public requestId?: string, public details?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>, signal?: AbortSignal): Promise<T> {
  if (!BASE_URL) throw new ApiError(0, 'CONFIG', 'EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env.');
  const qs = Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}${qs ? `?${qs}` : ''}`, { headers: { Accept: 'application/json' }, signal });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError(0, 'NETWORK', 'Check your internet connection and try again.');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.code ?? 'UNKNOWN', body?.message ?? 'Something went wrong on our side.', body?.requestId, body?.details);
  return body as T;
}

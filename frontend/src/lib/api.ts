import { API_URL } from "@/lib/constants";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

/**
 * Thin fetch wrapper around the Express/Prisma backend. The storefront falls back to
 * bundled mock data (src/data/*) when the API is unreachable, so the site remains
 * fully browsable during local frontend-only development.
 */
export async function apiFetch<T>(path: string, options: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  const body = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || !body.success) {
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return body.data;
}

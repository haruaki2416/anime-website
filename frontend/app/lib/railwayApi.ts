export const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1234").replace(/\/$/, "");

export async function apiRequest<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload as T;
}

export type AccountData = {
  bookmarks?: any[];
  keepWatching?: any;
  mediaListSavedByStatus?: Record<string, any[]>;
  notifications?: any[];
  episodesWatched?: Record<string, any>;
  chaptersRead?: Record<string, any>;
  [key: string]: any;
};

export async function getAccountData(): Promise<AccountData> {
  const result = await apiRequest<{ data: AccountData }>("/auth/data");
  return result.data || {};
}

export async function patchAccountData(data: Partial<AccountData>): Promise<AccountData> {
  const result = await apiRequest<{ data: AccountData }>("/auth/data", {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
  return result.data || {};
}

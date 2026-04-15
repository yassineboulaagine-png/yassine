const API_BASE = "http://127.0.0.1:8000/api";

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Email ou mot de passe incorrect");
  }

  return res.json() as Promise<{ token: string; user: { role: string; [key: string]: unknown } }>;
}

export function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function apiFetch(url: string, options: RequestInit = {}) {
  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeader(),
      ...options.headers,
    },
  });
}

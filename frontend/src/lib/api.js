// src/lib/api.js

// كنقرأو العنوان من .env وإيلا مالقاش كياخد هادا كاحتياط
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://Projet_PFF.test/api";

// LOGIN
export async function apiLogin(email, password) {
  try {
    const res = await fetch(`${API_URL}/login`, { // ✅ استعملنا API_URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Email ou mot de passe incorrect");
    }

    return data; 
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
}

// GENERIC FETCH (للمناداة على أي API أخرى)
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${url}`, { // ✅ استعملنا API_URL
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  return res.json();
}
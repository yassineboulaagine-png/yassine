const API_BASE = "http://projet_pff.test/Back-end/public/api";

// LOGIN
export async function apiLogin(email, password) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // 1. كنقرأو الـ JSON مرة وحدة فقط
    const data = await res.json();

    console.log("🔍 RAW RESPONSE FROM /login:", data);
    console.log("🔍 Response status:", res.ok);
    console.log("🔍 Token value:", data?.token);
    console.log("🔍 User value:", data?.user);

    // 2. كنتشكيو واش الـ Response فيه مشكل
    if (!res.ok) {
      // كترميو Error فيه الميساج اللي جاي من Laravel
      throw new Error(data.message || "Email ou mot de passe incorrect");
    }

    return data; 
  } catch (error) {
    // هاد السطر مهم باش الـ Error يطلع ليك فـ الـ Console فاش يوقع
    console.error("Fetch Error:", error);
    throw error; // كنعاودو نلوحوه باش يوصل للـ catch اللي فـ Login.jsx
  }
}

// AUTH HEADER
export function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// GENERIC FETCH
export async function apiFetch(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeader(),
      ...(options.headers || {}),
    },
  });

  return res.json();
}
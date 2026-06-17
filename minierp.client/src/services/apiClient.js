const TOKEN_KEY = "minierp_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * fetch wrapper, který připojí JWT Authorization header.
 * Při 401 odpovědi smaže token a vyvolá odhlášení v celé aplikaci.
 */
export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new Event("unauthorized"));
  }

  return res;
}

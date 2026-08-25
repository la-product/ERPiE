const TOKEN_KEY = "minierp_token";
const USER_KEY = "minierp_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Zjistí, zda uloženému JWT vypršela platnost (podle claimu "exp").
 * Token bez čitelného "exp" je považován za neplatný.
 */
export function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Obnoví přihlášenou session z localStorage (např. po reloadu stránky).
 * Vrátí uloženého uživatele, pokud existuje platný, nevypršelý token, jinak null.
 */
export function restoreSession() {
  const token = getToken();
  const user = getStoredUser();

  if (!token || !user || isTokenExpired(token)) {
    clearToken();
    return null;
  }

  return user;
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

import { mapFormToCreateUserDto } from "../mappers/userMapper.js";
import { authFetch } from "./apiClient.js";

const API_URL = "/api/user";

/**
 * Načte seznam všech uživatelů
 * @returns {Promise<Array>} Pole UserDTO objektů
 */
export async function getUsers() {
  const res = await authFetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

/**
 * Vytvoří nového uživatele
 * @param {Object} formData - Data z formuláře
 * @returns {Promise<Object>} Vrácený UserDTO
 */
export async function addUser(formData) {
  const createDto = mapFormToCreateUserDto(formData);
  const res = await authFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createDto),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Nepodařilo se vytvořit uživatele.");
  }
  return res.json();
}

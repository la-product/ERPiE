import {
  mapFormToCreateCustomerDto,
  mapFormToUpdateCustomerDto,
} from "../mappers/customerMapper.js";
import { authFetch } from "./apiClient.js";

const API_URL = "/api/customer";

/**
 * Načte seznam všech zákazníků
 * @returns {Promise<Array>} Pole CustomerDTO objektů
 */
export async function getCustomers() {
  const res = await authFetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

/**
 * Načte detaily jednoho zákazníka
 * @param {number} id - ID zákazníka
 * @returns {Promise<Object>} CustomerDetailDTO
 */
export async function getCustomerById(id) {
  const res = await authFetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch customer");
  return res.json();
}

/**
 * Vytvoří nového zákazníka
 * @param {Object} formData - Data z formuláře
 * @returns {Promise<Object>} Vrácený CustomerDTO
 */
export async function addCustomer(formData) {
  const createDto = mapFormToCreateCustomerDto(formData);
  const res = await authFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createDto),
  });
  if (!res.ok) throw new Error("Failed to create customer");
  return res.json();
}

/**
 * Aktualizuje zákazníka
 * @param {number} id - ID zákazníka
 * @param {Object} formData - Data z formuláře
 * @returns {Promise<Object>} Vrácený CustomerDTO
 */
export async function updateCustomer(id, formData) {
  const updateDto = mapFormToUpdateCustomerDto(formData);
  const res = await authFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateDto),
  });
  if (!res.ok) throw new Error("Failed to update customer");
  return res.json();
}

/**
 * Smaže zákazníka
 * @param {number} id - ID zákazníka
 * @returns {Promise<void>}
 */
export async function deleteCustomer(id) {
  const res = await authFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete customer");
}

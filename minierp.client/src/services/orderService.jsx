import {
  mapFormToCreateOrderDto,
  mapFormToUpdateOrderDto,
} from "../mappers/orderMapper.js";
import { authFetch } from "./apiClient.js";

const API_URL = "/api/order";

/**
 * Načte seznam všech objednávek
 * @returns {Promise<Array>} Pole OrderDTO objektů
 */
export async function getOrders() {
  const res = await authFetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

/**
 * Načte detaily jedné objednávky
 * @param {number} id - ID objednávky
 * @returns {Promise<Object>} OrderDetailDTO
 */
export async function getOrderById(id) {
  const res = await authFetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

/**
 * Vytvoří novou objednávku
 * @param {Object} formData - Data z formuláře
 * @param {Array} items - Pole OrderItemDTO
 * @returns {Promise<Object>} Vrácený OrderDTO
 */
export async function createOrder(formData, items) {
  const createDto = mapFormToCreateOrderDto(formData, items);
  const res = await authFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createDto),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}

/**
 * Aktualizuje objednávku
 * @param {number} id - ID objednávky
 * @param {Object} formData - Data z formuláře
 * @returns {Promise<Object>} Vrácený OrderDTO
 */
export async function updateOrder(id, formData) {
  const updateDto = mapFormToUpdateOrderDto(formData);
  const res = await authFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateDto),
  });
  if (!res.ok) throw new Error("Failed to update order");
  return res.json();
}

/**
 * Změní stav objednávky
 * @param {number} id - ID objednávky
 * @param {string} status - Nový status
 * @returns {Promise<Object>} Vrácený OrderDTO
 */
export async function updateOrderStatus(id, status) {
  const res = await authFetch(`${API_URL}/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(status),
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
}

/**
 * Smaže objednávku
 * @param {number} id - ID objednávky
 * @returns {Promise<void>}
 */
export async function deleteOrder(id) {
  const res = await authFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete order");
}

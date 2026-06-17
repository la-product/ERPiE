import {
  mapFormToCreateProductDto,
  mapFormToUpdateProductDto,
} from "../mappers/productMapper.js";
import { authFetch } from "./apiClient.js";

const API_URL = "/api/products";

/**
 * Načte seznam všech produktů
 * @returns {Promise<Array>} Pole ProductDTO objektů
 */
export async function getProducts() {
  const res = await authFetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

/**
 * Načte detaily jednoho produktu
 * @param {number} id - ID produktu
 * @returns {Promise<Object>} ProductDetailDTO
 */
export async function getProductById(id) {
  const res = await authFetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

/**
 * Vytvoří nový produkt
 * @param {Object} formData - Data z formuláře
 * @returns {Promise<Object>} Vrácený ProductDTO
 */
export async function addProduct(formData) {
  const createDto = mapFormToCreateProductDto(formData);
  const res = await authFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createDto),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

/**
 * Aktualizuje produkt
 * @param {number} id - ID produktu
 * @param {Object} formData - Data z formuláře
 * @returns {Promise<Object>} Vrácený ProductDTO
 */
export async function updateProduct(id, formData) {
  const updateDto = mapFormToUpdateProductDto(formData);
  const res = await authFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateDto),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

/**
 * Smaže produkt
 * @param {number} id - ID produktu
 * @returns {Promise<void>}
 */
export async function deleteProduct(id) {
  const res = await authFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
}

import {
  mapFormToCreateInvoiceDto,
  mapFormToUpdateInvoiceDto,
} from "../mappers/invoiceMapper.js";
import { authFetch } from "./apiClient.js";

const API_URL = "/api/invoice";

/**
 * Načte seznam všech faktur
 * @returns {Promise<Array>} Pole InvoiceDTO objektů
 */
export async function getInvoices() {
  const res = await authFetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}

/**
 * Načte detaily jedné faktury
 * @param {number} id - ID faktury
 * @returns {Promise<Object>} InvoiceDetailDTO
 */
export async function getInvoiceById(id) {
  const res = await authFetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch invoice");
  return res.json();
}

/**
 * Načte číslo faktury, které bude přiděleno další vytvořené faktuře
 * @returns {Promise<string>} Číslo faktury (formát RRRRXXX)
 */
export async function getNextInvoiceNumber() {
  const res = await authFetch(`${API_URL}/next-number`);
  if (!res.ok) throw new Error("Failed to fetch next invoice number");
  const data = await res.json();
  return data.invoiceNumber;
}

/**
 * Vytvoří novou fakturu
 * @param {Object} formData - Data z formuláře
 * @param {Array} items - Pole InvoiceItemDTO
 * @returns {Promise<Object>} Vrácený InvoiceDTO
 */
export async function createInvoice(formData, items) {
  const createDto = mapFormToCreateInvoiceDto(formData, items);
  const res = await authFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createDto),
  });
  if (!res.ok) throw new Error("Failed to create invoice");
  return res.json();
}

/**
 * Aktualizuje fakturu
 * @param {number} id - ID faktury
 * @param {Object} formData - Data z formuláře
 * @returns {Promise<Object>} Vrácený InvoiceDTO
 */
export async function updateInvoice(id, formData) {
  const updateDto = mapFormToUpdateInvoiceDto(formData);
  const res = await authFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateDto),
  });
  if (!res.ok) throw new Error("Failed to update invoice");
  return res.json();
}

/**
 * Změní stav faktury
 * @param {number} id - ID faktury
 * @param {string} status - Nový status
 * @returns {Promise<Object>} Vrácený InvoiceDTO
 */
export async function updateInvoiceStatus(id, status) {
  const res = await authFetch(`${API_URL}/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(status),
  });
  if (!res.ok) throw new Error("Failed to update invoice status");
  return res.json();
}

/**
 * Smaže fakturu
 * @param {number} id - ID faktury
 * @returns {Promise<void>}
 */
export async function deleteInvoice(id) {
  const res = await authFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete invoice");
}

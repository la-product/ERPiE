import {
    mapFormToCreatePurchaseInvoiceDto,
    mapFormToUpdatePurchaseInvoiceDto,
} from "../mappers/purchaseInvoiceMapper.js";
import { authFetch } from "./apiClient.js";

const API_URL = "/api/PurchaseInvoice";

async function ensureSuccess(response, fallbackMessage) {
    if (response.ok) {
        return response;
    }

    const data = await response.json().catch(() => null);
    throw new Error(data?.message || fallbackMessage);
}

export async function getPurchaseInvoices() {
    const response = await authFetch(API_URL);
    await ensureSuccess(response, "Nepodařilo se načíst došlé faktury.");
    return response.json();
}

export async function getPurchaseInvoiceById(id) {
    const response = await authFetch(`${API_URL}/${id}`);
    await ensureSuccess(response, "Nepodařilo se načíst došlou fakturu.");
    return response.json();
}

export async function createPurchaseInvoice(formData, items) {
    const response = await authFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapFormToCreatePurchaseInvoiceDto(formData, items)),
    });
    await ensureSuccess(response, "Nepodařilo se vytvořit došlou fakturu.");
    return response.json();
}

export async function updatePurchaseInvoice(id, formData, items) {
    const response = await authFetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapFormToUpdatePurchaseInvoiceDto(formData, items)),
    });
    await ensureSuccess(response, "Nepodařilo se uložit změny došlé faktury.");
    return response.json();
}

export async function updatePurchaseInvoiceStatus(id, status) {
    const response = await authFetch(`${API_URL}/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(status),
    });
    await ensureSuccess(response, "Nepodařilo se změnit stav došlé faktury.");
    return response.json();
}

export async function deletePurchaseInvoice(id) {
    const response = await authFetch(`${API_URL}/${id}`, { method: "DELETE" });
    await ensureSuccess(response, "Nepodařilo se smazat došlou fakturu.");
}

import { authFetch } from "./apiClient.js";

const API_URL = "/api/receipt";

export async function getReceipts() {
    const res = await authFetch(API_URL);
    if (!res.ok) throw new Error("Nepodařilo se načíst příjemky");
    return res.json();
}

export async function getReceiptById(id) {
    const res = await authFetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Nepodařilo se načíst příjemku");
    return res.json();
}

export async function createReceipt(payload) {
    const res = await authFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Nepodařilo se vytvořit příjemku");
    return res.json();
}

export async function deleteReceipt(id) {
    const res = await authFetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Nepodařilo se smazat příjemku");
}

export async function importInvoice(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await authFetch(`${API_URL}/import-invoice`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Nepodařilo se zpracovat fakturu.");
    }
    return res.json();
}

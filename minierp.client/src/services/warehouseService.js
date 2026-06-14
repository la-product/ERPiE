const API_URL = "/api/warehouse";

export async function getWarehouseItems() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Nepodařilo se načíst sklad");
  return res.json();
}

export async function addWarehouseItem(productId, quantity) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error("Nepodařilo se přidat položku skladu");
  return res.json();
}

export async function updateWarehouseItem(id, quantity) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error("Nepodařilo se aktualizovat položku skladu");
  return res.json();
}

export async function deleteWarehouseItem(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Nepodařilo se smazat položku skladu");
}

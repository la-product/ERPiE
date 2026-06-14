import { useState, useEffect, useCallback } from "react";
import { getReceipts, getReceiptById, createReceipt, deleteReceipt } from "../services/receiptService";
import { getCustomers } from "../services/customerService";
import { getProductDisplayText } from "../mappers/productMapper";
import { formatPrice } from "../utils/formatters";

const VAT_RATE = 0.21;

function Receipts({ view, products, setActivePage, user }) {
    const [receipts, setReceipts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // detail modal
    const [showModal, setShowModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    // add form
    const [form, setForm] = useState({
        supplierId: "",
        receiptDate: new Date().toISOString().slice(0, 10),
        invoiceNumber: "",
    });
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState({ productId: "", quantity: 1, unitPriceExVat: "" });

    const loadData = useCallback(async () => {
        try {
            const [receiptsData, customersData] = await Promise.all([
                getReceipts(),
                getCustomers(),
            ]);
            setReceipts(receiptsData);
            setSuppliers(customersData.filter((c) => c.isSupplier));
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddItem = () => {
        if (!currentItem.productId) { setError("Vyberte produkt."); return; }
        if (!currentItem.unitPriceExVat || parseFloat(currentItem.unitPriceExVat) <= 0) {
            setError("Zadejte cenu bez DPH.");
            return;
        }
        setError(null);

        const product = products.find((p) => p.id === parseInt(currentItem.productId));
        const qty = parseInt(currentItem.quantity) || 1;
        const unitPrice = parseFloat(currentItem.unitPriceExVat);
        const totalExVat = unitPrice * qty;
        const totalIncVat = totalExVat * (1 + VAT_RATE);

        setItems((prev) => [
            ...prev,
            {
                productId: product.id,
                productName: getProductDisplayText(product),
                quantity: qty,
                unitPriceExVat: unitPrice,
                totalPriceExVat: totalExVat,
                totalPriceIncVat: totalIncVat,
            },
        ]);
        setCurrentItem({ productId: "", quantity: 1, unitPriceExVat: "" });
    };

    const handleRemoveItem = (index) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const totalExVat = items.reduce((s, i) => s + i.totalPriceExVat, 0);
    const vatAmount = totalExVat * VAT_RATE;
    const totalIncVat = totalExVat + vatAmount;

    const handleCreate = async () => {
        if (!form.supplierId) { setError("Vyberte dodavatele."); return; }
        if (!form.invoiceNumber.trim()) { setError("Zadejte číslo dokladu faktury."); return; }
        if (items.length === 0) { setError("Přidejte alespoň jednu položku."); return; }

        try {
            await createReceipt({
                supplierId: parseInt(form.supplierId),
                receiptDate: new Date(form.receiptDate).toISOString(),
                invoiceNumber: form.invoiceNumber,
                items: items.map((i) => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    unitPriceExVat: i.unitPriceExVat,
                })),
            });

            setForm({ supplierId: "", receiptDate: new Date().toISOString().slice(0, 10), invoiceNumber: "" });
            setItems([]);
            setError(null);
            await loadData();
            setActivePage("Seznam příjemek");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleOpenDetail = async (receipt) => {
        try {
            const detail = await getReceiptById(receipt.id);
            setSelectedReceipt(detail);
            setShowModal(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Opravdu chcete smazat tuto příjemku? Množství bude odečteno ze skladu.")) {
            try {
                await deleteReceipt(id);
                setReceipts((prev) => prev.filter((r) => r.id !== id));
                setError(null);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // ── ADD VIEW ──────────────────────────────────────────────────────────────
    if (view === "add") {
        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Vytvořit příjemku</h4>
                    <button className="btn btn-outline-secondary" onClick={() => setActivePage("Seznam příjemek")}>
                        <i className="bi bi-arrow-left me-2"></i>Zpět na seznam
                    </button>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                {/* Hlavička příjemky */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-3">Informace o příjemce</h6>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">Dodavatel</label>
                                <select
                                    className="form-select"
                                    value={form.supplierId}
                                    onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                                >
                                    <option value="">— vyberte dodavatele —</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">Datum příjmu</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={form.receiptDate}
                                    onChange={(e) => setForm({ ...form, receiptDate: e.target.value })}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">Číslo dokladu faktury přijaté</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="např. FAP-2026-001"
                                    value={form.invoiceNumber}
                                    onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Přidat položku */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-3">Přidat položku</h6>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-5">
                                <label className="form-label small fw-bold text-uppercase text-muted">Produkt</label>
                                <select
                                    className="form-select"
                                    value={currentItem.productId}
                                    onChange={(e) => setCurrentItem({ ...currentItem, productId: e.target.value })}
                                >
                                    <option value="">— vyberte produkt —</option>
                                    {(products ?? []).map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {getProductDisplayText(p)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold text-uppercase text-muted">Množství (ks)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    min="1"
                                    value={currentItem.quantity}
                                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-uppercase text-muted">Cena bez DPH (CZK)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={currentItem.unitPriceExVat}
                                    onChange={(e) => setCurrentItem({ ...currentItem, unitPriceExVat: e.target.value })}
                                />
                            </div>
                            <div className="col-md-2">
                                <button className="btn btn-primary w-100" onClick={handleAddItem}>
                                    <i className="bi bi-plus-lg me-2"></i>Přidat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seznam položek */}
                {items.length > 0 && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-0">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th className="ps-4">Produkt</th>
                                        <th>Množství</th>
                                        <th>Cena bez DPH</th>
                                        <th>DPH 21 %</th>
                                        <th>Celkem s DPH</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="ps-4 fw-medium">{item.productName}</td>
                                            <td>{item.quantity} ks</td>
                                            <td>{formatPrice(item.totalPriceExVat)}</td>
                                            <td>{formatPrice(item.totalPriceExVat * VAT_RATE)}</td>
                                            <td className="fw-bold">{formatPrice(item.totalPriceIncVat)}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleRemoveItem(index)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-light">
                                    <tr>
                                        <td colSpan={2} className="ps-4 fw-bold">Celkem</td>
                                        <td className="fw-bold">{formatPrice(totalExVat)}</td>
                                        <td className="fw-bold">{formatPrice(vatAmount)}</td>
                                        <td className="fw-bold text-primary">{formatPrice(totalIncVat)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                <button
                    className="btn btn-lg fw-bold px-5"
                    style={{ backgroundColor: "var(--primary)", borderColor: "var(--primary)", color: "#fff" }}
                    onClick={handleCreate}
                    disabled={items.length === 0}
                >
                    <i className="bi bi-check-circle me-2"></i>Uložit příjemku a naskladnit
                </button>
            </div>
        );
    }

    // ── LIST VIEW ─────────────────────────────────────────────────────────────
    return (
        <div>
            {error && <div className="alert alert-danger">{error}</div>}

            {showModal && selectedReceipt && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Příjemka #{selectedReceipt.id} — {selectedReceipt.invoiceNumber}
                                </h5>
                                <button className="btn-close" onClick={() => setShowModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="row mb-3">
                                    <div className="col-md-4">
                                        <div className="text-muted small">Dodavatel</div>
                                        <div className="fw-bold">{selectedReceipt.supplierName}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-muted small">Datum příjmu</div>
                                        <div className="fw-bold">
                                            {new Date(selectedReceipt.receiptDate).toLocaleDateString("cs-CZ")}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-muted small">Číslo faktury přijaté</div>
                                        <div className="fw-bold">{selectedReceipt.invoiceNumber}</div>
                                    </div>
                                </div>
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Produkt</th>
                                            <th>Množství</th>
                                            <th>Cena bez DPH</th>
                                            <th>DPH 21 %</th>
                                            <th>Celkem s DPH</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedReceipt.items.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.productName}</td>
                                                <td>{item.quantity} ks</td>
                                                <td>{formatPrice(item.totalPriceExVat)}</td>
                                                <td>{formatPrice(item.totalPriceExVat * 0.21)}</td>
                                                <td className="fw-bold">{formatPrice(item.totalPriceIncVat)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="table-light">
                                        <tr>
                                            <td colSpan={2} className="fw-bold">Celkem</td>
                                            <td className="fw-bold">{formatPrice(selectedReceipt.totalAmountExVat)}</td>
                                            <td className="fw-bold">{formatPrice(selectedReceipt.vatAmount)}</td>
                                            <td className="fw-bold text-primary">{formatPrice(selectedReceipt.totalAmountIncVat)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Zavři
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Seznam příjemek</h4>
                <button className="btn btn-primary" onClick={() => setActivePage("Vytvořit příjemku")}>
                    <i className="bi bi-plus-lg me-2"></i>Nová příjemka
                </button>
            </div>

            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Dodavatel</th>
                                <th>Datum příjmu</th>
                                <th>Číslo faktury</th>
                                <th>Celkem bez DPH</th>
                                <th>DPH</th>
                                <th>Celkem s DPH</th>
                                <th className="text-end">Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center text-muted py-4">
                                        Žádné příjemky
                                    </td>
                                </tr>
                            ) : (
                                receipts.map((r) => (
                                    <tr key={r.id}>
                                        <td className="fw-bold text-muted">#{r.id}</td>
                                        <td className="fw-medium">{r.supplierName}</td>
                                        <td>{new Date(r.receiptDate).toLocaleDateString("cs-CZ")}</td>
                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                {r.invoiceNumber}
                                            </span>
                                        </td>
                                        <td>{formatPrice(r.totalAmountExVat)}</td>
                                        <td>{formatPrice(r.vatAmount)}</td>
                                        <td className="fw-bold">{formatPrice(r.totalAmountIncVat)}</td>
                                        <td className="text-end">
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => handleOpenDetail(r)}
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>
                                            {user?.role === "admin" && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(r.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Receipts;

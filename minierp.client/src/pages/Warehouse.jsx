import { useState, useEffect, useCallback } from "react";
import {
    getWarehouseItems,
    updateWarehouseItem,
    deleteWarehouseItem,
} from "../services/warehouseService";
import { formatPrice } from "../utils/formatters";

const CATEGORY_BADGE = {
    zimni:     { style: { backgroundColor: "#2563eb" }, icon: "bi-snow",     title: "Zimní" },
    letni:     { style: { backgroundColor: "#f59e0b" }, icon: "bi-sun-fill", title: "Letní" },
    celorocni: { style: { backgroundColor: "#10b981" }, icon: null,           title: "Celoroční" },
};

function Warehouse({ user }) {
    const [items, setItems] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [editQuantity, setEditQuantity] = useState("");
    const [filterText, setFilterText] = useState("");

    const loadItems = useCallback(async () => {
        try {
            const data = await getWarehouseItems();
            setItems(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const handleEdit = (item) => {
        setEditItem(item);
        setEditQuantity(String(item.quantity));
        setShowModal(true);
    };

    const handleUpdate = async () => {
        try {
            const updated = await updateWarehouseItem(editItem.id, parseInt(editQuantity) || 0);
            setItems((prev) => prev.map((i) => (i.id === editItem.id ? updated : i)));
            setShowModal(false);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Opravdu chcete odebrat tuto položku ze skladu?")) {
            try {
                await deleteWarehouseItem(id);
                setItems((prev) => prev.filter((i) => i.id !== id));
                setError(null);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const filteredItems = (items ?? []).filter((item) =>
        item.productName?.toLowerCase().includes(filterText.toLowerCase()) ||
        item.productSize?.toLowerCase().includes(filterText.toLowerCase()) ||
        item.productBrand?.toLowerCase().includes(filterText.toLowerCase()) ||
        item.productPattern?.toLowerCase().includes(filterText.toLowerCase()),
    );

    const totalValue = filteredItems.reduce(
        (sum, item) => sum + item.productNetPrice * item.quantity,
        0,
    );

    const colCount = user?.role === "admin" ? 7 : 6;

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            {error && <div className="alert alert-danger">{error}</div>}

            {showModal && editItem && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Upravit množství</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)} />
                            </div>
                            <div className="modal-body">
                                <p className="fw-semibold mb-1">{editItem.productBrand} {editItem.productPattern}</p>
                                <p className="text-muted small mb-3">{editItem.productSize}</p>
                                <label className="form-label">Množství (ks)</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    min="0"
                                    value={editQuantity}
                                    onChange={(e) => setEditQuantity(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Zavři
                                </button>
                                <button className="btn btn-primary" onClick={handleUpdate}>
                                    Ulož
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-0">Sklad — vše</h4>
                    <span className="text-muted small">
                        {filteredItems.length} položek · celková hodnota {formatPrice(totalValue)}
                    </span>
                </div>
                <div className="w-50">
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Hledej podle značky, rozměru nebo dézenu"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
            </div>

            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Rozměr</th>
                                <th>Název / Dezén</th>
                                <th>SI / LI</th>
                                <th>Kat.</th>
                                <th className="text-end">Cena bez DPH</th>
                                <th className="text-center">Počet ks</th>
                                {user?.role === "admin" && <th className="text-end">Akce</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={colCount} className="text-center text-muted py-4">
                                        Sklad je prázdný
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const badge = CATEGORY_BADGE[item.productCategory];
                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <span className="fw-bold small font-monospace">
                                                    {item.productSize ?? "—"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="fw-semibold">{item.productBrand}</div>
                                                <div className="text-muted small">{item.productPattern}</div>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark border fw-medium">
                                                    {item.productSi}{item.productLi}
                                                </span>
                                            </td>
                                            <td>
                                                {badge ? (
                                                    <span
                                                        className="badge text-white"
                                                        style={badge.style}
                                                        title={badge.title}
                                                    >
                                                        {item.productCategory === "celorocni" ? (
                                                            <>
                                                                <i className="bi bi-sun-fill me-1"></i>
                                                                <i className="bi bi-snow"></i>
                                                            </>
                                                        ) : (
                                                            <i className={`bi ${badge.icon}`}></i>
                                                        )}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td className="text-end fw-bold text-dark">
                                                {formatPrice(item.productNetPrice)}
                                            </td>
                                            <td className="text-center">
                                                <span
                                                    className={`badge rounded-pill px-3 py-2 fs-6 ${
                                                        item.quantity > 10
                                                            ? "bg-success"
                                                            : item.quantity > 0
                                                            ? "bg-warning text-dark"
                                                            : "bg-danger"
                                                    }`}
                                                >
                                                    {item.quantity} ks
                                                </span>
                                            </td>
                                            {user?.role === "admin" && (
                                                <td className="text-end">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        {filteredItems.length > 0 && (
                            <tfoot>
                                <tr style={{ backgroundColor: "#f5f7fa", borderTop: "2px solid #b0bec8" }}>
                                    <td colSpan={4} className="fw-bold text-muted small py-2 ps-3">
                                        Celkem {filteredItems.length} položek
                                    </td>
                                    <td className="text-end fw-bold py-2" style={{ color: "var(--primary)" }}>
                                        {formatPrice(totalValue)}
                                    </td>
                                    <td colSpan={user?.role === "admin" ? 2 : 1} className="text-center fw-bold py-2">
                                        {filteredItems.reduce((s, i) => s + i.quantity, 0)} ks
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Warehouse;

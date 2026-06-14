import { useState, useEffect, useCallback } from "react";
import {
    getWarehouseItems,
    updateWarehouseItem,
    deleteWarehouseItem,
} from "../services/warehouseService";

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
        item.productName?.toLowerCase().includes(filterText.toLowerCase()),
    );

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
                                <p className="text-muted mb-3">{editItem.productName}</p>
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
                <h4 className="fw-bold mb-0">Sklad — vše</h4>
                <div className="w-50">
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Hledej produkt"
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
                                <th>Produkt</th>
                                <th>Množství</th>
                                {user?.role === "admin" && <th className="text-end">Akce</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={user?.role === "admin" ? 3 : 2} className="text-center text-muted py-4">
                                        Sklad je prázdný
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className="fw-medium">{item.productName}</td>
                                        <td>
                                            <span
                                                className={`badge ${item.quantity > 10 ? "bg-success" : item.quantity > 0 ? "bg-warning text-dark" : "bg-danger"}`}
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Warehouse;

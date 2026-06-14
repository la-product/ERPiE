import { useState, useEffect, useCallback } from "react";
import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
} from "../services/productService";
import {
    mapProductDtoToForm,
    getProductDisplayText,
    CATEGORIES,
    getCategoryLabel,
} from "../mappers/productMapper";
import { formatPrice } from "../utils/formatters";

const CATEGORY_BADGE = {
    zimni:     { style: { backgroundColor: "#2563eb" },         icon: "bi-snow",     title: "Zimní" },
    letni:     { style: { backgroundColor: "#f59e0b" },         icon: "bi-sun-fill", title: "Letní" },
    celorocni: { style: { backgroundColor: "#10b981" },         icon: null,          title: "Celoroční" },
};

function Products({
    view,
    products,
    setProducts,
    loading,
    setLoading,
    setActivePage,
    user,
}) {
    const [form, setForm] = useState({
        size: "",
        brand: "",
        pattern: "",
        si: "",
        li: "",
        netPrice: "",
        category: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const loadProducts = useCallback(async () => {
        try {
            const data = await getProducts();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [setLoading, setProducts]);

    useEffect(() => {
        if (!products) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadProducts();
        }
    }, [loadProducts, products]);

    const handleEdit = (product) => {
        setEditForm(mapProductDtoToForm(product));
        setShowModal(true);
    };

    const handleUpdate = async () => {
        try {
            const updated = await updateProduct(editForm.id, editForm);
            setProducts((prev) =>
                prev.map((p) => (p.id === editForm.id ? updated : p)),
            );
            setShowModal(false);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Opravdu chcete smazat tento produkt?")) {
            try {
                await deleteProduct(id);
                setProducts((prev) => prev.filter((p) => p.id !== id));
                setError(null);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleSubmit = async () => {
        try {
            const newProduct = await addProduct(form);
            setProducts((prev) => [...prev, newProduct]);
            setForm({
                size: "",
                brand: "",
                pattern: "",
                si: "",
                li: "",
                netPrice: "",
                category: "",
            });
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredProducts = products.filter(
        (product) =>
            (categoryFilter === "" || product.category === categoryFilter) &&
            (
                product.size?.toLowerCase().includes(filterText.toLowerCase()) ||
                product.brand?.toLowerCase().includes(filterText.toLowerCase()) ||
                product.pattern?.toLowerCase().includes(filterText.toLowerCase())
            ),
    );

    if (view == "add") {
        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Přidat produkt</h4>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => setActivePage("Seznam produktů")}
                    >
                        <i className="bi bi-arrow-left me-2"></i>Zpět na seznam
                    </button>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="card border-0 shadow-sm" style={{ maxWidth: 800 }}>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">
                                    Značka
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white">
                                        <i className="bi bi-tag text-muted"></i>
                                    </span>
                                    <input
                                        className="form-control"
                                        placeholder="e.g. Michelin"
                                        value={form.brand}
                                        onChange={(e) =>
                                            setForm({ ...form, brand: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">
                                    Rozměr
                                </label>
                                <input
                                    className="form-control"
                                    placeholder="e.g. 205/55 R16"
                                    value={form.size}
                                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">
                                    Dezén
                                </label>
                                <input
                                    className="form-control"
                                    placeholder="e.g. Alpin 6"
                                    value={form.pattern}
                                    onChange={(e) =>
                                        setForm({ ...form, pattern: e.target.value })
                                    }
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-uppercase text-muted">
                                    SI (Index rychlosti)
                                </label>
                                <input
                                    className="form-control"
                                    placeholder="V"
                                    value={form.si}
                                    onChange={(e) => setForm({ ...form, si: e.target.value })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-uppercase text-muted">
                                    LI (Index zátěže)
                                </label>
                                <input
                                    className="form-control"
                                    placeholder="91"
                                    value={form.li}
                                    onChange={(e) => setForm({ ...form, li: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">
                                    Cena bez DPH (
                                    {new Intl.NumberFormat("cs-CZ", {
                                        style: "currency",
                                        currency: "CZK",
                                    })
                                        .format(0)
                                        .replace(/\d|,|.\d/g, "")
                                        .trim()}
                                    )
                                </label>
                                <div className="input-group">
                                    <input
                                        className="form-control"
                                        type="number"
                                        placeholder="0.00"
                                        value={form.netPrice}
                                        onChange={(e) =>
                                            setForm({ ...form, netPrice: e.target.value })
                                        }
                                    />
                                    <span className="input-group-text bg-light">CZK</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">
                                    Kategorie
                                </label>
                                <select
                                    className="form-select"
                                    value={form.category}
                                    onChange={(e) =>
                                        setForm({ ...form, category: e.target.value })
                                    }
                                >
                                    <option value="">— vyberte kategorii —</option>
                                    {CATEGORIES.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-top">
                            <button
                                className="btn btn-primary btn-lg w-100 fw-bold"
                                onClick={handleSubmit}
                            >
                                <i className="bi bi-plus-circle me-2"></i>Vytvoř produkt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
            {showModal && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edituj produkt</h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="row g-2">
                                    <div className="col-md-6">
                                        <label className="form-label">Rozměr</label>
                                        <input
                                            className="form-control"
                                            value={editForm.size || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, size: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Značka</label>
                                        <input
                                            className="form-control"
                                            value={editForm.brand || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, brand: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Dezén</label>
                                        <input
                                            className="form-control"
                                            value={editForm.pattern || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, pattern: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Si</label>
                                        <input
                                            className="form-control"
                                            value={editForm.si || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, si: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Li</label>
                                        <input
                                            className="form-control"
                                            value={editForm.li || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, li: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Cena bez DPH</label>
                                        <input
                                            className="form-control"
                                            value={editForm.netPrice || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, netPrice: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Kategorie</label>
                                        <select
                                            className="form-select"
                                            value={editForm.category || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, category: e.target.value })
                                            }
                                        >
                                            <option value="">— vyberte kategorii —</option>
                                            {CATEGORIES.map((c) => (
                                                <option key={c.value} value={c.value}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
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
                <h4 className="fw-bold mb-0">Seznam produktů</h4>
                <div className="w-50">
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Hledej produkt"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setActivePage("Přidat produkt")}
                >
                    <i className="bi bi-plus-lg me-2"></i>Nový produkt
                </button>
            </div>
            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Rozměr</th>
                                <th>Název</th>
                                <th>SI/LI</th>
                                <th>Cena bez DPH</th>
                                <th>
                                    <div className="d-flex align-items-center">
                                        Kategorie
                                        <span className="category-filter-wrapper">
                                            <i
                                                className="bi bi-chevron-down category-filter-icon"
                                                style={{
                                                    color: categoryFilter === "zimni"     ? "#2563eb"
                                                         : categoryFilter === "letni"     ? "#f59e0b"
                                                         : categoryFilter === "celorocni" ? "#10b981"
                                                         : "white"
                                                }}
                                            />
                                            <select
                                                className="category-filter"
                                                value={categoryFilter}
                                                onChange={(e) => setCategoryFilter(e.target.value)}
                                            >
                                                <option value="">Vše</option>
                                                {CATEGORIES.map((c) => (
                                                    <option key={c.value} value={c.value}>{c.label}</option>
                                                ))}
                                            </select>
                                        </span>
                                    </div>
                                </th>
                                {user?.role === "admin" && (
                                    <th className="text-end">Akce</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => {
                                const badge = CATEGORY_BADGE[product.category] ?? { bg: "bg-secondary", label: getCategoryLabel(product.category) };
                                return (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="fw-bold small">{product.size}</div>
                                        </td>
                                        <td>
                                            {product.brand} {product.pattern}
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border fw-medium">
                                                {product.si}{product.li}
                                            </span>
                                        </td>
                                        <td className="fw-bold text-dark">
                                            {formatPrice(product.netPrice)}
                                        </td>
                                        <td>
                                            {badge ? (
                                                <span className="badge text-white" style={badge.style} title={badge.title}>
                                                    {product.category === "celorocni" ? (
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
                                        {user?.role === "admin" && (
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Products;

import { useState, useEffect, useCallback } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/productService';
import { mapProductDtoToForm, getProductDisplayText } from '../mappers/productMapper';
import { formatPrice } from '../utils/formatters';

function Products({ view, products, setProducts, loading, setLoading, setActivePage }) {
    const [form, setForm] = useState({ size: '', brand: '', pattern: '', si: '', li: '', netPrice: '', stock: '' });
    const [showModal, setShowModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [error, setError] = useState(null);

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
            setProducts(prev => prev.map(p => p.id === editForm.id ? updated : p));
            setShowModal(false);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Opravdu chcete smazat tento produkt?')) {
            try {
                await deleteProduct(id);
                setProducts(prev => prev.filter(p => p.id !== id));
                setError(null);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleSubmit = async () => {
        try {
            const newProduct = await addProduct(form);
            setProducts(prev => [...prev, newProduct]);
            setForm({ size: '', brand: '', pattern: '', si: '', li: '', netPrice: '', stock: '' });
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    if (view == "add") {
        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Add Product</h4>
                    <button className="btn btn-outline-secondary" onClick={() => setActivePage('Product list')}>
                        <i className="bi bi-arrow-left me-2"></i>Back to List
                    </button>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="card border-0 shadow-sm" style={{ maxWidth: 800 }}>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">Brand / Manufacturer</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-tag text-muted"></i></span>
                                    <input className="form-control" placeholder="e.g. Michelin"
                                        value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">Product Size</label>
                                <input className="form-control" placeholder="e.g. 205/55 R16"
                                    value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">Pattern</label>
                                <input className="form-control" placeholder="e.g. Alpin 6"
                                    value={form.pattern} onChange={e => setForm({ ...form, pattern: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-uppercase text-muted">SI (Speed Index)</label>
                                <input className="form-control" placeholder="V"
                                    value={form.si} onChange={e => setForm({ ...form, si: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-uppercase text-muted">LI (Load Index)</label>
                                <input className="form-control" placeholder="91"
                                    value={form.li} onChange={e => setForm({ ...form, li: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">Net Price ({new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(0).replace(/\d|,|.\d/g, '').trim()})</label>
                                <div className="input-group">
                                    <input className="form-control" type="number" placeholder="0.00"
                                        value={form.netPrice} onChange={e => setForm({ ...form, netPrice: e.target.value })} />
                                    <span className="input-group-text bg-light">CZK</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">Stock Quantity</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-box text-muted"></i></span>
                                    <input className="form-control" type="number" placeholder="0"
                                        value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-top">
                            <button className="btn btn-primary btn-lg w-100 fw-bold" onClick={handleSubmit}>
                                <i className="bi bi-plus-circle me-2"></i>Create Product
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
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Product</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="row g-2">
                                    <div className="col-md-6">
                                        <label className="form-label">Size</label>
                                        <input className="form-control" value={editForm.size || ''}
                                            onChange={e => setEditForm({ ...editForm, size: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Brand</label>
                                        <input className="form-control" value={editForm.brand || ''}
                                            onChange={e => setEditForm({ ...editForm, brand: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Pattern</label>
                                        <input className="form-control" value={editForm.pattern || ''}
                                            onChange={e => setEditForm({ ...editForm, pattern: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Si</label>
                                        <input className="form-control" value={editForm.si || ''}
                                            onChange={e => setEditForm({ ...editForm, si: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Li</label>
                                        <input className="form-control" value={editForm.li || ''}
                                            onChange={e => setEditForm({ ...editForm, li: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">NetPrice</label>
                                        <input className="form-control" value={editForm.netPrice || ''}
                                            onChange={e => setEditForm({ ...editForm, netPrice: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Stock</label>
                                        <input className="form-control" value={editForm.stock || ''}
                                            onChange={e => setEditForm({ ...editForm, stock: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Close
                                </button>
                                <button className="btn btn-primary" onClick={handleUpdate}>
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Product List</h4>
                <button className="btn btn-primary" onClick={() => setActivePage('Add product') }>
                    <i className="bi bi-plus-lg me-2"></i>New Product
                </button>
            </div>
            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Product Details</th>
                                <th>SI/LI</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products && products.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="fw-bold text-dark">{product.brand} {product.pattern}</div>
                                        <div className="text-muted small">{product.size}</div>
                                    </td>
                                    <td>
                                        <span className="badge bg-light text-dark border fw-medium">
                                            {product.si}{product.li}
                                        </span>
                                    </td>
                                    <td className="fw-bold text-dark">{formatPrice(product.netPrice)}</td>
                                    <td>
                                        <span className={`badge ${product.stock > 10 ? 'bg-success-light text-success' : 'bg-warning-light text-warning'}`}>
                                            {product.stock} pcs
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(product)}>
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(product.id)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Products;

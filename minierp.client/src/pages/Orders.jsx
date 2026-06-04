import { useState, useCallback, useEffect } from "react";
import { getCustomers } from "../services/customerService";
import { getOrders, createOrder, updateOrderStatus, deleteOrder, getOrderById } from "../services/orderService";
import { getProductDisplayText } from "../mappers/productMapper";
import InvoiceForm from "./InvoiceForm";

function Orders({ view, products }) {
    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [form, setForm] = useState({
        customerId: '',
        street: '',
        city: '',
        zip: '',
        shipping: 'courier',
        payment: 'card',
        note: ''
    });
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState({
        brand: '',
        quantity: 1
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalView, setModalView] = useState('details');

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'New': return 'badge-primary-light';
            case 'Processing': return 'badge-warning-light';
            case 'Shipped': return 'badge-success-light';
            case 'Completed': return 'badge-success';
            default: return 'bg-light text-dark';
        }
    };

    const loadData = useCallback(async () => {
        try {
            const [customersData, ordersData] = await Promise.all([
                getCustomers(),
                getOrders()
            ]);
            setCustomers(customersData);
            setOrders(ordersData);
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

    const handleCustomerInput = (e) => {
        const name = e.target.value;
        const match = customers.find(c => c.name === name);
        if (match) {
            setForm({ ...form, customerId: match.id, street: match.street, city: match.city, zip: match.zip });
        } else {
            setForm({ ...form, customerId: '', street: '', city: '', zip: '' });
        }
    };

    const handleAddProduct = () => {
        if (!currentItem.brand) return;
        const product = products.find(
            p => getProductDisplayText(p) === currentItem.brand
        );
        if (!product) return;

        const newItem = {
            productId: product.id,
            brand: getProductDisplayText(product),
            quantity: currentItem.quantity,
            unitPrice: product.netPrice,
            totalPrice: product.netPrice * currentItem.quantity
        };
        setItems([...items, newItem]);
        setCurrentItem({ brand: '', quantity: 1 });
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleCreateOrder = async () => {
        if (!form.customerId) { alert("Select customer"); return; }
        if (items.length === 0) { alert("Add products"); return; }

        try {
            const orderPayload = {
                customerId: form.customerId,
                shipping: `${form.street}, ${form.city}, ${form.zip}`,
                payment: form.payment,
                totalPrice: items.reduce((sum, item) => sum + item.totalPrice, 0),
                status: "new",
                note: form.note,
                items: items.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice
                }))
            };

            await createOrder(orderPayload, items);

            await loadData();

            setItems([]);
            setForm({ customerId: '', street: '', city: '', zip: '', shipping: 'courier', payment: 'card', note: '' });
            setCurrentItem({ brand: '', quantity: 1 });
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleOpenOrder = async (order) => {
        try {
            const detail = await getOrderById(order.id);
            setSelectedOrder(detail);
            setModalView('details');
            setShowModal(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    const handleChangeStatus = async () => {
        const statuses = ["new", "Processing", "Shipped", "Completed"];
        const currentIndex = statuses.indexOf(selectedOrder.status);
        if (currentIndex === -1 || currentIndex === statuses.length - 1) return;

        try {
            const updatedStatus = statuses[currentIndex + 1];
            await updateOrderStatus(selectedOrder.id, updatedStatus);
            await loadData();
            setSelectedOrder({ ...selectedOrder, status: updatedStatus });
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteOrder = async (id) => {
        if (window.confirm('Opravdu chcete smazat tuto objednávku?')) {
            try {
                await deleteOrder(id);
                await loadData();
                setError(null);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleOpenInvoiceForm = () => {
        setShowInvoiceForm(true);
    };

    const handleCloseInvoiceForm = () => {
        setShowInvoiceForm(false);
    };

    const handleInvoiceSuccess = () => {
        loadData();
    };

    if (view === "add") {
        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">New Order</h4>
                    <button className="btn btn-outline-secondary" onClick={() => (window.location.hash = "#/orders")}>
                        <i className="bi bi-arrow-left me-2"></i>Back to List
                    </button>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="card border-0 shadow-sm" style={{ maxWidth: 900 }}>
                    <div className="card-body p-4">
                        {/* Customer */}
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-uppercase text-muted">Customer Selection</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                                <input
                                    className="form-control"
                                    placeholder="— Type to search customer —"
                                    list="customer-list"
                                    onChange={handleCustomerInput}
                                />
                                <datalist id="customer-list">
                                    {customers.map(c => (
                                        <option key={c.id} value={c.name} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        {/* Shipping */}
                        <div className="border-top pt-4 mt-4">
                            <h6 className="fw-bold mb-3">Shipping & Payment</h6>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-uppercase text-muted">Delivery Address</label>
                                    <input
                                        className="form-control"
                                        placeholder="Street and house number"
                                        value={form.street}
                                        onChange={e => setForm({ ...form, street: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label small fw-bold text-uppercase text-muted">City</label>
                                    <input
                                        className="form-control"
                                        placeholder="City"
                                        value={form.city}
                                        onChange={e => setForm({ ...form, city: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-uppercase text-muted">ZIP</label>
                                    <input
                                        className="form-control"
                                        placeholder="ZIP"
                                        value={form.zip}
                                        onChange={e => setForm({ ...form, zip: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-uppercase text-muted">Shipping Method</label>
                                    <select
                                        className="form-select"
                                        value={form.shipping}
                                        onChange={e => setForm({ ...form, shipping: e.target.value })}
                                    >
                                        <option value="courier">Courier Delivery</option>
                                        <option value="packeta">Zásilkovna</option>
                                        <option value="personal">Personal pickup</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-uppercase text-muted">Payment Method</label>
                                    <select
                                        className="form-select"
                                        value={form.payment}
                                        onChange={e => setForm({ ...form, payment: e.target.value })}
                                    >
                                        <option value="card">Credit Card</option>
                                        <option value="transfer">Bank transfer</option>
                                        <option value="cash">Cash on delivery</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="border-top pt-4 mt-4">
                            <h6 className="fw-bold mb-3">Order Items</h6>
                            <div className="row g-2 mb-3 align-items-end">
                                <div className="col-md-8">
                                    <label className="form-label small">Product</label>
                                    <input
                                        className="form-control"
                                        placeholder="— Search product —"
                                        list="product-list"
                                        value={currentItem.brand}
                                        onChange={e => setCurrentItem({ ...currentItem, brand: e.target.value })}
                                    />
                                    <datalist id="product-list">
                                        {products?.map(p => (
                                            <option key={p.id} value={getProductDisplayText(p)} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small">Qty</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        min="1"
                                        placeholder="Qty"
                                        value={currentItem.quantity}
                                        onChange={e => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <button
                                        className="btn btn-outline-primary w-100"
                                        onClick={handleAddProduct}
                                    >
                                        <i className="bi bi-plus-lg me-1"></i>Add
                                    </button>
                                </div>
                            </div>

                            {/* Items list */}
                            {items.length > 0 && (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Product</th>
                                                <th className="text-center">Qty</th>
                                                <th className="text-end">Price</th>
                                                <th className="text-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="fw-medium">{item.brand}</td>
                                                    <td className="text-center">{item.quantity}</td>
                                                    <td className="text-end fw-bold">{item.totalPrice.toFixed(2)} CZK</td>
                                                    <td className="text-end">
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
                                                <td colSpan="2" className="text-end fw-bold text-uppercase small text-muted">Total Order Value:</td>
                                                <td className="text-end fw-bold text-primary h5 mb-0">
                                                    {items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)} CZK
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Note */}
                        <div className="border-top pt-4 mt-4">
                            <label className="form-label small fw-bold text-uppercase text-muted">Internal Note</label>
                            <textarea
                                className="form-control"
                                rows={2}
                                placeholder="Add any special instructions or notes..."
                                value={form.note}
                                onChange={e => setForm({ ...form, note: e.target.value })}
                            />
                        </div>

                        <div className="mt-4 pt-3 border-top">
                            <button
                                className="btn btn-primary btn-lg w-100 fw-bold"
                                onClick={handleCreateOrder}
                            >
                                <i className="bi bi-check2-square me-2"></i>Complete Order
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">List of Orders</h4>
                <button className="btn btn-primary" onClick={() => window.location.hash = '#/orders/add'}>
                    <i className="bi bi-plus-lg me-2"></i>New Order
                </button>
            </div>
            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Created At</th>
                                <th>Total Price</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="fw-bold text-dark">#{order.id}</td>
                                    <td>
                                        <div className="fw-bold text-dark">{order.customer?.name || 'Unknown'}</div>
                                        <div className="text-muted small">{order.shipping}</div>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                                    <td className="fw-bold text-dark">{order.totalPrice.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CZK</td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleOpenOrder(order)}
                                        >
                                            <i className="bi bi-eye"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteOrder(order.id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modal okno */}
            {showModal && selectedOrder && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Order #{selectedOrder.id}</h5>
                                <button className="btn-close" onClick={handleCloseModal} />
                            </div>
                            <div className="modal-body">
                                <h6>Customer</h6>
                                <p className="mb-1">{selectedOrder.customer?.name}</p>
                                <p className="text-muted">{selectedOrder.shipping}</p>
                                <hr />
                                <h6>Items</h6>
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Pattern</th>
                                            <th>Qty</th>
                                            <th>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.product?.size || 'Unknown'} {item.product?.brand || 'Unknown'} </td>
                                                <td>{item.product?.pattern || 'Unknown'}</td>
                                                <td>{item.quantity}</td>
                                                <td>{(item.unitPrice * item.quantity).toFixed(2)} CZK</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="text-end mt-3">
                                    <strong>Total: {selectedOrder.totalPrice.toFixed(2)} CZK</strong>
                                </div>
                                <div className="mt-3">
                                    <span className={`badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={handleChangeStatus}>
                                    Change Status
                                </button>
                                <button className="btn btn-success" onClick={handleOpenInvoiceForm}>Create Invoice</button>
                                <button className="btn btn-outline-dark" onClick={handleCloseModal}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <InvoiceForm 
                show={showInvoiceForm} 
                selectedOrder={selectedOrder}
                onClose={handleCloseInvoiceForm}
                onSuccess={handleInvoiceSuccess}
            />
        </div>
    );
}

export default Orders;

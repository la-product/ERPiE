import { useState, useCallback, useEffect } from "react";
import {
    createInvoice,
} from "../services/invoiceService";
import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";
import { getProductDisplayText } from "../mappers/productMapper";
import { formatPrice } from '../utils/formatters'

const addDays = (date, days) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
};

const toDateInputValue = (date) => date.toISOString().split("T")[0];

const createDefaultInvoiceForm = () => {
    const issueDate = new Date();

    return {
        issueDate: toDateInputValue(issueDate),
        dueDate: toDateInputValue(addDays(issueDate, 30)),
        customerId: "",
        totalAmountExVat: 0,
        vatAmount: 0,
        totalAmountIncVat: 0,
        currencyCode: "Kč",
        status: "nezaplaceno",
    };
};

const calculateInvoiceTotals = (invoiceItems) => {
    const totalAmountExVat = invoiceItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
    );
    const vatAmount = invoiceItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity * item.vatRate,
        0,
    );

    return {
        totalAmountExVat,
        vatAmount,
        totalAmountIncVat: totalAmountExVat + vatAmount,
    };
};

function InvoiceForm({ show, selectedOrder, onClose, onSuccess }) {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState(createDefaultInvoiceForm);
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState({
        productId: "",
        productSearch: "",
        quantity: 1,
        unitPrice: 0,
        vatRate: 0.21,
        totalPrice: 0,
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [customersData, productsData] = await Promise.all([
                getCustomers(),
                getProducts(),
            ]);
            setCustomers(customersData);
            setProducts(productsData);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    useEffect(() => {
        if (show) {
            loadData();

            if (selectedOrder) {
                const customerId = selectedOrder.customerId;
                setForm({
                    ...createDefaultInvoiceForm(),
                    customerId: customerId
                });

                const invoiceItems = selectedOrder.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    vatRate: 0.21,
                    totalPrice: item.unitPrice * item.quantity * 1.21
                }));

                setItems(invoiceItems);

                const totals = calculateInvoiceTotals(invoiceItems);
                setForm(prevForm => ({
                    ...prevForm,
                    customerId: customerId,
                    ...totals
                }));
            }
        }
    }, [show, selectedOrder, loadData]);

    const handleCustomerChange = (e) => {
        const customerId = parseInt(e.target.value);
        setForm({ ...form, customerId });
    };

    const handleAddItem = () => {
        if (!currentItem.productId) return;

        const newItem = {
            ...currentItem,
            productId: parseInt(currentItem.productId),
            quantity: parseInt(currentItem.quantity) || 1,
            unitPrice: parseFloat(currentItem.unitPrice) || 0,
            vatRate: parseFloat(currentItem.vatRate) || 0.21,
        };

        newItem.totalPrice =
            newItem.unitPrice * newItem.quantity * (1 + newItem.vatRate);
        const newItems = [...items, newItem];
        const totals = calculateInvoiceTotals(newItems);

        setItems(newItems);
        setForm({
            ...form,
            ...totals,
        });

        setCurrentItem({
            productId: "",
            productSearch: "",
            quantity: 1,
            unitPrice: 0,
            vatRate: 0.21,
            totalPrice: 0,
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);

        const totals = calculateInvoiceTotals(newItems);

        setForm({
            ...form,
            ...totals,
        });
    };

    const handleUpdateItem = (index, field, value) => {
        const newItems = [...items];
        const item = newItems[index];

        if (field === 'quantity') {
            item.quantity = parseInt(value) || 1;
        } else if (field === 'unitPrice') {
            item.unitPrice = parseFloat(value) || 0;
        }

        item.totalPrice = item.unitPrice * item.quantity * (1 + item.vatRate);

        setItems(newItems);

        const totals = calculateInvoiceTotals(newItems);
        setForm({
            ...form,
            ...totals,
        });
    };

    const handleCreateInvoice = async () => {
        if (!form.customerId) {
            alert("Vyberte zákazníka");
            return;
        }
        if (items.length === 0) {
            alert("Přidejte položky");
            return;
        }

        setLoading(true);
        try {
            const invoicePayload = {
                issueDate: form.issueDate,
                dueDate: form.dueDate,
                customerId: form.customerId,
                status: form.status,
                currencyCode: form.currencyCode,
                totalAmountExVat: form.totalAmountExVat,
                vatAmount: form.vatAmount,
                totalAmountIncVat: form.totalAmountIncVat,
                items: items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    vatRate: item.vatRate,
                    totalPrice: item.totalPrice,
                })),
            };

            await createInvoice(invoicePayload, items);

            setForm(createDefaultInvoiceForm());
            setItems([]);
            setError(null);

            if (onSuccess) {
                onSuccess();
            }

            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setForm(createDefaultInvoiceForm());
        setItems([]);
        setCurrentItem({
            productId: "",
            productSearch: "",
            quantity: 1,
            unitPrice: 0,
            vatRate: 0.21,
            totalPrice: 0,
        });
        setError(null);
        onClose();
    };

    if (!show) {
        return null;
    }

    return (
        <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Vytvořit Fakturu</h5>
                        <button
                            className="btn-close"
                            onClick={handleClose}
                            disabled={loading}
                        />
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">Datum vystavení</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={form.issueDate}
                                    onChange={(e) =>
                                        setForm({ ...form, issueDate: e.target.value })
                                    }
                                    disabled={loading}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">Datum splatnosti</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={form.dueDate}
                                    onChange={(e) =>
                                        setForm({ ...form, dueDate: e.target.value })
                                    }
                                    disabled={loading}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">Stav</label>
                                <select value={form.status}>
                                <option value="nezaplaceno">Nezaplaceno</option>
                                <option value="zaplaceno">Zaplaceno</option>
                            </select>   
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label small fw-bold text-uppercase text-muted">Zákazník</label>
                            <select
                                className="form-select"
                                value={form.customerId}
                                onChange={handleCustomerChange}
                                disabled={loading}
                            >
                                <option value="">— Vyberte zákazníka —</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="border-top pt-4">
                            <h6 className="fw-bold mb-3">Položky faktury</h6>
                            <div className="row g-2 mb-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label small">Zboží</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Vyhledat zboží..."
                                        list="product-list"
                                        value={currentItem.productSearch || ''}
                                        onChange={(e) => {
                                            const searchValue = e.target.value;
                                            setCurrentItem({
                                                ...currentItem,
                                                productSearch: searchValue,
                                            });

                                            const foundProduct = products.find(p =>
                                                p.id.toString() === searchValue ||
                                                getProductDisplayText(p).toLowerCase().includes(searchValue.toLowerCase())
                                            );

                                            if (foundProduct) {
                                                setCurrentItem({
                                                    ...currentItem,
                                                    productId: foundProduct.id.toString(),
                                                    unitPrice: foundProduct.netPrice || 0,
                                                    productSearch: searchValue,
                                                });
                                            }
                                        }}
                                        disabled={loading}
                                    />
                                    <datalist id="product-list">
                                        {products.map((p) => (
                                            <option key={p.id} value={getProductDisplayText(p)} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small">Množství</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Množství"
                                        value={currentItem.quantity}
                                        onChange={(e) =>
                                            setCurrentItem({ ...currentItem, quantity: e.target.value })
                                        }
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small">Jednotková cena</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Cena"
                                        value={currentItem.unitPrice}
                                        onChange={(e) =>
                                            setCurrentItem({
                                                ...currentItem,
                                                unitPrice: e.target.value,
                                            })
                                        }
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <button
                                        className="btn btn-outline-primary w-100"
                                        onClick={handleAddItem}
                                        disabled={loading}
                                    >
                                        <i className="bi bi-plus-lg me-1"></i>Přidat
                                    </button>
                                </div>
                            </div>

                            {items.length > 0 && (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Zboží</th>
                                                <th className="text-center">Množství</th>
                                                <th className="text-end">Jednotková cena</th>
                                                <th className="text-end">Celkem</th>
                                                <th className="text-end">Akce</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, index) => {
                                                const product = products.find(p => p.id === item.productId);
                                                return (
                                                    <tr key={index}>
                                                        <td>{product ? getProductDisplayText(product) : item.name}</td>
                                                        <td className="text-center">
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                style={{ width: "80px", margin: "0 auto" }}
                                                                value={item.quantity}
                                                                onChange={(e) =>
                                                                    handleUpdateItem(index, 'quantity', e.target.value)}
                                                                disabled={loading}
                                                            />
                                                        </td>
                                                        <td className="text-end">
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                style={{ width: "120px", marginLeft: "auto" }}
                                                                value={item.unitPrice}
                                                                onChange={(e) => handleUpdateItem(index, 'unitPrice', e.target.value)}
                                                                onBlur={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                                disabled={loading}
                                                            />
                                                        </td>
                                                        <td className="text-end fw-bold">{formatPrice(item.totalPrice)}</td>
                                                        <td className="text-end">
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleRemoveItem(index)}
                                                                disabled={loading}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="row mt-4">
                            <div className="col-md-6 ms-auto">
                                <div className="card bg-light border-0">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Celkem bez DPH:</span>
                                            <span className="fw-bold">{formatPrice(form.totalAmountExVat)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">DPH:</span>
                                            <span className="fw-bold">{formatPrice(form.vatAmount)}</span>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="h6 mb-0 fw-bold">Celkem s DPH:</span>
                                            <span className="h5 mb-0 fw-bold text-primary">{formatPrice(form.totalAmountIncVat)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Zrušit
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleCreateInvoice}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Vytváření...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check2-circle me-2"></i>Vytvořit fakturu
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InvoiceForm;

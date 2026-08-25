import { useState, useCallback, useEffect } from "react";
import {
    createInvoice,
    getNextInvoiceNumber,
} from "../services/invoiceService";
import { getCustomers } from "../services/customerService";
import { getProductDisplayText } from "../mappers/productMapper";
import { formatPrice, formatZip } from '../utils/formatters'

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
        taxableSupplyDate: toDateInputValue(issueDate),
        dueDate: toDateInputValue(addDays(issueDate, 30)),
        supplierId: "",
        customerId: "",
        totalAmountExVat: 0,
        vatAmount: 0,
        totalAmountIncVat: 0,
        currencyCode: "Kč",
        status: "nezaplaceno",
        bankAccount: "",
        variableSymbol: "",
        paymentMethod: "Bankovní převod",
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

function InvoiceForm({ show, selectedOrder, onClose, onSuccess, standalone = false }) {
    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState(createDefaultInvoiceForm);
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState({
        description: "",
        quantity: 1,
        unitPrice: 0,
        vatRate: 0,
        totalPrice: 0,
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [nextInvoiceNumber, setNextInvoiceNumber] = useState(null);
    const [supplierQuery, setSupplierQuery] = useState("");
    const [customerQuery, setCustomerQuery] = useState("");
    const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);
    const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
    const suppliers = customers.filter((customer) => customer.isSupplier);
    const selectedSupplier = suppliers.find(
        (supplier) => supplier.id === Number(form.supplierId),
    );
    const selectedCustomer = customers.find(
        (customer) => customer.id === Number(form.customerId),
    );
    const filteredSuppliers = suppliers.filter((supplier) =>
        supplier.name.toLowerCase().includes(supplierQuery.trim().toLowerCase()),
    );
    const filteredCustomers = customers.filter((customer) =>
        customer.name.toLowerCase().includes(customerQuery.trim().toLowerCase()),
    );
    const isSupplierVatPayer = Boolean(selectedSupplier?.dic?.trim());
    const invoiceTitle = isSupplierVatPayer
        ? "Faktura – daňový doklad"
        : "Faktura";

    const vatBreakdown = Object.values(
        items.reduce((acc, item) => {
            const rate = item.vatRate;
            const base = item.unitPrice * item.quantity;
            const vat = base * rate;

            if (!acc[rate]) {
                acc[rate] = { rate, base: 0, vat: 0 };
            }
            acc[rate].base += base;
            acc[rate].vat += vat;

            return acc;
        }, {}),
    ).sort((a, b) => a.rate - b.rate);

    const loadData = useCallback(async () => {
        try {
            const [customersData, invoiceNumber] = await Promise.all([
                getCustomers(),
                getNextInvoiceNumber(),
            ]);
            setCustomers(customersData);
            setNextInvoiceNumber(invoiceNumber);
            setForm((prevForm) =>
                prevForm.variableSymbol ? prevForm : { ...prevForm, variableSymbol: invoiceNumber },
            );
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
                setSupplierQuery("");
                setCustomerQuery("");

                const invoiceItems = selectedOrder.items.map(item => ({
                    description: item.product ? getProductDisplayText(item.product) : "",
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    vatRate: 0,
                    totalPrice: item.unitPrice * item.quantity
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

    useEffect(() => {
        if (form.customerId && !customerQuery) {
            const match = customers.find((c) => c.id === Number(form.customerId));
            if (match) setCustomerQuery(match.name);
        }
    }, [form.customerId, customers, customerQuery]);

    const handleSupplierQueryChange = (e) => {
        const value = e.target.value;
        setSupplierQuery(value);
        setSupplierDropdownOpen(true);
        if (form.supplierId && value !== selectedSupplier?.name) {
            setForm({ ...form, supplierId: "" });
        }
    };

    const handleCustomerQueryChange = (e) => {
        const value = e.target.value;
        setCustomerQuery(value);
        setCustomerDropdownOpen(true);
        if (form.customerId && value !== selectedCustomer?.name) {
            setForm({ ...form, customerId: "" });
        }
    };

    const handleSelectSupplier = (supplier) => {
        setSupplierQuery(supplier.name);
        setSupplierDropdownOpen(false);
        setForm({
            ...form,
            supplierId: String(supplier.id),
            bankAccount: supplier.accountNumber
                ? `${supplier.accountNumber}${supplier.bankCode ? `/${supplier.bankCode}` : ""}`
                : form.bankAccount,
        });
    };

    const handleSelectCustomer = (customer) => {
        setCustomerQuery(customer.name);
        setCustomerDropdownOpen(false);
        setForm({ ...form, customerId: String(customer.id) });
    };

    const handleAddItem = () => {
        if (!currentItem.description.trim()) {
            setError("Vyplňte položku faktury.");
            return;
        }

        const newItem = {
            ...currentItem,
            description: currentItem.description,
            quantity: parseInt(currentItem.quantity) || 1,
            unitPrice: parseFloat(currentItem.unitPrice) || 0,
            vatRate: Number.isFinite(parseFloat(currentItem.vatRate))
                ? parseFloat(currentItem.vatRate)
                : 0,
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
        setError(null);

        setCurrentItem({
            description: "",
            quantity: 1,
            unitPrice: 0,
            vatRate: 0,
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
        } else if (field === 'vatRate') {
            item.vatRate = parseFloat(value) || 0;
        } else if (field === 'description') {
            item.description = value;
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
        if (!form.supplierId) {
            setError("Vyberte dodavatele.");
            return;
        }
        if (!form.customerId) {
            setError("Vyberte zákazníka.");
            return;
        }
        if (items.length === 0) {
            setError("Přidejte alespoň jednu položku.");
            return;
        }
        if (!form.issueDate || !form.taxableSupplyDate || !form.dueDate) {
            setError("Vyplňte datum vystavení, DUZP i datum splatnosti.");
            return;
        }
        if (form.dueDate < form.issueDate || form.taxableSupplyDate < form.issueDate) {
            setError("DUZP ani datum splatnosti nemohou být před datem vystavení.");
            return;
        }

        setLoading(true);
        try {
            const invoicePayload = {
                issueDate: form.issueDate,
                taxableSupplyDate: form.taxableSupplyDate,
                dueDate: form.dueDate,
                supplierId: form.supplierId,
                customerId: form.customerId,
                status: form.status,
                currencyCode: form.currencyCode,
                bankAccount: form.bankAccount,
                variableSymbol: form.variableSymbol,
                paymentMethod: form.paymentMethod,
                totalAmountExVat: form.totalAmountExVat,
                vatAmount: form.vatAmount,
                totalAmountIncVat: form.totalAmountIncVat,
                items: items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    vatRate: item.vatRate,
                    totalPrice: item.totalPrice,
                })),
            };

            await createInvoice(invoicePayload, items);

            setForm(createDefaultInvoiceForm());
            setItems([]);
            setSupplierQuery("");
            setCustomerQuery("");
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
        setSupplierQuery("");
        setCustomerQuery("");
        setCurrentItem({
            description: "",
            quantity: 1,
            unitPrice: 0,
            vatRate: 0,
            totalPrice: 0,
        });
        setError(null);
        onClose();
    };

    if (!show) {
        return null;
    }

    const formBody = (
        <>
            <div className="text-end mb-4">
                Faktura č. <span className="fw-bold fs-4">{nextInvoiceNumber || "…"}</span>
            </div>

            <div className="row g-3 mb-4">
                            <div className="col-md-6 position-relative">
                                <label className="form-label small fw-bold text-uppercase text-muted">Dodavatel</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Vyhledat dodavatele podle názvu…"
                                    autoComplete="off"
                                    value={supplierQuery}
                                    onChange={handleSupplierQueryChange}
                                    onFocus={() => setSupplierDropdownOpen(true)}
                                    onBlur={() => setTimeout(() => setSupplierDropdownOpen(false), 150)}
                                    disabled={loading}
                                    required
                                />
                                {supplierDropdownOpen && filteredSuppliers.length > 0 && (
                                    <ul
                                        className="list-group position-absolute w-100 shadow-sm"
                                        style={{ zIndex: 1050, maxHeight: "220px", overflowY: "auto" }}
                                    >
                                        {filteredSuppliers.map((supplier) => (
                                            <li
                                                key={supplier.id}
                                                className="list-group-item list-group-item-action"
                                                style={{ cursor: "pointer" }}
                                                onMouseDown={() => handleSelectSupplier(supplier)}
                                            >
                                                {supplier.name}
                                                {supplier.ico ? <span className="text-muted small"> — IČO: {supplier.ico}</span> : null}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="col-md-6 position-relative">
                                <label className="form-label small fw-bold text-uppercase text-muted">Odběratel</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Vyhledat odběratele podle názvu…"
                                    autoComplete="off"
                                    value={customerQuery}
                                    onChange={handleCustomerQueryChange}
                                    onFocus={() => setCustomerDropdownOpen(true)}
                                    onBlur={() => setTimeout(() => setCustomerDropdownOpen(false), 150)}
                                    disabled={loading}
                                    required
                                />
                                {customerDropdownOpen && filteredCustomers.length > 0 && (
                                    <ul
                                        className="list-group position-absolute w-100 shadow-sm"
                                        style={{ zIndex: 1050, maxHeight: "220px", overflowY: "auto" }}
                                    >
                                        {filteredCustomers.map((customer) => (
                                            <li
                                                key={customer.id}
                                                className="list-group-item list-group-item-action"
                                                style={{ cursor: "pointer" }}
                                                onMouseDown={() => handleSelectCustomer(customer)}
                                            >
                                                {customer.name}
                                                {customer.ico ? <span className="text-muted small"> — IČO: {customer.ico}</span> : null}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {(selectedSupplier || selectedCustomer) && (
                            <div className="row g-3 mb-4">
                                {selectedSupplier && (
                                    <div className="col-md-6">
                                        <div className="border rounded p-3 h-100 bg-light">
                                            <div className="small fw-bold text-uppercase text-muted mb-1">Dodavatel</div>
                                            <div className="fw-bold">{selectedSupplier.name}</div>
                                            <div>{selectedSupplier.street}, {formatZip(selectedSupplier.zip)} {selectedSupplier.city}</div>
                                            {selectedSupplier.ico && <div>IČO: {selectedSupplier.ico}</div>}
                                            {selectedSupplier.dic && <div>DIČ: {selectedSupplier.dic}</div>}
                                            {selectedSupplier.note && (
                                                <div className="text-muted small mt-1">{selectedSupplier.note}</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {selectedCustomer && (
                                    <div className="col-md-6">
                                        <div className="border rounded p-3 h-100 bg-light">
                                            <div className="small fw-bold text-uppercase text-muted mb-1">Odběratel</div>
                                            <div className="fw-bold">{selectedCustomer.name}</div>
                                            <div>{selectedCustomer.street}, {formatZip(selectedCustomer.zip)} {selectedCustomer.city}</div>
                                            {selectedCustomer.ico && <div>IČO: {selectedCustomer.ico}</div>}
                                            {selectedCustomer.dic && <div>DIČ: {selectedCustomer.dic}</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="row g-3 mb-4">
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-uppercase text-muted">Datum vystavení</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={form.issueDate}
                                    onChange={(e) =>
                                        setForm({ ...form, issueDate: e.target.value })
                                    }
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-uppercase text-muted">DUZP</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={form.taxableSupplyDate}
                                    onChange={(e) =>
                                        setForm({ ...form, taxableSupplyDate: e.target.value })
                                    }
                                    disabled={loading}
                                    min={form.issueDate}
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-uppercase text-muted">Datum splatnosti</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={form.dueDate}
                                    onChange={(e) =>
                                        setForm({ ...form, dueDate: e.target.value })
                                    }
                                    disabled={loading}
                                    min={form.issueDate}
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-uppercase text-muted">Stav</label>
                                <select
                                    className="form-select"
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    disabled={loading}
                                >
                                    <option value="nezaplaceno">Nezaplaceno</option>
                                    <option value="zaplaceno">Zaplaceno</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-uppercase text-muted">Měna</label>
                                <select
                                    className="form-select"
                                    value={form.currencyCode}
                                    onChange={(e) => setForm({ ...form, currencyCode: e.target.value })}
                                    disabled={loading}
                                >
                                    <option value="Kč">Kč</option>
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                        </div>

                        <div className="border-top pt-4 mt-4">
                            <h6 className="fw-bold mb-3">Úhrada</h6>
                            <div className="row g-3">
                                <div className="col-md-5">
                                    <label className="form-label small">Číslo bankovního účtu</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="123456789/0100"
                                        value={form.bankAccount}
                                        onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small">Variabilní symbol</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.variableSymbol}
                                        onChange={(e) => setForm({ ...form, variableSymbol: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small">Způsob platby</label>
                                    <select
                                        className="form-select"
                                        value={form.paymentMethod}
                                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                                        disabled={loading}
                                    >
                                        <option value="Bankovní převod">Bankovní převod</option>
                                        <option value="Hotově">Hotově</option>
                                        <option value="Platební karta">Platební karta</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="border-top pt-4 mt-4">
                            <h6 className="fw-bold mb-3">Položky faktury</h6>
                            <div className="row g-2 mb-3 align-items-end">
                                <div className="col-md-6">
                                    <label className="form-label small">Položka</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Zboží, služba nebo jiná informace"
                                        value={currentItem.description}
                                        onChange={(e) =>
                                            setCurrentItem({ ...currentItem, description: e.target.value })
                                        }
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small">Množství</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Množství"
                                        min="1"
                                        step="1"
                                        value={currentItem.quantity}
                                        onChange={(e) =>
                                            setCurrentItem({ ...currentItem, quantity: e.target.value })
                                        }
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small">Jednotková cena</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Cena"
                                        min="0"
                                        step="0.01"
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
                                <div className="col-md-1">
                                    <label className="form-label small">DPH %</label>
                                    <select
                                        className="form-select"
                                        value={currentItem.vatRate}
                                        onChange={(e) =>
                                            setCurrentItem({
                                                ...currentItem,
                                                vatRate: parseFloat(e.target.value),
                                            })
                                        }
                                        disabled={loading}
                                    >
                                        <option value="0.21">21 %</option>
                                        <option value="0.12">12 %</option>
                                        <option value="0">0 %</option>
                                    </select>
                                </div>
                                <div className="col-md-1">
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
                                                <th>Položka</th>
                                                <th className="text-center">Množství</th>
                                                <th className="text-end">Jednotková cena</th>
                                                <th className="text-end">DPH</th>
                                                <th className="text-end">Celkem</th>
                                                <th className="text-end">Akce</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={item.description || ""}
                                                                onChange={(e) =>
                                                                    handleUpdateItem(index, "description", e.target.value)}
                                                                disabled={loading}
                                                            />
                                                        </td>
                                                        <td className="text-center">
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                style={{ width: "80px", margin: "0 auto" }}
                                                                min="1"
                                                                step="1"
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
                                                                min="0"
                                                                step="0.01"
                                                                value={item.unitPrice}
                                                                onChange={(e) => handleUpdateItem(index, 'unitPrice', e.target.value)}
                                                                onBlur={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                                disabled={loading}
                                                            />
                                                        </td>
                                                        <td className="text-end">
                                                            <select
                                                                className="form-select form-select-sm"
                                                                style={{ width: "90px", marginLeft: "auto" }}
                                                                value={item.vatRate}
                                                                onChange={(e) =>
                                                                    handleUpdateItem(index, "vatRate", e.target.value)}
                                                                disabled={loading}
                                                            >
                                                                <option value="0.21">21 %</option>
                                                                <option value="0.12">12 %</option>
                                                                <option value="0">0 %</option>
                                                            </select>
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

                        {isSupplierVatPayer && vatBreakdown.length > 0 && (
                            <div className="border-top pt-4 mt-4">
                                <h6 className="fw-bold mb-3">Rekapitulace DPH</h6>
                                <div className="table-responsive">
                                    <table className="table table-sm align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Sazba DPH</th>
                                                <th className="text-end">Základ daně</th>
                                                <th className="text-end">Výše DPH</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vatBreakdown.map((row) => (
                                                <tr key={row.rate}>
                                                    <td>{(row.rate * 100).toFixed(0)} %</td>
                                                    <td className="text-end">{formatPrice(row.base)}</td>
                                                    <td className="text-end">{formatPrice(row.vat)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

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
        </>
    );

    if (standalone) {
        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">{invoiceTitle}</h4>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        <i className="bi bi-arrow-left me-2"></i>Zpět na seznam
                    </button>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        {formBody}
                        <div className="mt-4 pt-3 border-top">
                            <button
                                className="btn btn-primary btn-lg w-100 fw-bold"
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

    return (
        <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{invoiceTitle}</h5>
                        <button
                            className="btn-close"
                            onClick={handleClose}
                            disabled={loading}
                        />
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        {formBody}
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

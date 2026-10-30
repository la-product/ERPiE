import { useCallback, useEffect, useState } from "react";
import { getCustomers } from "../services/customerService";
import {
    mapPurchaseInvoiceDtoToForm,
    mapPurchaseInvoiceItemToForm,
} from "../mappers/purchaseInvoiceMapper.js";
import {
    createPurchaseInvoice,
    updatePurchaseInvoice,
} from "../services/purchaseInvoiceService";

const toDateInputValue = (date) => date.toISOString().split("T")[0];

const createDefaultForm = () => {
    const issueDate = new Date();
    return {
        issueDate: toDateInputValue(issueDate),
        taxableSupplyDate: toDateInputValue(issueDate),
        dueDate: toDateInputValue(new Date(issueDate.getTime() + 30 * 86400000)),
        customerId: "",
        purchaseInvoiceNumber: "",
        supplierId: "",
        status: "Nezaplaceno",
        totalAmountExVat: 0,
        vatAmount: 0,
        totalAmountIncVat: 0,
        currencyCode: "Kč",
        bankAccount: "",
        variableNumber: "",
        paymentMethod: "Bankovní převod",
        note: "",
    };
};

const createDefaultItem = () => ({
    productCode: "",
    description: "",
    quantity: 1,
    unitPriceExVat: 0,
    vatRate: 21,
    totalPriceExVat: 0,
    totalPriceIncVat: 0,
});

const calculateItem = (item) => {
    const base = (Number(item.quantity) || 0) * (Number(item.unitPriceExVat) || 0);
    const vat = base * ((Number(item.vatRate) || 0) / 100);
    return { ...item, totalPriceExVat: base, totalPriceIncVat: base + vat };
};

function PurchaseInvoiceForm({ show, onClose, onSuccess, standalone = false, invoice = null }) {
    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState(createDefaultForm);
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState(createDefaultItem);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [supplierQuery, setSupplierQuery] = useState("");
    const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);

    const companies = customers;
    const selectedCompany = companies.find((company) => company.id === Number(form.supplierId));
    const filteredCompanies = companies.filter((company) => {
        const query = supplierQuery.trim().toLowerCase();
        return company.name.toLowerCase().includes(query) || (company.ico || "").includes(query);
    });

    const loadData = useCallback(async () => {
        try {
            const customersData = await getCustomers();
            setCustomers(customersData);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    useEffect(() => {
        if (show) {
            loadData();
            setForm(invoice ? mapPurchaseInvoiceDtoToForm(invoice) : createDefaultForm());
            setSupplierQuery("");
            setSupplierDropdownOpen(false);
            setItems(invoice ? invoice.items.map((item) => calculateItem(mapPurchaseInvoiceItemToForm(item))) : []);
            setCurrentItem(createDefaultItem());
            setError(null);
        }
    }, [show, invoice, loadData]);

    useEffect(() => {
        if (form.supplierId && !supplierQuery) {
            const match = companies.find((company) => company.id === Number(form.supplierId));
            if (match) setSupplierQuery(match.name);
        }
    }, [form.supplierId, companies, supplierQuery]);

    const updateForm = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const handleSupplierQueryChange = (event) => {
        const value = event.target.value;
        setSupplierQuery(value);
        setSupplierDropdownOpen(true);
        if (form.supplierId && value !== selectedCompany?.name) {
            setForm((previous) => ({ ...previous, supplierId: "" }));
        }
    };

    const handleSelectSupplier = (company) => {
        const bankAccount = company.accountNumber
            ? `${company.accountNumber}${company.bankCode ? `/${company.bankCode}` : ""}`
            : "";
        setSupplierQuery(company.name);
        setSupplierDropdownOpen(false);
        setForm((previous) => ({ ...previous, supplierId: String(company.id), bankAccount }));
    };

    const updateCurrentItem = (event) => {
        const { name, value } = event.target;
        setCurrentItem((previous) => calculateItem({ ...previous, [name]: value }));
    };

    const addItem = () => {
        if (!currentItem.description.trim()) {
            setError("Vyplňte popis položky.");
            return;
        }
        setItems((previous) => [...previous, calculateItem(currentItem)]);
        setCurrentItem(createDefaultItem());
        setError(null);
    };

    const removeItem = (index) => {
        setItems((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
    };

    const totals = items.reduce(
        (result, item) => {
            const base = Number(item.totalPriceExVat) || 0;
            const total = Number(item.totalPriceIncVat) || 0;
            return {
                totalAmountExVat: result.totalAmountExVat + base,
                totalAmountIncVat: result.totalAmountIncVat + total,
            };
        },
        { totalAmountExVat: 0, totalAmountIncVat: 0 },
    );
    const vatAmount = totals.totalAmountIncVat - totals.totalAmountExVat;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form.supplierId) {
            setError("Vyberte firmu z nabídky.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const formData = {
                ...form,
                totalAmountExVat: totals.totalAmountExVat,
                vatAmount,
                totalAmountIncVat: totals.totalAmountIncVat,
            };
            const savedInvoice = invoice
                ? await updatePurchaseInvoice(invoice.id, formData, items)
                : await createPurchaseInvoice(formData, items);
            onSuccess(savedInvoice);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className={standalone ? "" : "modal d-block"} tabIndex="-1">
            <div className={standalone ? "" : "modal-dialog modal-xl modal-dialog-scrollable"}>
                <div className={standalone ? "card border-0 shadow-sm" : "modal-content"}>
                    <form onSubmit={handleSubmit}>
                        <div className={`${standalone ? "card-header" : "modal-header"} bg-white border-0 p-4 d-flex justify-content-between align-items-center`}>
                            <div>
                                <h4 className="fw-bold mb-1">{invoice ? "Upravit fakturu došlou" : "Přidat fakturu došlou"}</h4>
                            </div>
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Zavřít</button>
                        </div>
                        <div className={`${standalone ? "card-body" : "modal-body"} p-4`}>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="row g-3">
                                <TextField label="Číslo dokladu dodavatele" name="purchaseInvoiceNumber" value={form.purchaseInvoiceNumber} onChange={updateForm} required />
                                <div className="col-md-4 position-relative">
                                    <label className="form-label">Firma</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="supplier"
                                        value={supplierQuery}
                                        onChange={handleSupplierQueryChange}
                                        onFocus={() => setSupplierDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setSupplierDropdownOpen(false), 150)}
                                        placeholder="Vyhledat firmu podle názvu nebo IČO…"
                                        autoComplete="off"
                                        disabled={Boolean(invoice)}
                                        required
                                    />
                                    {supplierDropdownOpen && !invoice && (
                                        <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1050, maxHeight: "220px", overflowY: "auto" }}>
                                            {filteredCompanies.length > 0 ? filteredCompanies.map((company) => (
                                                <li
                                                    key={company.id}
                                                    className="list-group-item list-group-item-action"
                                                    style={{ cursor: "pointer" }}
                                                    onMouseDown={() => handleSelectSupplier(company)}
                                                >
                                                    {company.name}
                                                    {company.ico ? <span className="text-muted small"> — IČO: {company.ico}</span> : null}
                                                </li>
                                            )) : (
                                                <li className="list-group-item text-muted">Firma nebyla nalezena.</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                                <TextField label="Variabilní symbol" name="variableNumber" value={form.variableNumber} onChange={updateForm} />
                                <DateField label="Datum vystavení" name="issueDate" value={form.issueDate} onChange={updateForm} />
                                <DateField label="DUZP" name="taxableSupplyDate" value={form.taxableSupplyDate} onChange={updateForm} />
                                <DateField label="Datum splatnosti" name="dueDate" value={form.dueDate} onChange={updateForm} />
                                <SelectField label="Odběratel" name="customerId" value={form.customerId} onChange={updateForm} options={companies} placeholder="Vyberte odběratele" disabled={Boolean(invoice)} />
                                <TextField label="Bankovní účet" name="bankAccount" value={form.bankAccount} onChange={updateForm} />
                                <SelectField label="Stav" name="status" value={form.status} onChange={updateForm} options={[{ id: "Nezaplaceno", name: "Nezaplaceno" }, { id: "Zaplaceno", name: "Zaplaceno" }, { id: "Započteno", name: "Započteno" }]} />
                                <TextField label="Měna" name="currencyCode" value={form.currencyCode} onChange={updateForm} />
                                <SelectField label="Způsob úhrady" name="paymentMethod" value={form.paymentMethod} onChange={updateForm} options={[{ id: "Bankovní převod", name: "Bankovní převod" }, { id: "Hotově", name: "Hotově" }]} />
                                <div className="col-12"><label className="form-label">Poznámka</label><textarea className="form-control" name="note" value={form.note} onChange={updateForm} rows="2" /></div>
                            </div>

                            <hr className="my-4" />
                            <h5 className="fw-bold mb-3">Položky faktury</h5>
                            <div className="row g-2 align-items-end">
                                <div className="col-md-2"><label className="form-label">Kód produktu</label><input className="form-control" name="productCode" value={currentItem.productCode} onChange={updateCurrentItem} /></div>
                                <div className="col-md-3"><label className="form-label">Popis</label><input className="form-control" name="description" value={currentItem.description} onChange={updateCurrentItem} /></div>
                                <div className="col-md-2"><label className="form-label">Množství</label><input className="form-control" type="number" step="0.01" name="quantity" value={currentItem.quantity} onChange={updateCurrentItem} /></div>
                                <div className="col-md-2"><label className="form-label">Cena bez DPH</label><input className="form-control no-spinner" type="number" step="0.01" name="unitPriceExVat" value={currentItem.unitPriceExVat} onChange={updateCurrentItem} /></div>
                                <div className="col-md-1"><label className="form-label">DPH %</label><select className="form-select" name="vatRate" value={currentItem.vatRate} onChange={updateCurrentItem}><option value="21">21 %</option><option value="12">12 %</option><option value="0">0 %</option></select></div>
                                <div className="col-md-2"><button type="button" className="btn btn-primary w-100" onClick={addItem}>Přidat položku</button></div>
                            </div>
                            <div className="table-responsive mt-3">
                                <table className="table align-middle"><thead><tr><th>Kód</th><th>Popis</th><th>Množství</th><th>Cena bez DPH</th><th>DPH</th><th>Celkem s DPH</th><th /></tr></thead>
                                    <tbody>{items.map((item, index) => <tr key={`${item.description}-${index}`}><td>{item.productCode}</td><td>{item.description}</td><td>{item.quantity}</td><td>{Number(item.unitPriceExVat).toFixed(2)}</td><td>{item.vatRate}%</td><td>{Number(item.totalPriceIncVat).toFixed(2)} {form.currencyCode}</td><td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(index)}>Odebrat</button></td></tr>)}</tbody>
                                </table>
                            </div>
                            <div className="row justify-content-end text-end mt-3"><div className="col-md-4"><div>Základ: <strong>{totals.totalAmountExVat.toFixed(2)} {form.currencyCode}</strong></div><div>DPH: <strong>{vatAmount.toFixed(2)} {form.currencyCode}</strong></div><div className="fs-5">Celkem: <strong>{totals.totalAmountIncVat.toFixed(2)} {form.currencyCode}</strong></div></div></div>
                        </div>
                        <div className={`${standalone ? "card-footer" : "modal-footer"} bg-white border-0 p-4 d-flex justify-content-end gap-2`}><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Zrušit</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Ukládám…" : invoice ? "Uložit změny" : "Uložit fakturu"}</button></div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function DateField({ label, name, value, onChange }) { return <div className="col-md-4"><label className="form-label">{label}</label><input className="form-control" type="date" name={name} value={value} onChange={onChange} required /></div>; }
function TextField({ label, name, value, onChange, required = false }) { return <div className="col-md-4"><label className="form-label">{label}</label><input className="form-control" name={name} value={value} onChange={onChange} required={required} /></div>; }
function SelectField({ label, name, value, onChange, options = [], placeholder }) { return <div className="col-md-4"><label className="form-label">{label}</label><select className="form-select" name={name} value={value} onChange={onChange} required={name === "customerId" || name === "supplierId"}><option value="">{placeholder || "Vyberte"}</option>{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></div>; }

export default PurchaseInvoiceForm;

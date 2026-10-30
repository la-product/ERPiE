import { useCallback, useEffect, useState } from "react";
import {
    deletePurchaseInvoice,
    getPurchaseInvoiceById,
    getPurchaseInvoices,
    updatePurchaseInvoiceStatus,
} from "../services/purchaseInvoiceService";
import PurchaseInvoiceForm from "./PurchaseInvoiceForm";
import ConfirmModal from "../components/ConfirmModal";

function statusClass(status) {
    switch (status?.toLowerCase()) {
        case "zaplaceno":
            return "badge-success-light";
        case "započteno":
            return "badge-warning-light";
        default:
            return "badge-danger-light";
    }
}

function formatDate(value) {
    return value ? new Date(value).toLocaleDateString("cs-CZ") : "—";
}

function formatAmount(value, currency) {
    return `${Number(value || 0).toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || ""}`;
}

function PurchaseInvoices({ view, user, setActivePage, invoiceId, onEditPurchaseInvoice }) {
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [loading, setLoading] = useState(view === "edit");
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            setInvoices(await getPurchaseInvoices());
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === "list") loadData();
    }, [view, loadData]);

    useEffect(() => {
        if (view !== "edit") return;

        if (!invoiceId) {
            setError("Není vybraná došlá faktura k úpravě.");
            setLoading(false);
            return;
        }

        setLoading(true);
        getPurchaseInvoiceById(invoiceId)
            .then(setSelectedInvoice)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [view, invoiceId]);

    const openInvoice = async (id) => {
        try {
            setSelectedInvoice(await getPurchaseInvoiceById(id));
            setShowModal(true);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const changeStatus = async () => {
        const statuses = ["Nezaplaceno", "Zaplaceno", "Započteno"];
        const currentIndex = statuses.findIndex((status) => status.toLowerCase() === selectedInvoice.status?.toLowerCase());
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        try {
            const updated = await updatePurchaseInvoiceStatus(selectedInvoice.id, nextStatus);
            setSelectedInvoice(updated);
            await loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const confirmDelete = async () => {
        try {
            await deletePurchaseInvoice(deleteTargetId);
            setDeleteTargetId(null);
            setShowModal(false);
            setSelectedInvoice(null);
            await loadData();
        } catch (err) {
            setDeleteTargetId(null);
            setError(err.message);
        }
    };

    if (view === "add") {
        return <PurchaseInvoiceForm show standalone onClose={() => setActivePage("Faktury došlé")} onSuccess={() => setActivePage("Faktury došlé")} />;
    }

    if (view === "edit") {
        if (loading) {
            return <div className="d-flex justify-content-center align-items-center h-100"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Načítám fakturu…</span></div></div>;
        }

        if (error || !selectedInvoice) {
            return <div><div className="alert alert-danger">{error || "Došlou fakturu se nepodařilo načíst."}</div><button className="btn btn-outline-secondary" onClick={() => setActivePage("Faktury došlé")}>Zpět na seznam faktur</button></div>;
        }

        return <PurchaseInvoiceForm show standalone invoice={selectedInvoice} onClose={() => setActivePage("Faktury došlé")} onSuccess={() => setActivePage("Faktury došlé")} />;
    }

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center h-100"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Načítám…</span></div></div>;
    }

    return (
        <div>
            <div className="mb-4"><h4 className="fw-bold mb-0">Seznam faktur došlých</h4></div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead><tr><th>ID</th><th>Číslo dokladu dodavatele</th><th>Dodavatel</th><th>Datum splatnosti</th><th>Celkem s DPH</th><th>Status</th><th className="text-end">Akce</th></tr></thead>
                        <tbody>
                            {invoices.length === 0 ? <tr><td colSpan="7" className="text-center text-muted py-4">Žádné došlé faktury</td></tr> : invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="text-muted">{invoice.id}</td>
                                    <td className="fw-bold text-dark">{invoice.purchaseInvoiceNumber || "—"}</td>
                                    <td className="fw-bold text-dark">{invoice.supplierName || "—"}</td>
                                    <td>{formatDate(invoice.dueDate)}</td>
                                    <td className="fw-bold text-dark">{formatAmount(invoice.totalAmountIncVat, invoice.currencyCode)}</td>
                                    <td><span className={`badge ${statusClass(invoice.status)}`}>{invoice.status}</span></td>
                                    <td className="text-end"><button className="btn btn-sm btn-outline-primary me-2" onClick={() => openInvoice(invoice.id)}><i className="bi bi-eye" /></button>{user?.role === "admin" && <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTargetId(invoice.id)}><i className="bi bi-trash" /></button>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && selectedInvoice && <PurchaseInvoiceDetail invoice={selectedInvoice} error={error} onClose={() => { setShowModal(false); setSelectedInvoice(null); }} onEdit={() => { const invoiceIdToEdit = selectedInvoice.id; setSelectedInvoice(null); setError(null); setLoading(true); onEditPurchaseInvoice(invoiceIdToEdit); }} onChangeStatus={changeStatus} onDelete={() => setDeleteTargetId(selectedInvoice.id)} />}
            <ConfirmModal show={deleteTargetId !== null} title="Smazat došlou fakturu" message="Opravdu chcete tuto došlou fakturu smazat?" onConfirm={confirmDelete} onCancel={() => setDeleteTargetId(null)} />
        </div>
    );
}

function PurchaseInvoiceDetail({ invoice, error, onClose, onEdit, onChangeStatus, onDelete }) {
    return <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}><div className="modal-dialog modal-lg modal-dialog-scrollable"><div className="modal-content">
        <div className="modal-header"><div><h5 className="modal-title mb-1">Došlá faktura {invoice.purchaseInvoiceNumber || "—"}</h5><span className={`badge ${statusClass(invoice.status)}`}>{invoice.status}</span></div><button className="btn-close" onClick={onClose} /></div>
        <div className="modal-body p-4">{error && <div className="alert alert-danger">{error}</div>}<div className="row g-3 mb-4"><Info label="Dodavatel" value={invoice.supplier?.name || "—"} /><Info label="Vlastní firma" value={invoice.customer?.name || "—"} /><Info label="Variabilní symbol" value={invoice.variableNumber || "—"} /><Info label="Datum vystavení" value={formatDate(invoice.issueDate)} /><Info label="DUZP" value={formatDate(invoice.taxableSupplyDate)} /><Info label="Splatnost" value={formatDate(invoice.dueDate)} /><Info label="Způsob úhrady" value={invoice.paymentMethod || "—"} /><Info label="Bankovní účet" value={invoice.bankAccount || "—"} /></div><h6 className="fw-bold">Položky</h6><div className="table-responsive"><table className="table table-sm"><thead><tr><th>Kód</th><th>Popis</th><th>Množství</th><th>Cena bez DPH</th><th>DPH</th><th>Celkem</th></tr></thead><tbody>{invoice.items?.map((item) => <tr key={item.id}><td>{item.productCode}</td><td>{item.description}</td><td>{item.quantity}</td><td>{formatAmount(item.unitPriceExVat, invoice.currencyCode)}</td><td>{item.vatRate}%</td><td>{formatAmount(item.totalPriceIncVat, invoice.currencyCode)}</td></tr>)}</tbody></table></div><div className="text-end"><div>Základ: <strong>{formatAmount(invoice.totalAmountExVat, invoice.currencyCode)}</strong></div><div>DPH: <strong>{formatAmount(invoice.vatAmount, invoice.currencyCode)}</strong></div><div className="fs-5">Celkem: <strong>{formatAmount(invoice.totalAmountIncVat, invoice.currencyCode)}</strong></div></div>{invoice.note && <div className="mt-3"><strong>Poznámka:</strong> {invoice.note}</div>}</div>
        <div className="modal-footer"><button className="btn btn-outline-primary" onClick={onEdit}>Upravit</button><button className="btn btn-outline-primary" onClick={onChangeStatus}>Změnit stav</button><button className="btn btn-outline-danger" onClick={onDelete}>Smazat</button><button className="btn btn-secondary" onClick={onClose}>Zavřít</button></div>
    </div></div></div>;
}

function Info({ label, value }) { return <div className="col-md-6"><div className="border rounded p-3 bg-light"><div className="small fw-bold text-uppercase text-muted">{label}</div><div>{value}</div></div></div>; }

export default PurchaseInvoices;

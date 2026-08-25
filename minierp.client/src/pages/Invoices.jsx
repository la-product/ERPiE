import { useState, useCallback, useEffect } from "react";
import {
    getInvoices,
    getInvoiceById,
    updateInvoiceStatus,
    deleteInvoice,
} from "../services/invoiceService";
import { formatPrice, formatZip } from '../utils/formatters'
import { printInvoice, shareInvoicePdfByEmail } from '../utils/invoicePrint'
import InvoiceForm from "./InvoiceForm";
import ConfirmModal from "../components/ConfirmModal";

function Invoices({ view, user, setActivePage }) {
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [emailPreparing, setEmailPreparing] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case "nezaplaceno":
                return "badge-danger-light";
            case "zaplaceno":
                return "badge-success-light";
            default:
                return "badge-danger-light";
        }
    };

    const loadData = useCallback(async () => {
        setLoading(true); 
        try {
            const invoicesData = await getInvoices();
            setInvoices(invoicesData);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view !== "add") {
            loadData();
        }
    }, [view, loadData]);
   
    const handleOpenInvoice = async (invoiceId) => {
        try {
            const invoice = await getInvoiceById(invoiceId);
            setSelectedInvoice(invoice);
            setShowModal(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCloseInvoiceModal = () => {
        setShowModal(false);
        setSelectedInvoice(null);
    };

    const handleEmailInvoice = async () => {
        setEmailPreparing(true);
        setError(null);
        try {
            await shareInvoicePdfByEmail(selectedInvoice);
        } catch (err) {
            if (err.name !== "AbortError") {
                setError(err.message);
            }
        } finally {
            setEmailPreparing(false);
        }
    };

    const handleChangeStatus = async () => {
        const statuses = ["Nezaplaceno", "Zaplaceno"];
        const currentIndex = statuses.findIndex(
            s => s.toLowerCase() === selectedInvoice.status.toLowerCase()
        );
        const nextIndex = (currentIndex + 1) % statuses.length; // cyklus
        const nextStatus = statuses[nextIndex];

        try {
            await updateInvoiceStatus(selectedInvoice.id, nextStatus);
            await loadData();
            setSelectedInvoice({ ...selectedInvoice, status: nextStatus });
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteInvoice = (id) => {
        setDeleteTargetId(id);
    };

    const handleConfirmDelete = async () => {
        const id = deleteTargetId;
        setDeleteTargetId(null);
        try {
            await deleteInvoice(id);
            await loadData();
            setShowModal(false);
            setSelectedInvoice(null);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };
  
    if (view === "add") {
        return (
            <InvoiceForm
                show
                standalone
                onClose={() => setActivePage("Seznam FV")}
                onSuccess={() => setActivePage("Seznam FV")}
            />
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
            <div className="mb-4">
                <h4 className="fw-bold mb-0">Seznam Faktur Vystavených</h4>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Číslo faktury</th>
                                <th>Zákazník</th>
                                <th>Datum splatnosti</th>
                                <th>Celkem s DPH</th>
                                <th>Status</th>
                                <th className="text-end">Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="fw-bold text-dark">{invoice.invoiceNumber || `#${invoice.id}`}</td>
                                    <td>
                                        <div className="fw-bold text-dark">{invoice.customerName || "Unknown"}</div>

                                    </td>
                                    <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                    <td className="fw-bold text-dark">
                                        {invoice.totalAmountIncVat.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {invoice.currencyCode}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleOpenInvoice(invoice.id)}
                                        >
                                            <i className="bi bi-eye"></i>
                                        </button>
                                        {user?.role === 'admin'&& (
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteInvoice(invoice.id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {showModal && selectedInvoice && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div>
                                    <h5 className="modal-title mb-1">
                                        Faktura {selectedInvoice.invoiceNumber || `#${selectedInvoice.id}`}
                                    </h5>
                                    <span className={`badge ${getStatusBadgeClass(selectedInvoice.status)}`}>
                                        {selectedInvoice.status}
                                    </span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => printInvoice(selectedInvoice)}
                                    >
                                        <i className="bi bi-printer me-2"></i>Tisk / PDF
                                    </button>
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={handleEmailInvoice}
                                        disabled={emailPreparing}
                                    >
                                        {emailPreparing ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Připravuji...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-envelope me-2"></i>E-mail
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="btn-close"
                                        onClick={handleCloseInvoiceModal}
                                    />
                                </div>
                            </div>
                            <div className="modal-body p-4">
                                {error && <div className="alert alert-danger">{error}</div>}

                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="border rounded p-3 h-100 bg-light">
                                            <div className="small fw-bold text-uppercase text-muted mb-1">Dodavatel</div>
                                            <div className="fw-bold">{selectedInvoice.supplier?.name || "—"}</div>
                                            {selectedInvoice.supplier?.street && (
                                                <div>{selectedInvoice.supplier.street}, {formatZip(selectedInvoice.supplier.zip)} {selectedInvoice.supplier.city}</div>
                                            )}
                                            {selectedInvoice.supplier?.ico && <div>IČO: {selectedInvoice.supplier.ico}</div>}
                                            {selectedInvoice.supplier?.dic && <div>DIČ: {selectedInvoice.supplier.dic}</div>}
                                            {selectedInvoice.supplier?.note && (
                                                <div className="text-muted small mt-1">{selectedInvoice.supplier.note}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="border rounded p-3 h-100 bg-light">
                                            <div className="small fw-bold text-uppercase text-muted mb-1">Odběratel</div>
                                            <div className="fw-bold">{selectedInvoice.customer?.name || "—"}</div>
                                            {selectedInvoice.customer?.street && (
                                                <div>{selectedInvoice.customer.street}, {formatZip(selectedInvoice.customer.zip)} {selectedInvoice.customer.city}</div>
                                            )}
                                            {selectedInvoice.customer?.ico && <div>IČO: {selectedInvoice.customer.ico}</div>}
                                            {selectedInvoice.customer?.dic && <div>DIČ: {selectedInvoice.customer.dic}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-md-3">
                                        <div className="small fw-bold text-uppercase text-muted mb-1">Datum vystavení</div>
                                        <div>{new Date(selectedInvoice.issueDate).toLocaleDateString('cs-CZ')}</div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="small fw-bold text-uppercase text-muted mb-1">DUZP</div>
                                        <div>{new Date(selectedInvoice.taxableSupplyDate).toLocaleDateString('cs-CZ')}</div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="small fw-bold text-uppercase text-muted mb-1">Datum splatnosti</div>
                                        <div>{new Date(selectedInvoice.dueDate).toLocaleDateString('cs-CZ')}</div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="small fw-bold text-uppercase text-muted mb-1">Způsob platby</div>
                                        <div>{selectedInvoice.paymentMethod || "—"}</div>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="small fw-bold text-uppercase text-muted mb-1">Bankovní účet</div>
                                        <div>{selectedInvoice.bankAccount || "—"}</div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="small fw-bold text-uppercase text-muted mb-1">Variabilní symbol</div>
                                        <div>{selectedInvoice.variableSymbol || "—"}</div>
                                    </div>
                                </div>

                                <div className="border-top pt-4 mt-4">
                                    <h6 className="fw-bold mb-3">Položky faktury</h6>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Položka</th>
                                                    <th className="text-center">Množství</th>
                                                    <th className="text-end">Jednotková cena</th>
                                                    <th className="text-end">Sazba DPH</th>
                                                    <th className="text-end">Celkem</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedInvoice.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.description}</td>
                                                        <td className="text-center">{item.quantity}</td>
                                                        <td className="text-end">{formatPrice(item.unitPrice, selectedInvoice.currencyCode)}</td>
                                                        <td className="text-end">{(item.vatRate * 100).toFixed(0)} %</td>
                                                        <td className="text-end fw-bold">{formatPrice(item.totalPrice, selectedInvoice.currencyCode)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="row mt-4">
                                    <div className="col-md-6 ms-auto">
                                        <div className="card bg-light border-0">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Celkem bez DPH:</span>
                                                    <span className="fw-bold">{formatPrice(selectedInvoice.totalAmountExVat, selectedInvoice.currencyCode)}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">DPH:</span>
                                                    <span className="fw-bold">{formatPrice(selectedInvoice.vatAmount, selectedInvoice.currencyCode)}</span>
                                                </div>
                                                <hr />
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="h6 mb-0 fw-bold">Celkem s DPH:</span>
                                                    <span className="h5 mb-0 fw-bold text-primary">{formatPrice(selectedInvoice.totalAmountIncVat, selectedInvoice.currencyCode)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleChangeStatus}
                                >
                                    <i className="bi bi-arrow-repeat me-2"></i>Změn stav
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={handleCloseInvoiceModal}
                                >
                                    Zavři
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal
                show={deleteTargetId !== null}
                title="Smazat fakturu"
                message="Opravdu chcete smazat tuto fakturu?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTargetId(null)}
            />
        </div>
    );
}

export default Invoices;

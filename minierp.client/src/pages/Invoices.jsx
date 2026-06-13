import { useState, useCallback, useEffect } from "react";
import {
    getInvoices,
    getInvoiceById,
    updateInvoiceStatus,
    deleteInvoice,
    
} from "../services/invoiceService";
import { getCustomers } from "../services/customerService";
import {formatPrice } from '../utils/formatters'

function Invoices({ view, user, setActivePage }) {
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            const [invoicesData, customersData] = await Promise.all([
                getInvoices(),
                getCustomers(),
            ]);
            setInvoices(invoicesData);
            setCustomers(customersData);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, [loadData]);
   
    const handleOpenInvoice = async (invoiceId) => {
        try {
            const invoice = await getInvoiceById(invoiceId);
            setSelectedInvoice(invoice);
            setShowModal(true);
        } catch (err) {
            setError(err.message);
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

    const handleDeleteInvoice = async (id) => {
        if (window.confirm("Opravdu chcete smazat tuto fakturu?")) {
            try {
                await deleteInvoice(id);
                await loadData();
                setShowModal(false);
                setSelectedInvoice(null);
                setError(null);
            } catch (err) {
                setError(err.message);
            }
        }
    };
  
    if (view === "add") {
        return (
            <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Faktury mohou být přidány pouze přes dodací list.
                <br /><br />
                <button className="btn btn-primary" onClick={() => setActivePage('Přidat DL')}>
                    <i className="bi bi-arrow-left me-2"></i>Vytvoř nový Dodací List
                </button>
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
                                    <td className="fw-bold text-dark">#{invoice.id}</td>
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
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Číslo Faktury #{selectedInvoice.id}</h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <h6>Zákazník</h6>
                                <p className="mb-0"><strong>{selectedInvoice.customer?.name}</strong></p>
                                <p className="mb-0">{selectedInvoice.customer?.street}</p>
                                <p className="mb-3">{selectedInvoice.customer?.city} {selectedInvoice.customer?.zip}</p>
                             

                                <h6>Položky</h6>
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Zboží</th>
                                            <th>Popis</th>
                                            <th>Množství</th>
                                            <th>Cena s DPH</th>
                                            <th>Celkem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoice.items.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.product?.brand} {item.product?.size} {item.product?.pattern}</td>
                                                <td>{item.description}</td>
                                                <td>{item.quantity}</td>
                                                <td>{formatPrice(item.unitPrice)}</td>
                                                <td>{formatPrice(item.totalPrice)}</td>
                                            </tr>
                                              
                                        ))}
                                    </tbody>
                                </table>

                                <div className="text-end mt-3 p-3 bg-light rounded">
                                    <div>
                                        Cena bez DPH:{" "}
                                        <strong>
                                            {formatPrice(selectedInvoice.totalAmountExVat)}{" "}
                                           
                                        </strong>
                                    </div>
                                    <div>
                                        DPH 21%:{" "}
                                        <strong>
                                            {formatPrice(selectedInvoice.vatAmount)}{" "}
                                            
                                        </strong>
                                    </div>
                                    <div className="fs-5">
                                        Celkem s DPH:{" "}
                                        <strong>
                                            {formatPrice(selectedInvoice.totalAmountIncVat)}{" "}
                                        
                                        </strong>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <span className={`badge ${getStatusBadgeClass(selectedInvoice.status)}`}>
                                        {selectedInvoice.status}
                                    </span>
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
                                    onClick={() => setShowModal(false)}
                                >
                                    Zavři
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Invoices;

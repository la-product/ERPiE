import { useState, useCallback, useEffect } from "react";
import {
    getInvoices,
    getInvoiceById,
    updateInvoiceStatus,
    deleteInvoice,
} from "../services/invoiceService";
import { getCustomers } from "../services/customerService";
import {formatPrice } from '../utils/formatters'

function Invoices({ view, user }) {
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "unpaid":
                return "badge-danger-light";
            case "paid":
                return "badge-success-light";
            default: "unpaid"
                return "badge-danger-light";
        }
    };

    const loadData = useCallback(async () => {
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
        const statuses = ["draft", "issued", "paid", "overdue"];
        const currentIndex = statuses.indexOf(selectedInvoice.status);
        if (currentIndex === -1 || currentIndex === statuses.length - 1) return;

        try {
            const updatedStatus = statuses[currentIndex + 1];
            await updateInvoiceStatus(selectedInvoice.id, updatedStatus);
            await loadData();
            setSelectedInvoice({ ...selectedInvoice, status: updatedStatus });
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
   console.log(invoices)
    if (view === "add") {
        return (
            <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Invoices can be created directly from Orders. Please go to Orders, open an order detail, and click "Create Invoice".
                <br /><br />
                <button className="btn btn-primary" onClick={() => (window.location.hash = "#/orders")}>
                    <i className="bi bi-arrow-left me-2"></i>Go to Orders
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
                <h4 className="fw-bold mb-0">List of Invoices</h4>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Customer</th>
                                <th>Due Date</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
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
                                <h5 className="modal-title">Invoice #{selectedInvoice.id}</h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <h6>Customer</h6>
                                <p className="mb-0"><strong>{selectedInvoice.customer?.name}</strong></p>
                                <p className="mb-0">{selectedInvoice.customer?.street}</p>
                                <p className="mb-3">{selectedInvoice.customer?.city} {selectedInvoice.customer?.zip}</p>
                             

                                <h6>Items</h6>
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Description</th>
                                            <th>Qty</th>
                                            <th>Unit Price</th>
                                            <th>Total</th>
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
                                        Ex VAT:{" "}
                                        <strong>
                                            {formatPrice(selectedInvoice.totalAmountExVat)}{" "}
                                           
                                        </strong>
                                    </div>
                                    <div>
                                        VAT:{" "}
                                        <strong>
                                            {formatPrice(selectedInvoice.vatAmount)}{" "}
                                            
                                        </strong>
                                    </div>
                                    <div className="fs-5">
                                        Total:{" "}
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
                                    <i className="bi bi-arrow-repeat me-2"></i>Change Status
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
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

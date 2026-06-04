import { useCallback, useEffect, useState } from "react";
import { HashRouter, Routes, Route } from 'react-router-dom';
import {
    getCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
   
} from "../services/customerService";
import {
    mapCustomerDtoToForm
} from "../mappers/customerMapper";
import { useNavigate } from 'react-router-dom';


function Customers({ view, setActivePage }) {
    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState({
        name: "",
        email: "",
        street: "",
        city: "",
        zip: "",
        phone: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
   

    const loadCustomers = useCallback(async () => {
        try {
            const data = await getCustomers();
            setCustomers(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadCustomers();
    }, [loadCustomers]);

    const handleEdit = (customer) => {
        setEditForm(mapCustomerDtoToForm(customer));
        setShowModal(true);
    };

    const handleUpdate = async () => {
        try {
            const updated = await updateCustomer(editForm.id, editForm);
            setCustomers((prev) =>
                prev.map((c) => (c.id === editForm.id ? updated : c)),
            );
            setShowModal(false);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Opravdu chcete smazat tohoto zákazníka?")) {
            try {
                await deleteCustomer(id);
                setCustomers((prev) => prev.filter((c) => c.id !== id));
                setError(null);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleSubmit = async () => {
        try {
            const newCustomer = await addCustomer(form);
            setCustomers([...customers, newCustomer]);
            setForm({
                name: "",
                email: "",
                street: "",
                city: "",
                zip: "",
                phone: "",
            });
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    if (view === "add") {
        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Add Customer</h4>
                    <button className="btn btn-outline-secondary" onClick={() => setActivePage('Customer list')}>
                        <i className="bi bi-arrow-left me-2"></i>Back to List
                    </button>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="card border-0 shadow-sm" style={{ maxWidth: 800 }}>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">Customer Name</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-person text-muted"></i></span>
                                    <input
                                        className="form-control"
                                        placeholder="Full Name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">Email Address</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-envelope text-muted"></i></span>
                                    <input
                                        className="form-control"
                                        placeholder="email@example.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">Phone Number</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-telephone text-muted"></i></span>
                                    <input
                                        className="form-control"
                                        placeholder="+420 ..."
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-12 mt-4">
                                <h6 className="fw-bold mb-3 border-bottom pb-2">Address Details</h6>
                            </div>
                            <div className="col-md-8">
                                <label className="form-label small fw-bold text-uppercase text-muted">Street</label>
                                <input
                                    className="form-control"
                                    placeholder="Street and house number"
                                    value={form.street}
                                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">ZIP Code</label>
                                <input
                                    className="form-control"
                                    placeholder="123 45"
                                    value={form.zip}
                                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                                />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label small fw-bold text-uppercase text-muted">City</label>
                                <input
                                    className="form-control"
                                    placeholder="City"
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-top">
                            <button className="btn btn-primary btn-lg w-100 fw-bold" onClick={handleSubmit}>
                                <i className="bi bi-person-plus me-2"></i>Create Customer
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
                <div className="spinner-border text-primary" role="status" style={{ color: 'var(--primary) !important' }}>
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
                                <h5 className="modal-title">Edit Customer</h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="row g-2">
                                    <div className="col-md-6">
                                        <label className="form-label">Name</label>
                                        <input
                                            className="form-control"
                                            value={editForm.name || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Email</label>
                                        <input
                                            className="form-control"
                                            value={editForm.email || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, email: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Phone</label>
                                        <input
                                            className="form-control"
                                            value={editForm.phone || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, phone: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Address</label>
                                        <input
                                            className="form-control"
                                            value={editForm.street || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, street: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">City</label>
                                        <input
                                            className="form-control"
                                            value={editForm.city || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, city: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">ZIP Code</label>
                                        <input
                                            className="form-control"
                                            value={editForm.zip || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, zip: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
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
                <h4 className="fw-bold mb-0">Customer List</h4>
                <button className="btn btn-primary" onClick={() => setActivePage('Add customer')}>
                    <i className="bi bi-plus-lg me-2"></i>New Customer
                </button>
            </div>
            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact Information</th>
                                <th>Location</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td className="fw-bold">{customer.name}</td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <span className="text-dark">{customer.email}</span>
                                            <span className="text-muted small">{customer.phone}</span>
                                        </div>
                                    </td>
                                    <td>{customer.city}</td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(customer)}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(customer.id)}
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
        </div>
    );
}

export default Customers;

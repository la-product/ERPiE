import { useCallback, useEffect, useState } from "react";
import {
    getCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCompanyFromAres,
} from "../services/customerService";
import {
    mapCustomerDtoToForm
} from "../mappers/customerMapper";
import ConfirmModal from "../components/ConfirmModal";

function Customers({ view, setActivePage, user }) {
    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState({
        name: "",
        email: "",
        street: "",
        city: "",
        zip: "",
        phone: "",
        ico: "",
        dic: "",
        accountNumber: "",
        bankCode: "",
        isSupplier: false,
        note: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [aresLoading, setAresLoading] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

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

    const handleDelete = (id) => {
        setDeleteTargetId(id);
    };

    const handleConfirmDelete = async () => {
        const id = deleteTargetId;
        setDeleteTargetId(null);
        try {
            await deleteCustomer(id);
            setCustomers((prev) => prev.filter((c) => c.id !== id));
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const validateIco = (ico) => /^\d{8}$/.test(ico);

    const handleLoadFromAres = async () => {
        if (!validateIco(form.ico)) {
            setError("Pro načtení z ARESu zadejte platné IČO (8 číslic).");
            return;
        }

        setAresLoading(true);
        try {
            const company = await getCompanyFromAres(form.ico);
            setForm((prev) => ({
                ...prev,
                name: company.name || prev.name,
                street: company.street || prev.street,
                city: company.city || prev.city,
                zip: company.zip || prev.zip,
                dic: company.dic || prev.dic,
                accountNumber: company.accountNumber || prev.accountNumber,
                backCode: company.backCode || prev.backCode
            }));
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setAresLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (form.ico && !validateIco(form.ico)) {
            setError("IČO musí obsahovat právě 8 číslic (pouze číslice).");
            return;
        }
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
                ico: "",
                dic: "",
                accountNumber: "",
                backCode: "",
                isSupplier: false,
                note: "",
            });
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleFilterChange = (event) => {
        setFilterText(event.target.value);
    };

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name.toLowerCase().includes(filterText.toLowerCase()) ||
            (customer.ico && customer.ico.toLowerCase().includes(filterText.toLowerCase())),
    );

    if (view === "add") {
        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Přidej zákazníka</h4>
                    <button className="btn btn-outline-secondary" onClick={() => setActivePage('Seznam firem')}>
                        <i className="bi bi-arrow-left me-2"></i>Zpět na seznam
                    </button>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="card border-0 shadow-sm" style={{ maxWidth: 800 }}>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">Název zákazníka</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-person text-muted"></i></span>
                                    <input
                                        className="form-control"
                                        placeholder="Firma s.r.o."
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">Email</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-envelope text-muted"></i></span>
                                    <input
                                        className="form-control"
                                        placeholder="email@email.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-uppercase text-muted">Mobil</label>
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
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">IČO</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-hash text-muted"></i></span>
                                    <input
                                        className={`form-control${form.ico && !validateIco(form.ico) ? " is-invalid" : ""}`}
                                        placeholder="12345678"
                                        maxLength={8}
                                        value={form.ico}
                                        onChange={(e) => setForm({ ...form, ico: e.target.value.replace(/\D/g, "") })}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={handleLoadFromAres}
                                        disabled={aresLoading || !validateIco(form.ico)}
                                        title="Načíst údaje z ARESu"
                                    >
                                        {aresLoading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            <>
                                                <i className="bi bi-cloud-download me-1"></i>ARES
                                            </>
                                        )}
                                    </button>
                                    {form.ico && !validateIco(form.ico) && (
                                        <div className="invalid-feedback">IČO musí mít přesně 8 číslic.</div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">DIČ</label>
                                <input
                                    className="form-control"
                                    placeholder="CZ12345678"
                                    value={form.dic}
                                    onChange={(e) => setForm({ ...form, dic: e.target.value })}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">Číslo účtu</label>
                                <input
                                    className="form-control"
                                    placeholder="12345678"
                                    value={form.accountNumber}
                                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">Kód Banky</label>
                                <input
                                    className="form-control"
                                    placeholder="0100"
                                    value={form.bankCode}
                                    onChange={(e) => setForm({ ...form, bankCode: e.target.value })}
                                />
                            </div>
                            <div className="col-md-2 d-flex align-items-end pb-1">
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="isSupplier"
                                        checked={form.isSupplier}
                                        onChange={(e) => setForm({ ...form, isSupplier: e.target.checked })}
                                    />
                                    <label className="form-check-label" htmlFor="isSupplier">Dodavatel</label>
                                </div>
                            </div>
                            <div className="col-12 mt-2">
                                <h6 className="fw-bold mb-3 border-bottom pb-2">Adresa</h6>
                            </div>
                            <div className="col-md-8">
                                <label className="form-label small fw-bold text-uppercase text-muted">Ulice</label>
                                <input
                                    className="form-control"
                                    placeholder="Název a č. popisné"
                                    value={form.street}
                                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">PSČ</label>
                                <input
                                    className="form-control"
                                    placeholder="123 45"
                                    value={form.zip}
                                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                                />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label small fw-bold text-uppercase text-muted">Město</label>
                                <input
                                    className="form-control"
                                    placeholder="Ostrava"
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label small fw-bold text-uppercase text-muted">Poznámka</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    placeholder="Interní poznámka k zákazníkovi"
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-top">
                            <button className="btn btn-primary btn-lg w-100 fw-bold" onClick={handleSubmit}>
                                <i className="bi bi-person-plus me-2"></i>Vytvoř zákazníka
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
                    <span className="visually-hidden">Načítání...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            {error && <div className="alert alert-danger">{error}</div>}
            <ConfirmModal
                show={deleteTargetId !== null}
                title="Smazat zákazníka"
                message="Opravdu chcete smazat tohoto zákazníka?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTargetId(null)}
            />
            {showModal && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edituj zákazníka</h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="row g-2">
                                    <div className="col-md-6">
                                        <label className="form-label">Název</label>
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
                                        <label className="form-label fw-bold">Mobil</label>
                                        <input
                                            className="form-control"
                                            value={editForm.phone || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, phone: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">IČO</label>
                                        <input
                                            className="form-control"
                                            value={editForm.ico || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, ico: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">DIČ</label>
                                        <input
                                            className="form-control"
                                            value={editForm.dic || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, dic: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Číslo účtu</label>
                                        <input
                                            className="form-control"
                                            value={editForm.accountNumber || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, accountNumber: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Kód banky</label>
                                        <input
                                            className="form-control"
                                            value={editForm.bankCode || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, bankCode: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Ulice</label>
                                        <input
                                            className="form-control"
                                            value={editForm.street || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, street: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Město</label>
                                        <input
                                            className="form-control"
                                            value={editForm.city || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, city: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">PSČ</label>
                                        <input
                                            className="form-control"
                                            value={editForm.zip || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, zip: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-6 d-flex align-items-end pb-1">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="editIsSupplier"
                                                checked={editForm.isSupplier || false}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, isSupplier: e.target.checked })
                                                }
                                            />
                                            <label className="form-check-label" htmlFor="editIsSupplier">Dodavatel</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold">Poznámka</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={editForm.note || ""}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, note: e.target.value })
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
                                    Zavřít
                                </button>
                                <button className="btn btn-primary" onClick={handleUpdate}>
                                    Ulož
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Adresář Firem</h4>
                <div className="w-50">
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Hledej podle názvu nebo IČO"
                        value={filterText}
                        onChange={handleFilterChange}
                    />
                </div>
                <button className="btn btn-primary" onClick={() => setActivePage('Přidat firmu')}>
                    <i className="bi bi-plus-lg me-2"></i>Nový zákazník
                </button>
            </div>
            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Název</th>
                                <th>IČO</th>
                                <th>Kontakt</th>
                                <th>Město</th>
                                {user?.role === 'admin' && <th className="text-end">Akce</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id}>
                                    <td className="fw-bold">
                                        {customer.name}
                                        {customer.isSupplier && (
                                            <span className="badge bg-info ms-2">Dodavatel</span>
                                        )}
                                    </td>
                                    <td>{customer.ico}</td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <span className="text-dark">{customer.email}</span>
                                            <span className="text-muted small">{customer.phone}</span>
                                        </div>
                                    </td>
                                    <td>{customer.city}</td>
                                    {user?.role === 'admin' && (
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
                                    )}
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

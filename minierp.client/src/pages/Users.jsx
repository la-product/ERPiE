import { useState } from 'react';

function Users({ view, setActivePage }) {
    const [users, setUsers] = useState([
        { id: 1, username: 'admin', role: 'Admin' },
        { id: 2, username: 'demo', role: 'Demo' }
    ]);

    const renderList = () => (
        <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-bold">Seznam uživatelů</h5>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 border-0">Uživatelské jméno</th>
                                <th className="px-4 py-3 border-0">Role</th>
                                <th className="px-4 py-3 border-0 text-end">Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="px-4 py-3 align-middle">{u.username}</td>
                                    <td className="px-4 py-3 align-middle">
                                        <span className={`badge ${u.role === 'Admin' ? 'bg-primary' : 'bg-secondary'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 align-middle text-end">
                                        <button className="btn btn-sm btn-outline-secondary me-2">
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger">
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

    const renderAdd = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Nový uživatel</h4>
                <button className="btn btn-outline-secondary" onClick={() => setActivePage('User list')}>
                    <i className="bi bi-arrow-left me-2"></i>Zpět na seznam
                </button>
            </div>
            <div className="card border-0 shadow-sm rounded-3" style={{ maxWidth: '600px' }}>
                <div className="card-body p-4">
                    <form>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-uppercase text-muted">Uživatelské jméno</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white"><i className="bi bi-person text-muted"></i></span>
                                <input type="text" className="form-control" placeholder="admin123" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-uppercase text-muted">Heslo</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white"><i className="bi bi-key text-muted"></i></span>
                                <input type="password" className="form-control" />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-uppercase text-muted">Role</label>
                            <select className="form-select">
                                <option value="User">User</option>
                                <option value="Demo">Demo</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                            <button type="button" className="btn btn-light px-4" onClick={() => (window.location.hash = "#/users")}>Zrušit</button>
                            <button type="submit" className="btn btn-primary px-4 fw-bold">Uložit uživatele</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Správa uživatelů</h2>
            </div>
            {view === 'list' ? renderList() : renderAdd()}
        </div>
    );
}

export default Users;

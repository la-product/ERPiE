import { useCallback, useEffect, useState } from 'react';
import { getUsers, addUser } from '../services/userService';

function Users({ view, setActivePage }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', role: 'user' });

    const loadUsers = useCallback(async () => {
        try {
            const data = await getUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addUser(form);
            setForm({ username: '', password: '', role: 'user' });
            setError(null);
            setActivePage('Seznam uživatelů');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderList = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Seznam uživatelů</h4>
                <button className="btn btn-primary" onClick={() => setActivePage('Přidat uživatele')}>
                    <i className="bi bi-plus-lg me-2"></i>Nový uživatel
                </button>
            </div>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : (
                <div className="card border-0 shadow-sm overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Uživatelské jméno</th>
                                    <th>Role</th>
                                    <th className="text-end">Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td className="fw-bold text-dark">{u.username}</td>
                                        <td>
                                            <span className={`badge ${u.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="text-end">
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
            )}
        </div>
    );

    const renderAdd = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Nový uživatel</h4>
                <button className="btn btn-outline-secondary" onClick={() => setActivePage('Seznam uživatelů')}>
                    <i className="bi bi-arrow-left me-2"></i>Zpět na seznam
                </button>
            </div>
            <div className="card border-0 shadow-sm rounded-3" style={{ maxWidth: '600px' }}>
                <div className="card-body p-4">
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-uppercase text-muted">Uživatelské jméno</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white"><i className="bi bi-person text-muted"></i></span>
                                <input
                                    type="text"
                                    name="username"
                                    className="form-control"
                                    placeholder="admin123"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-uppercase text-muted">Heslo</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white"><i className="bi bi-key text-muted"></i></span>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-uppercase text-muted">Role</label>
                            <select name="role" className="form-select" value={form.role} onChange={handleChange}>
                                <option value="user">Uživatel</option>
                                <option value="demo">Demo</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                            <button type="button" className="btn btn-light px-4" onClick={() => setActivePage('Seznam uživatelů')}>
                                Zrušit
                            </button>
                            <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={submitting}>
                                {submitting ? 'Ukládám...' : 'Uložit uživatele'}
                            </button>
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

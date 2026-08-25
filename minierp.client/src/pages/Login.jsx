import { useState } from 'react';
import { setToken, setStoredUser } from '../services/apiClient';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setToken(data.token);
                setStoredUser(data);
                onLogin(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Přihlášení se nezdařilo');
            }
        } catch (err) {
            setError('Nepodařilo se spojit se serverem' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow-sm p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px' }}>
                <div className="text-center mb-4">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                        <i className="bi bi-box-seam me-2" style={{ fontSize: '32px', color: '#1f3a5f' }}></i>
                        <h2 className="fw-bold mb-0" style={{ color: '#1a1a1a' }}>ERPiE</h2>
                    </div>
                    <p className="text-muted">Přihlaste se do systému</p>
                </div>
                {error && <div className="alert alert-danger py-2 small text-center">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Přihlašovací jméno</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-person text-muted"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Zadejte jméno"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Heslo</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-lock text-muted"></i>
                            </span>
                            <input
                                type="password"
                                className="form-control border-start-0"
                                placeholder="Zadejte heslo"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Přihlašování...
                            </>
                        ) : 'Přihlásit se'}
                    </button>
                    <div className="text-muted fst-italic mt-3 text-center">
                    <p>Přihlašovací jméno je demo. Heslo je taktéž demo s password psáno dohromady. Aplikace slouží pouze pro prezentaci.</p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;

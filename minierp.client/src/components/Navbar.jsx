function Navbar({ user, onLogout, onToggleMenu }) {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm px-4 py-2">
            <div className="container-fluid p-0">
                <div className="d-flex align-items-center">
                    <button
                        className="btn btn-link p-0 text-dark border-0 me-3 d-lg-none"
                        onClick={onToggleMenu}
                        aria-label="Otevřít menu"
                        style={{ fontSize: '24px', lineHeight: 1 }}
                    >
                        <i className="bi bi-list"></i>
                    </button>
                    <span className="badge bg-primary-light text-primary border-0 fw-semibold px-3 py-2 ms-2">
                        MiniERP System
                    </span>
                </div>
                
                <div className="d-flex align-items-center ms-auto">
                    {user && (
                        <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1 me-3">
                            <i className="bi bi-person-circle text-primary me-2" style={{ fontSize: '18px' }}></i>
                            <div className="d-flex flex-column me-3">
                                <span className="fw-bold text-dark lh-1" style={{ fontSize: '14px' }}>{user.username}</span>
                                <span className="text-muted" style={{ fontSize: '11px' }}>{user.role}</span>
                            </div>
                            <button 
                                className="btn btn-link p-0 text-danger text-decoration-none border-0 ms-2" 
                                onClick={onLogout}
                                title="Odhlásit se"
                                style={{ fontSize: '18px' }}
                            >
                                <i className="bi bi-box-arrow-right"></i>
                            </button>
                        </div>
                    )}
                    <span className="text-muted small fw-medium">v1.0.0</span>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
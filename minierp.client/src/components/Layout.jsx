import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout({ activePage, setActivePage, user, onLogout, children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    /*******************************************************************
    Po přihlášení na mobilu bývá stránka scrollnutá dolů (kvůli otevřené
    klávesnici na login formuláři) — bez resetu by navbar zůstal mimo
    viditelnou oblast a burger ikona by nešla vidět.
    ********************************************************************/
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSetActivePage = (page) => {
        setActivePage(page);
        setMobileMenuOpen(false);
    };

    return (
        <div className="d-flex flex-column vh-100" style={{ backgroundColor: '#eef1f5' }}>
            <Navbar user={user} onLogout={onLogout} onToggleMenu={() => setMobileMenuOpen((open) => !open)} />
            <div className="d-flex flex-grow-1 overflow-hidden position-relative">
                <Sidebar
                    activePage={activePage}
                    setActivePage={handleSetActivePage}
                    user={user}
                    open={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                />
                <main className="flex-grow-1 p-3 p-lg-5 overflow-auto" style={{ backgroundColor: '#eef1f5' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Layout;
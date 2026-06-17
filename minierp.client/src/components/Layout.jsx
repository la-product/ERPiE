import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout({ activePage, setActivePage, user, onLogout, children }) {
    return (
        <div className="d-flex flex-column vh-100" style={{ backgroundColor: '#eef1f5' }}>
            <Navbar user={user} onLogout={onLogout} />
            <div className="d-flex flex-grow-1 overflow-hidden">
                <Sidebar activePage={activePage} setActivePage={setActivePage} user={user} />
                <main className="flex-grow-1 p-5 overflow-auto" style={{ backgroundColor: '#eef1f5' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Layout;
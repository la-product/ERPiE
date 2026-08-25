    import { useState, useEffect } from 'react';
    import { getProducts } from './services/productService';
    import { clearToken, restoreSession } from './services/apiClient';
    import Layout from './components/Layout';
    import Customers from './pages/Customers';
    import Products from './pages/Products';
    import Orders from './pages/Orders';
    import Invoices from './pages/Invoices';
    import Users from './pages/Users';
    import Login from './pages/Login';
    import Warehouse from './pages/Warehouse';
    import Receipts from './pages/Receipts';

    function App() {
        const [user, setUser] = useState(() => restoreSession());
        const [isAuthenticated, setIsAuthenticated] = useState(() => restoreSession() !== null);
        const [activePage, setActivePage] = useState('Customer list');

        const handleLogin = (userData) => {
            setUser(userData);
            setIsAuthenticated(true);
        };

        const handleLogout = () => {
            clearToken();
            setUser(null);
            setIsAuthenticated(false);
        };

        useEffect(() => {
            window.addEventListener('unauthorized', handleLogout);
            return () => window.removeEventListener('unauthorized', handleLogout);
        }, []);

        const [products, setProducts] = useState([]);
        const [productsLoading, setProductsLoading] = useState(true);

        useEffect(() => {
            if (isAuthenticated) {
                getProducts()
                    .then(data => {
                        setProducts(data);
                    })
                    .catch(() => {
                        setProducts([]);
                    })
                    .finally(() => {
                        setProductsLoading(false);
                    });
            }
        }, [isAuthenticated]);

        const renderPage = () => {
            switch (activePage) {
                case 'Seznam firem': return <Customers view="list" setActivePage={setActivePage} user={user} />;
                case 'Přidat firmu': return <Customers view="add" setActivePage={setActivePage} />;
                case 'Seznam produktů': return <Products view="list" products={products} setProducts={setProducts} loading={productsLoading} setLoading={setProductsLoading} setActivePage={setActivePage} user={user} />;
                case 'Přidat produkt': return <Products view="add" products={products} setProducts={setProducts} loading={productsLoading} setLoading={setProductsLoading} setActivePage={setActivePage} user={user} />;
                case 'Sklad — vše': return <Warehouse user={user} />;
                case 'Seznam příjemek': return <Receipts view="list" products={products} setActivePage={setActivePage} user={user} />;
                case 'Vytvořit příjemku': return <Receipts view="add" products={products} setActivePage={setActivePage} user={user} />;
                case 'Seznam DL': return <Orders view="list" products={products} setProducts={setProducts} setActivePage={setActivePage} user={user} />;
                case 'Přidat DL': return <Orders view="add" products={products} setProducts={setProducts} setActivePage={setActivePage} />;
                case 'Seznam FV': return <Invoices view="list" user={user} setActivePage={setActivePage} />;
                case 'Přidat FV': return <Invoices view="add" setActivePage={setActivePage} />;
                case 'Seznam uživatelů': return user?.role === 'admin' ? <Users view="list" setActivePage={setActivePage} /> : null;
                case 'Přidat uživatele': return user?.role === 'admin' ? <Users view="add" setActivePage={setActivePage} /> : null;
                default: return null;
            }
        };

        if (!isAuthenticated) {
            return <Login onLogin={handleLogin} />;
        }

        return (
            <Layout activePage={activePage} setActivePage={setActivePage} user={user} onLogout={handleLogout}>
                <div className="animate-slide-in">
                    {renderPage()}
                </div>
            </Layout>
        );
    }

    export default App;

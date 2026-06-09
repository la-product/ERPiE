import { useState, useEffect } from 'react';
import { getProducts } from './services/productService';
import Layout from './components/Layout';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import Users from './pages/Users';
import Login from './pages/Login';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [activePage, setActivePage] = useState('Customer list');

    const handleLogin = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        setUser(null);
        setIsAuthenticated(false);
    };

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
            case 'Customer list': return <Customers view="list" setActivePage={setActivePage} setUser={setUser} />;
            case 'Add customer': return <Customers view="add" setActivePage={setActivePage} />;
            case 'Product list': return <Products view="list" products={products} setProducts={setProducts} loading={productsLoading} setLoading={setProductsLoading} setActivePage={setActivePage} setUser={setUser } />;
            case 'Add product': return <Products view="add" products={products} setProducts={setProducts} loading={productsLoading} setLoading={setProductsLoading} setActivePage={setActivePage} setUser={setUser} />;
            case 'Order list': return <Orders view="list" products={products} setProducts={setProducts} setActivePage={setActivePage} setUser={setUser} />;
            case 'Add order': return <Orders view="add" products={products} setProducts={setProducts} setActivePage={setActivePage} />;
            case 'Invoice list': return <Invoices view="list" setUser={setUser} />;
            case 'Add invoice': return <Invoices view="add" />;
            case 'User list': return user?.role === 'Admin' ? <Users view="list" /> : null;
            case 'Add user': return user?.role === 'Admin' ? <Users view="add" /> : null;
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

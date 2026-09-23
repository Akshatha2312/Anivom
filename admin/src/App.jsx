import React, { useState, useEffect } from 'react';
import './App.css';
import { API_BASE_URL } from './config';
import Login from './Login';
import Dashboard from './Dashboard';
import Products from './Products';
import Orders from './Orders';
import Customers from './Customers';
import Designs from './Designs';
import Categories from './Categories';
import Sizes from './Sizes';
import Colours from './Colours';
import Coupons from './Coupons';
import Banners from './Banners';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const checkAuth = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.data?.user && data.data.user.role === 'admin') {
        setUser(data.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      // silent catch
    } finally {
      setUser(null);
    }
  };

  if (authLoading) {
    return (
      <div className="admin-app-loading">
        <div className="admin-spinner"></div>
        <span className="admin-loading-text">VERIFYING ANIVOM ATELIER CREDENTIALS...</span>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="admin-workspace-shell">
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="sidebar-brand-title">ANIVOM</span>
          <span className="sidebar-brand-badge">ATELIER ✦ ADMIN</span>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
          >
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('products');
              setMobileMenuOpen(false);
            }}
          >
            <span>Products</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('orders');
              setMobileMenuOpen(false);
            }}
          >
            <span>Orders</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('customers');
              setMobileMenuOpen(false);
            }}
          >
            <span>Customers</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('categories');
              setMobileMenuOpen(false);
            }}
          >
            <span>Categories</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'sizes' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('sizes');
              setMobileMenuOpen(false);
            }}
          >
            <span>Sizes</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'colours' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('colours');
              setMobileMenuOpen(false);
            }}
          >
            <span>Colours</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'designs' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('designs');
              setMobileMenuOpen(false);
            }}
          >
            <span>Designs</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('coupons');
              setMobileMenuOpen(false);
            }}
          >
            <span>Coupons</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'banners' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('banners');
              setMobileMenuOpen(false);
            }}
          >
            <span>Banners</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="user-profile-summary">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Sign Out ↵
          </button>
        </div>
      </aside>

      <div className="admin-main-stage">
        <header className="admin-top-bar">
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰ Menu
          </button>

          <div className="top-bar-breadcrumbs">
            <span className="breadcrumb-brand">ANIVOM ATELIER</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{activeTab.toUpperCase()}</span>
          </div>

          <div className="top-bar-user-group">
            <span className="admin-role-tag">ADMINISTRATOR</span>
            <span className="admin-user-display">{user.name}</span>
            <button className="top-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="admin-page-body">
          {activeTab === 'dashboard' && <Dashboard onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === 'products' && <Products />}
          {activeTab === 'orders' && <Orders />}
          {activeTab === 'customers' && <Customers />}
          {activeTab === 'categories' && <Categories />}
          {activeTab === 'sizes' && <Sizes />}
          {activeTab === 'colours' && <Colours />}
          {activeTab === 'designs' && <Designs />}
          {activeTab === 'coupons' && <Coupons />}
          {activeTab === 'banners' && <Banners />}
        </main>
      </div>
    </div>
  );
}

export default App;

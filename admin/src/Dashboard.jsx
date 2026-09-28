import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import './Dashboard.css';

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/admin/stats`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch admin stats.');
      }
      setStats(data.data);
    } catch (err) {
      setError(err.message || 'Error loading dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-state-container">
        <div className="admin-spinner"></div>
        <p>Loading ANIVOM Atelier Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-state-container">
        <p className="admin-error-text">{error}</p>
        <button className="admin-btn-secondary" onClick={fetchStats}>
          Retry Loading Stats
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const orderFlow = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const exceptions = ['CANCELLED', 'FAILED'];
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toUpperCase();

  return (
    <div className="dashboard-content atelier-dashboard">
      <header className="atelier-heading">
        <div className="atelier-heading-lockup">
          <span className="atelier-kicker">ANIVOM ATELIER</span>
          <h1>CONTROL ROOM</h1>
        </div>
        <div className="atelier-heading-actions">
          <time className="atelier-date">{currentDate}</time>
          <button className="atelier-refresh" onClick={fetchStats}>
            <span aria-hidden="true">↻</span> REFRESH STATS
          </button>
        </div>
      </header>

      <section className="atelier-overview" aria-label="Store overview">
        <div className="atelier-revenue">
          <span className="atelier-eyebrow">TODAY'S ATELIER</span>
          <strong className="atelier-revenue-value">&#8377;{stats.totalRevenue ? stats.totalRevenue.toLocaleString() : 0}</strong>
          <span className="atelier-revenue-caption">COLLECTED FROM VERIFIED PAYMENTS</span>
          <span className="atelier-revenue-rule" aria-hidden="true"></span>
          <span className="atelier-revenue-note">TOTAL PAID REVENUE</span>
        </div>

        <div className="atelier-measures">
          <div className="atelier-measure">
            <span className="atelier-eyebrow">ORDERS</span>
            <strong>{stats.totalOrders || 0}</strong>
            <span>ALL ORDER STATUSES</span>
          </div>
          <div className="atelier-measure">
            <span className="atelier-eyebrow">ACTIVE PIECES</span>
            <strong>{stats.activeProducts || 0}<i> / {stats.totalProducts || 0}</i></strong>
            <span>CATALOG AVAILABLE</span>
          </div>
          <div className={`atelier-measure ${stats.lowStockCount > 0 ? 'is-attention' : ''}`}>
            <span className="atelier-eyebrow">LOW STOCK</span>
            <strong>{stats.lowStockCount || 0}</strong>
            <span>VARIANTS AT 5 OR LESS</span>
          </div>
        </div>
      </section>

      <section className="atelier-flow-section" aria-labelledby="atelier-flow-title">
        <div className="atelier-section-heading">
          <div>
            <span className="atelier-section-index">01 / OPERATIONS</span>
            <h2 id="atelier-flow-title">ORDER FLOW</h2>
          </div>
          <span className="atelier-section-aside">LIVE STATUS</span>
        </div>
        <div className="atelier-flow-track">
          {orderFlow.map((status, index) => (
            <React.Fragment key={status}>
              <div className={`atelier-flow-step flow-step-${index}`}>
                <strong>{String(stats.ordersByStatus?.[status] || 0).padStart(2, '0')}</strong>
                <span>{status}</span>
              </div>
              {index < orderFlow.length - 1 && <span className="atelier-flow-arrow" aria-hidden="true">&#8594;</span>}
            </React.Fragment>
          ))}
          <div className="atelier-exceptions">
            <span className="atelier-eyebrow">EXCEPTIONS</span>
            {exceptions.map((status) => (
              <span key={status} className="atelier-exception-count">
                <strong>{String(stats.ordersByStatus?.[status] || 0).padStart(2, '0')}</strong> {status}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="atelier-insight-grid">
        <section className="atelier-catalog" aria-labelledby="atelier-catalog-title">
          <div className="atelier-section-heading">
            <div>
              <span className="atelier-section-index">02 / COLLECTION</span>
              <h2 id="atelier-catalog-title">CATALOG PULSE</h2>
            </div>
          </div>
          <div className="atelier-catalog-count">
            <strong>{stats.activeProducts || 0}</strong>
            <div>
              <span>ACTIVE PIECES</span>
              <small>OF {stats.totalProducts || 0} IN THE CATALOG</small>
            </div>
          </div>
          <div className="atelier-catalog-meter" aria-hidden="true">
            <span style={{ width: `${stats.totalProducts ? Math.min((stats.activeProducts / stats.totalProducts) * 100, 100) : 0}%` }}></span>
          </div>
        </section>

        <section className={`atelier-attention ${stats.lowStockCount > 0 ? 'has-alerts' : ''}`} aria-labelledby="atelier-attention-title">
          <div className="atelier-section-heading">
            <div>
              <span className="atelier-section-index">03 / INVENTORY</span>
              <h2 id="atelier-attention-title">NEEDS ATTENTION</h2>
            </div>
          </div>
          {stats.lowStockVariants && stats.lowStockVariants.length > 0 ? (
            <div className="atelier-stock-list">
              {stats.lowStockVariants.map((item) => (
                <div className="atelier-stock-item" key={`${item.productId}_${item.variantId}`}>
                  <div>
                    <strong>{item.productName}</strong>
                    <span>{item.size} / {item.colour}</span>
                  </div>
                  <span className="atelier-stock-remaining">{item.stock} LEFT</span>
                  <button onClick={() => onNavigate('products')}>MANAGE STOCK <span aria-hidden="true">&#8594;</span></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="atelier-all-clear">
              <span className="atelier-clear-mark" aria-hidden="true">&#10003;</span>
              <div><strong>ALL CLEAR</strong><span>No current inventory alerts.</span></div>
            </div>
          )}
        </section>
      </div>

      <section className="atelier-activity" aria-labelledby="atelier-activity-title">
        <div className="atelier-activity-header">
          <div className="atelier-section-heading">
            <div>
              <span className="atelier-section-index">04 / THE FLOOR</span>
              <h2 id="atelier-activity-title">RECENT ACTIVITY</h2>
            </div>
          </div>
          <button className="atelier-view-orders" onClick={() => onNavigate('orders')}>
            VIEW ALL ORDERS <span aria-hidden="true">&#8594;</span>
          </button>
        </div>

        {!stats.recentOrders || stats.recentOrders.length === 0 ? (
          <p className="atelier-empty">No orders placed yet.</p>
        ) : (
          <>
            <div className="atelier-activity-labels" aria-hidden="true">
              <span>DATE / ORDER</span><span>CUSTOMER</span><span>AMOUNT</span><span>PAYMENT</span><span>STATUS</span>
            </div>
            <div className="atelier-activity-list">
              {stats.recentOrders.map((ord) => (
                <article className="atelier-activity-row" key={ord._id}>
                  <div className="atelier-order-reference">
                    <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                    <strong>#{ord._id.slice(-8).toUpperCase()}</strong>
                  </div>
                  <div className="atelier-customer-name">
                    <strong>{ord.user ? ord.user.name : 'Guest'}</strong>
                    <span>{ord.user ? ord.user.email : 'N/A'}</span>
                  </div>
                  <strong className="atelier-order-amount">&#8377;{ord.totalAmount}</strong>
                  <span className={`atelier-status atelier-payment-${(ord.paymentStatus || 'unknown').toLowerCase()}`}>{ord.paymentStatus || 'UNKNOWN'}</span>
                  <span className={`atelier-status atelier-order-${(ord.orderStatus || 'unknown').toLowerCase()}`}>{ord.orderStatus || 'UNKNOWN'}</span>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import StatusBadge from './StatusBadge';

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

  return (
    <div className="dashboard-content">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">ANIVOM ATELIER DASHBOARD</h1>
          <p className="admin-page-subtitle">Real-time store metrics, sales breakdown, and stock alerts</p>
        </div>
        <button className="admin-btn-secondary" onClick={fetchStats}>
          Refresh Stats ↻
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">TOTAL REVENUE (PAID)</span>
          <span className="stat-value">&#8377;{stats.totalRevenue ? stats.totalRevenue.toLocaleString() : 0}</span>
          <span className="stat-sub">From verified customer payments</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">TOTAL ORDERS</span>
          <span className="stat-value">{stats.totalOrders || 0}</span>
          <span className="stat-sub">All order statuses</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">ACTIVE PRODUCTS</span>
          <span className="stat-value">{stats.activeProducts || 0} / {stats.totalProducts || 0}</span>
          <span className="stat-sub">Catalog pieces available</span>
        </div>

        <div className="stat-card stat-alert">
          <span className="stat-label">LOW STOCK ALERTS</span>
          <span className="stat-value">{stats.lowStockCount || 0}</span>
          <span className="stat-sub">Variants with stock &le; 5</span>
        </div>
      </div>

      <div className="dashboard-section-row">
        <div className="admin-card flex-1">
          <h2 className="admin-card-title">Order Status Breakdown</h2>
          <div className="status-counts-grid">
            {stats.ordersByStatus && Object.entries(stats.ordersByStatus).map(([st, count]) => (
              <div key={st} className="status-count-pill">
                <StatusBadge status={st} type="order" />
                <span className="status-count-val">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-section-row">
        <div className="admin-card flex-1">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Recent Customer Orders</h2>
            <button className="admin-text-link" onClick={() => onNavigate('orders')}>
              View All Orders &rarr;
            </button>
          </div>

          {!stats.recentOrders || stats.recentOrders.length === 0 ? (
            <p className="admin-empty-text">No orders placed yet.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>CUSTOMER</th>
                    <th>TOTAL</th>
                    <th>PAYMENT</th>
                    <th>ORDER STATUS</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((ord) => (
                    <tr key={ord._id}>
                      <td className="mono-text">#{ord._id.slice(-8).toUpperCase()}</td>
                      <td>{ord.user ? ord.user.name : 'Guest'} ({ord.user ? ord.user.email : 'N/A'})</td>
                      <td>&#8377;{ord.totalAmount}</td>
                      <td><StatusBadge status={ord.paymentStatus} type="payment" /></td>
                      <td><StatusBadge status={ord.orderStatus} type="order" /></td>
                      <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {stats.lowStockVariants && stats.lowStockVariants.length > 0 && (
        <div className="dashboard-section-row">
          <div className="admin-card flex-1">
            <h2 className="admin-card-title">Low Stock Variant Warnings (&le; 5 units)</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SIZE</th>
                    <th>COLOUR</th>
                    <th>REMAINING STOCK</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockVariants.map((item) => (
                    <tr key={`${item.productId}_${item.variantId}`}>
                      <td><strong>{item.productName}</strong></td>
                      <td>{item.size}</td>
                      <td>{item.colour}</td>
                      <td>
                        <span className="stock-warning-tag">{item.stock} LEFT</span>
                      </td>
                      <td>
                        <button className="admin-btn-secondary sm" onClick={() => onNavigate('products')}>
                          Manage Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

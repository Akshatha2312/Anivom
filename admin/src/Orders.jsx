import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import StatusBadge from './StatusBadge';
import OrderDetailModal from './OrderDetailModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 10);
      if (search.trim()) params.append('search', search.trim());
      if (orderStatusFilter) params.append('orderStatus', orderStatusFilter);
      if (paymentStatusFilter) params.append('paymentStatus', paymentStatusFilter);

      const res = await fetch(`${API_BASE_URL}/api/v1/orders/admin?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch admin orders.');
      }
      setOrders(data.data?.orders || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Error loading orders list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, orderStatusFilter, paymentStatusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">CUSTOMER ORDERS MANAGEMENT</h1>
          <p className="admin-page-subtitle">Inspect customer orders, track payments, review bespoke snapshots, and manage fulfillment</p>
        </div>
        <button className="admin-btn-secondary" onClick={fetchOrders}>
          Refresh List ↻
        </button>
      </div>

      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-box">
          <input
            type="text"
            placeholder="Search by Order ID or Customer Name/Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="admin-btn-secondary sm">
            Search
          </button>
        </form>

        <div className="admin-filter-group">
          <label>Order Status:</label>
          <select
            value={orderStatusFilter}
            onChange={(e) => {
              setOrderStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Order Statuses</option>
            <option value="PLACED">PLACED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>

        <div className="admin-filter-group">
          <label>Payment Status:</label>
          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Payment Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-state-container">
          <div className="admin-spinner"></div>
          <p>Loading Customer Orders...</p>
        </div>
      ) : error ? (
        <div className="admin-state-container">
          <p className="admin-error-text">{error}</p>
          <button className="admin-btn-secondary" onClick={fetchOrders}>
            Retry Loading
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="admin-empty-box">
          <p>No customer orders match your search and filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>PAYMENT STATUS</th>
                  <th>ORDER STATUS</th>
                  <th>DATE PLACED</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord._id}>
                    <td className="mono-text">#{ord._id.slice(-8).toUpperCase()}</td>
                    <td>
                      <div>
                        <strong>{ord.user ? ord.user.name : 'Guest Customer'}</strong>
                      </div>
                      <span className="mono-text sm-text">{ord.user ? ord.user.email : 'N/A'}</span>
                    </td>
                    <td>{ord.items ? ord.items.length : 0} items</td>
                    <td><strong>&#8377;{ord.totalAmount}</strong></td>
                    <td><StatusBadge status={ord.paymentStatus} type="payment" /></td>
                    <td><StatusBadge status={ord.orderStatus} type="order" /></td>
                    <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="admin-btn-secondary sm"
                        onClick={() => setSelectedOrderId(ord._id)}
                      >
                        Inspect Dossier &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="admin-pagination-bar">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="admin-btn-secondary sm"
              >
                &larr; Previous Page
              </button>
              <span className="pagination-info">
                Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.totalOrders} total orders)
              </span>
              <button
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className="admin-btn-secondary sm"
              >
                Next Page &rarr;
              </button>
            </div>
          )}
        </>
      )}

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onUpdated={() => {
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};

export default Orders;

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import StatusBadge from './StatusBadge';

const OrderDetailModal = ({ orderId, onClose, onUpdated }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/admin/${orderId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load order details.');
      }
      const ord = data.data?.order;
      setOrder(ord);

      const allowedTransitions = {
        PLACED: ['CONFIRMED', 'CANCELLED', 'FAILED'],
        CONFIRMED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
        PROCESSING: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['DELIVERED', 'CANCELLED'],
      };

      const options = allowedTransitions[ord.orderStatus] || [];
      if (options.length > 0) {
        setSelectedNextStatus(options[0]);
      } else {
        setSelectedNextStatus('');
      }
    } catch (err) {
      setError(err.message || 'Error loading order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleUpdateStatus = async () => {
    if (!selectedNextStatus) return;
    setUpdating(true);
    setUpdateMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderStatus: selectedNextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update order status.');
      }
      setUpdateMessage(`Order status updated to ${selectedNextStatus}`);
      fetchOrderDetails();
      if (onUpdated) onUpdated();
    } catch (err) {
      alert(err.message || 'Error updating order status.');
    } finally {
      setUpdating(false);
    }
  };

  if (!orderId) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h2>ORDER DETAILS #{orderId.slice(-8).toUpperCase()}</h2>
            <span className="mono-text">ID: {orderId}</span>
          </div>
          <button className="admin-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="admin-state-container">
            <div className="admin-spinner"></div>
            <p>Loading Order Dossier...</p>
          </div>
        ) : error ? (
          <div className="admin-state-container">
            <p className="admin-error-text">{error}</p>
            <button className="admin-btn-secondary" onClick={fetchOrderDetails}>
              Retry Loading
            </button>
          </div>
        ) : !order ? null : (
          <div className="order-detail-stack">
            {updateMessage && <div className="admin-success-banner">{updateMessage}</div>}

            <div className="order-summary-top-grid">
              <div className="summary-block">
                <span className="summary-block-label">PAYMENT STATUS</span>
                <StatusBadge status={order.paymentStatus} type="payment" />
              </div>
              <div className="summary-block">
                <span className="summary-block-label">ORDER STATUS</span>
                <StatusBadge status={order.orderStatus} type="order" />
              </div>
              <div className="summary-block">
                <span className="summary-block-label">TOTAL AMOUNT</span>
                <span className="summary-block-val">&#8377;{order.totalAmount}</span>
              </div>
              <div className="summary-block">
                <span className="summary-block-label">DATE PLACED</span>
                <span className="summary-block-val">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="order-columns-grid">
              <div className="order-col-card">
                <h3>CUSTOMER INFORMATION</h3>
                <div className="info-key-val">
                  <span>Name:</span>
                  <strong>{order.user ? order.user.name : 'N/A'}</strong>
                </div>
                <div className="info-key-val">
                  <span>Email:</span>
                  <strong>{order.user ? order.user.email : 'N/A'}</strong>
                </div>
                <div className="info-key-val">
                  <span>Role:</span>
                  <span>{order.user ? order.user.role : 'N/A'}</span>
                </div>
              </div>

              <div className="order-col-card">
                <h3>SHIPPING ADDRESS SNAPSHOT</h3>
                {order.shippingAddress ? (
                  <div className="address-snapshot-box">
                    <strong>{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone})
                    <div>{order.shippingAddress.addressLine1}</div>
                    {order.shippingAddress.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
                    <div>
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                    </div>
                    <div>{order.shippingAddress.country}</div>
                  </div>
                ) : (
                  <p>No shipping address snapshot available.</p>
                )}
              </div>

              <div className="order-col-card">
                <h3>PAYMENT GATEWAY INFORMATION</h3>
                <div className="info-key-val">
                  <span>Payment Status:</span>
                  <StatusBadge status={order.paymentStatus} type="payment" />
                </div>
                <div className="info-key-val">
                  <span>Razorpay Order ID:</span>
                  <span className="mono-text">{order.razorpayOrderId || 'N/A'}</span>
                </div>
                <div className="info-key-val">
                  <span>Razorpay Payment ID:</span>
                  <span className="mono-text">{order.razorpayPaymentId || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="order-status-update-box">
              <h3>ORDER STATUS TRANSITION CONTROL</h3>
              {['DELIVERED', 'CANCELLED', 'FAILED'].includes(order.orderStatus) ? (
                <p className="status-terminal-note">
                  This order is in terminal state <strong>{order.orderStatus}</strong>. No further status changes are permitted.
                </p>
              ) : (
                <div className="status-transition-controls">
                  <span>Current State: <StatusBadge status={order.orderStatus} type="order" /></span>
                  <span className="transition-arrow">&rarr;</span>
                  <select
                    value={selectedNextStatus}
                    onChange={(e) => setSelectedNextStatus(e.target.value)}
                    className="admin-select-input"
                  >
                    {(() => {
                      const allowedTransitions = {
                        PLACED: ['CONFIRMED', 'CANCELLED', 'FAILED'],
                        CONFIRMED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
                        PROCESSING: ['SHIPPED', 'CANCELLED'],
                        SHIPPED: ['DELIVERED', 'CANCELLED'],
                      };
                      const options = allowedTransitions[order.orderStatus] || [];
                      return options.map((opt) => (
                        <option key={opt} value={opt}>
                          Transition to {opt}
                        </option>
                      ));
                    })()}
                  </select>
                  <button
                    className="admin-submit-btn sm"
                    disabled={updating || !selectedNextStatus}
                    onClick={handleUpdateStatus}
                  >
                    {updating ? 'UPDATING...' : 'APPLY TRANSITION ✦'}
                  </button>
                </div>
              )}
            </div>

            <div className="order-items-section">
              <h3>ORDERED GARMENTS & CUSTOMIZATIONS ({order.items ? order.items.length : 0})</h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ITEM</th>
                      <th>SIZE</th>
                      <th>COLOUR</th>
                      <th>QTY</th>
                      <th>UNIT PRICE</th>
                      <th>SUBTOTAL</th>
                      <th>CUSTOMIZATION DETAILS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items && order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.size}</td>
                        <td>{item.colour}</td>
                        <td>{item.quantity}</td>
                        <td>&#8377;{item.unitPrice}</td>
                        <td><strong>&#8377;{item.subtotal}</strong></td>
                        <td>
                          {item.customized ? (
                            <div className="customization-snapshot-cell">
                              <span className="custom-badge">BESPOKE STUDIO CREATION</span>
                              {item.customizationSnapshot && item.customizationSnapshot.layers ? (
                                <div className="snapshot-layers-list">
                                  {item.customizationSnapshot.layers.map((l, lIdx) => (
                                    <div key={lIdx} className="snapshot-layer-chip">
                                      <span className="layer-tag">{(l.view || 'front').toUpperCase()}</span>
                                      <span>
                                        {l.type === 'text'
                                          ? `Text: "${l.text?.content || ''}"`
                                          : l.type === 'predefined_design'
                                          ? `Artwork: ${l.design?.name || ''}`
                                          : 'Uploaded Image'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="snapshot-note">Studio customization configuration attached.</span>
                              )}
                            </div>
                          ) : (
                            <span className="standard-item-note">Standard Base Garment</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="admin-modal-actions">
          <button className="admin-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;

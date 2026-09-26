import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import StatusBadge from './StatusBadge';

const OrderDetailModal = ({ orderId, onClose, onUpdated }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [activeAction, setActiveAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [adminNotes, setAdminNotes] = useState('');

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
    if (!selectedNextStatus || updatingStatus) return;
    setUpdatingStatus(true);
    setActionError(null);
    setActionSuccess(null);
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
      setActionSuccess(`Order status updated to ${selectedNextStatus}`);
      await fetchOrderDetails();
      if (onUpdated) onUpdated();
    } catch (err) {
      setActionError(err.message || 'Error updating order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleProcessReturn = async (decision) => {
    if (actionLoading) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/admin/${orderId}/return`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          decision,
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setActionSuccess(`Return request ${decision === 'RETURN_APPROVED' ? 'approved' : 'rejected'} successfully.`);
        setActiveAction(null);
        setAdminNotes('');
        await fetchOrderDetails();
        if (onUpdated) onUpdated();
      } else {
        setActionError(data.message || 'Failed to process return request.');
      }
    } catch (err) {
      setActionError('Network error while processing return request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/admin/${orderId}/refund`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setActionSuccess('Refund processed successfully via Razorpay.');
        setActiveAction(null);
        await fetchOrderDetails();
        if (onUpdated) onUpdated();
      } else {
        setActionError(data.message || 'Failed to process refund.');
      }
    } catch (err) {
      setActionError('Network error while processing refund.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!orderId) return null;

  const isEligibleForRefund =
    order &&
    order.paymentStatus === 'PAID' &&
    ['CANCELLED', 'RETURN_APPROVED'].includes(order.orderStatus) &&
    (!order.refundStatus || ['NONE', 'FAILED'].includes(order.refundStatus));

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h2>ORDER DOSSIER #{orderId.slice(-8).toUpperCase()}</h2>
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
            {actionError && <div className="admin-error-banner">{actionError}</div>}
            {actionSuccess && <div className="admin-success-banner">{actionSuccess}</div>}

            <div className="order-summary-top-grid">
              <div className="summary-block">
                <span className="summary-block-label">PAYMENT STATUS</span>
                <StatusBadge status={order.paymentStatus} type="payment" />
              </div>
              <div className="summary-block">
                <span className="summary-block-label">ORDER STATUS</span>
                <StatusBadge status={order.orderStatus} type="order" />
              </div>
              {order.refundStatus && order.refundStatus !== 'NONE' && (
                <div className="summary-block">
                  <span className="summary-block-label">REFUND STATUS</span>
                  <StatusBadge status={order.refundStatus} type="refund" />
                </div>
              )}
              <div className="summary-block">
                <span className="summary-block-label">TOTAL AMOUNT</span>
                <span className="summary-block-val">&#8377;{order.totalAmount}</span>
              </div>
              <div className="summary-block">
                <span className="summary-block-label">DATE PLACED</span>
                <span className="summary-block-val">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              {order.deliveredAt && (
                <div className="summary-block">
                  <span className="summary-block-label">DELIVERED AT</span>
                  <span className="summary-block-val">{new Date(order.deliveredAt).toLocaleString()}</span>
                </div>
              )}
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
                <h3>PAYMENT & REFUND GATEWAY</h3>
                <div className="info-key-val">
                  <span>Payment Status:</span>
                  <StatusBadge status={order.paymentStatus} type="payment" />
                </div>
                {order.refundStatus && order.refundStatus !== 'NONE' && (
                  <div className="info-key-val">
                    <span>Refund Status:</span>
                    <StatusBadge status={order.refundStatus} type="refund" />
                  </div>
                )}
                {order.refundedAmount !== undefined && order.refundedAmount > 0 && (
                  <div className="info-key-val">
                    <span>Refunded Amount:</span>
                    <strong>&#8377;{order.refundedAmount}</strong>
                  </div>
                )}
                {order.refundedAt && (
                  <div className="info-key-val">
                    <span>Refunded Date:</span>
                    <span>{new Date(order.refundedAt).toLocaleString()}</span>
                  </div>
                )}
                {order.razorpayRefundId && (
                  <div className="info-key-val">
                    <span>Razorpay Refund ID:</span>
                    <span className="mono-text">{order.razorpayRefundId}</span>
                  </div>
                )}
                <div className="info-key-val">
                  <span>Razorpay Order ID:</span>
                  <span className="mono-text">{order.razorpayOrderId || 'N/A'}</span>
                </div>
                <div className="info-key-val">
                  <span>Razorpay Payment ID:</span>
                  <span className="mono-text">{order.razorpayPaymentId || 'N/A'}</span>
                </div>

                {isEligibleForRefund && (
                  <div style={{ marginTop: '16px' }}>
                    <button
                      className="admin-submit-btn sm"
                      onClick={() => setActiveAction('refund')}
                    >
                      Process Refund (&#8377;{order.totalAmount})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {order.orderStatus === 'CANCELLED' && (
              <div className="admin-variants-section" style={{ borderLeft: '4px solid #C65D3B' }}>
                <h3>ORDER CANCELLATION DETAILS</h3>
                <div className="info-key-val">
                  <span>Cancellation Reason:</span>
                  <strong>{order.cancellationReason || 'Cancelled by customer'}</strong>
                </div>
                <div className="info-key-val">
                  <span>Cancelled At:</span>
                  <span>{order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="info-key-val">
                  <span>Payment Status:</span>
                  <StatusBadge status={order.paymentStatus} type="payment" />
                </div>
                {order.refundStatus && order.refundStatus !== 'NONE' && (
                  <div className="info-key-val">
                    <span>Refund State:</span>
                    <StatusBadge status={order.refundStatus} type="refund" />
                  </div>
                )}
              </div>
            )}

            {order.orderStatus === 'RETURN_REQUESTED' && (
              <div className="admin-variants-section" style={{ borderLeft: '4px solid #7A1F3D' }}>
                <h3>RETURN REQUEST DOSSIER — ADMIN REVIEW</h3>
                <div className="info-key-val">
                  <span>Return Reason:</span>
                  <strong>{order.returnReason || 'Item return requested'}</strong>
                </div>
                {order.returnDetails && (
                  <div className="info-key-val">
                    <span>Return Details:</span>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                      {order.returnDetails}
                    </p>
                  </div>
                )}
                <div className="info-key-val">
                  <span>Garment Condition:</span>
                  <span className={order.isDefectiveOrDamaged ? 'stock-low-tag' : 'stock-ok-tag'}>
                    {order.isDefectiveOrDamaged ? '⚠️ Defective or Damaged Garment Reported' : '✓ Standard Garment Return'}
                  </span>
                </div>
                <div className="info-key-val">
                  <span>Requested Date:</span>
                  <span>{order.returnRequestedAt ? new Date(order.returnRequestedAt).toLocaleString() : 'N/A'}</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    className="admin-submit-btn sm"
                    onClick={() => setActiveAction('approve_return')}
                  >
                    Approve Return
                  </button>
                  <button
                    className="admin-btn-secondary sm"
                    style={{ color: '#C65D3B', borderColor: '#C65D3B' }}
                    onClick={() => {
                      setAdminNotes('');
                      setActiveAction('reject_return');
                    }}
                  >
                    Reject Return Request
                  </button>
                </div>
              </div>
            )}

            {['RETURN_APPROVED', 'RETURN_REJECTED'].includes(order.orderStatus) && (
              <div
                className="admin-variants-section"
                style={{
                  borderLeft: order.orderStatus === 'RETURN_APPROVED' ? '4px solid #16a34a' : '4px solid #C65D3B',
                }}
              >
                <h3>RETURN REQUEST DECISION RECORD</h3>
                <div className="info-key-val">
                  <span>Decision:</span>
                  <StatusBadge status={order.orderStatus} type="order" />
                </div>
                <div className="info-key-val">
                  <span>Processed At:</span>
                  <span>{order.returnProcessedAt ? new Date(order.returnProcessedAt).toLocaleString() : 'N/A'}</span>
                </div>
                {order.returnAdminNotes && (
                  <div className="info-key-val">
                    <span>Admin Notes:</span>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>{order.returnAdminNotes}</p>
                  </div>
                )}
              </div>
            )}

            <div className="order-status-update-box">
              <h3>ORDER STATUS TRANSITION CONTROL</h3>
              {['DELIVERED', 'CANCELLED', 'FAILED', 'RETURN_APPROVED', 'RETURN_REJECTED'].includes(order.orderStatus) ? (
                <p className="status-terminal-note">
                  This order is in terminal or return-processed state <strong>{order.orderStatus}</strong>.
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
                    disabled={updatingStatus || !selectedNextStatus}
                    onClick={handleUpdateStatus}
                  >
                    {updatingStatus ? 'UPDATING...' : 'APPLY TRANSITION'}
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

      {activeAction === 'approve_return' && (
        <div className="admin-modal-overlay" style={{ zIndex: 3000 }} onClick={() => setActiveAction(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>APPROVE RETURN REQUEST</h2>
              <button className="admin-modal-close" onClick={() => setActiveAction(null)} disabled={actionLoading}>
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#333', marginBottom: '16px' }}>
              Approving this request allows the order to proceed to refund processing.
            </p>

            <div className="admin-variants-section" style={{ marginBottom: '20px' }}>
              <div className="info-key-val">
                <span>Order Reference:</span>
                <strong>#{orderId.slice(-8).toUpperCase()}</strong>
              </div>
              <div className="info-key-val">
                <span>Customer:</span>
                <strong>{order?.user?.name} ({order?.user?.email})</strong>
              </div>
              <div className="info-key-val">
                <span>Return Reason:</span>
                <span>{order?.returnReason}</span>
              </div>
              {order?.returnDetails && (
                <div className="info-key-val">
                  <span>Return Details:</span>
                  <span>{order?.returnDetails}</span>
                </div>
              )}
              <div className="info-key-val">
                <span>Garment Condition:</span>
                <strong>{order?.isDefectiveOrDamaged ? 'Defective or Damaged Garment' : 'Standard Garment Return'}</strong>
              </div>
            </div>

            <div className="admin-modal-actions" style={{ justifyContent: 'flex-end', gap: '12px' }}>
              <button className="admin-btn-secondary" onClick={() => setActiveAction(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button
                className="admin-submit-btn"
                disabled={actionLoading}
                onClick={() => handleProcessReturn('RETURN_APPROVED')}
              >
                {actionLoading ? 'Approving...' : 'Confirm Approve Return'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeAction === 'reject_return' && (
        <div className="admin-modal-overlay" style={{ zIndex: 3000 }} onClick={() => setActiveAction(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>REJECT RETURN REQUEST</h2>
              <button className="admin-modal-close" onClick={() => setActiveAction(null)} disabled={actionLoading}>
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#333', marginBottom: '16px' }}>
              Are you sure you wish to reject this return request?
            </p>

            <div className="admin-input-group" style={{ marginBottom: '20px' }}>
              <label>ADMIN NOTES / REASON FOR REJECTION (OPTIONAL)</label>
              <textarea
                rows={3}
                placeholder="Provide notes or explanation for the customer/record..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                disabled={actionLoading}
              />
            </div>

            <div className="admin-modal-actions" style={{ justifyContent: 'flex-end', gap: '12px' }}>
              <button className="admin-btn-secondary" onClick={() => setActiveAction(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button
                className="admin-submit-btn"
                style={{ backgroundColor: '#C65D3B', borderColor: '#C65D3B' }}
                disabled={actionLoading}
                onClick={() => handleProcessReturn('RETURN_REJECTED')}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Reject Return'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeAction === 'refund' && (
        <div className="admin-modal-overlay" style={{ zIndex: 3000 }} onClick={() => setActiveAction(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>PROCESS RAZORPAY REFUND</h2>
              <button className="admin-modal-close" onClick={() => setActiveAction(null)} disabled={actionLoading}>
                ✕
              </button>
            </div>

            <div className="admin-variants-section" style={{ marginBottom: '20px' }}>
              <div className="info-key-val">
                <span>Order Reference:</span>
                <strong>#{orderId.slice(-8).toUpperCase()}</strong>
              </div>
              <div className="info-key-val">
                <span>Customer:</span>
                <strong>{order?.user?.name} ({order?.user?.email})</strong>
              </div>
              <div className="info-key-val">
                <span>Refund Context:</span>
                <span>{order?.orderStatus === 'CANCELLED' ? 'Order Cancellation Refund' : 'Return Approved Refund'}</span>
              </div>
              <div className="info-key-val">
                <span>Amount to be Refunded:</span>
                <strong style={{ fontSize: '1.2rem', color: '#16a34a' }}>&#8377;{order?.totalAmount}</strong>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#666', marginBottom: '20px' }}>
              The refund amount is strictly bound to the order total (&#8377;{order?.totalAmount}) returned by the server and will be issued automatically via Razorpay gateway.
            </p>

            <div className="admin-modal-actions" style={{ justifyContent: 'flex-end', gap: '12px' }}>
              <button className="admin-btn-secondary" onClick={() => setActiveAction(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button
                className="admin-submit-btn"
                disabled={actionLoading}
                onClick={handleProcessRefund}
              >
                {actionLoading ? 'Processing Refund...' : 'Confirm & Execute Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailModal;

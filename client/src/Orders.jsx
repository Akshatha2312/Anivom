import { useState, useEffect } from 'react'
import './Orders.css'
import { API_BASE_URL } from './config'

function Orders({
  user,
  initialOrderId = null,
  onBackToAccount,
  onBackToCatalog,
  onOpenStudio,
  onLoginRedirect,
}) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedOrderLoading, setSelectedOrderLoading] = useState(false)
  const [selectedOrderError, setSelectedOrderError] = useState(null)

  const getCleanOrderId = (val) => {
    if (!val) return null
    if (typeof val === 'string') return val
    if (typeof val === 'object' && val._id && typeof val._id === 'string') return val._id
    return null
  }

  const fetchOrders = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        const fetchedOrders = data.data.orders || []
        setOrders(fetchedOrders)

        const targetId = getCleanOrderId(initialOrderId)
        if (targetId) {
          const matched = fetchedOrders.find((o) => o._id === targetId)
          if (matched) {
            setSelectedOrder(matched)
          } else {
            fetchSingleOrder(targetId)
          }
        }
      } else {
        const data = await res.json()
        setError(data.message || "WE COULDN'T LOAD YOUR ORDERS.")
      }
    } catch (err) {
      setError("WE COULDN'T LOAD YOUR ORDERS.")
    } finally {
      setLoading(false)
    }
  }

  const fetchSingleOrder = async (rawId) => {
    const cleanId = getCleanOrderId(rawId)
    if (!cleanId) return
    setSelectedOrderLoading(true)
    setSelectedOrderError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/${cleanId}`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setSelectedOrder(data.data.order)
      } else {
        const data = await res.json()
        setSelectedOrderError(data.message || 'WE COULDN\'T LOAD THIS ORDER.')
      }
    } catch (err) {
      setSelectedOrderError('WE COULDN\'T LOAD THIS ORDER.')
    } finally {
      setSelectedOrderLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase()
  }

  const getTimelineSteps = () => [
    { key: 'PLACED', label: '01 PLACED' },
    { key: 'CONFIRMED', label: '02 CONFIRMED' },
    { key: 'PROCESSING', label: '03 PROCESSING' },
    { key: 'SHIPPED', label: '04 SHIPPED' },
    { key: 'DELIVERED', label: '05 DELIVERED' },
  ]

  const getActiveStepIndex = (status) => {
    const steps = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
    return steps.indexOf(status)
  }

  if (!user) {
    return (
      <div className="anivom-orders-container">
        <div className="anivom-orders-empty-box">
          <span className="anivom-orders-symbol">✦</span>
          <h2 className="anivom-orders-empty-head">YOUR ORDERS ARE WAITING.</h2>
          <p className="anivom-orders-empty-sub">
            Sign in to view your orders and track every ANIVOM piece.
          </p>
          <div className="anivom-orders-empty-actions">
            <button className="anivom-btn-orders-primary" onClick={onLoginRedirect}>
              Sign In to ANIVOM
            </button>
            <button className="anivom-btn-orders-secondary" onClick={onBackToCatalog}>
              Explore Catalog
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="anivom-orders-container">
        <div className="anivom-orders-state-box">
          <div className="anivom-orders-spinner">✦</div>
          <p className="anivom-orders-state-text">LOADING YOUR ORDERS...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="anivom-orders-container">
        <div className="anivom-orders-state-box">
          <h2 className="anivom-orders-error-head">{error}</h2>
          <p className="anivom-orders-state-sub">
            Please check your network connection and try again.
          </p>
          <button className="anivom-btn-orders-primary" onClick={fetchOrders}>
            Retry Loading Orders
          </button>
        </div>
      </div>
    )
  }

  if (selectedOrderError) {
    return (
      <div className="anivom-orders-container">
        <div className="anivom-orders-state-box">
          <h2 className="anivom-orders-error-head">{selectedOrderError}</h2>
          <button className="anivom-btn-orders-secondary" onClick={() => setSelectedOrder(null)}>
            &larr; Back to Orders List
          </button>
        </div>
      </div>
    )
  }

  if (selectedOrderLoading) {
    return (
      <div className="anivom-orders-container">
        <div className="anivom-orders-state-box">
          <div className="anivom-orders-spinner">✦</div>
          <p className="anivom-orders-state-text">LOADING ORDER DETAILS...</p>
        </div>
      </div>
    )
  }

  if (selectedOrder) {
    const isCancelledOrFailed =
      selectedOrder.orderStatus === 'CANCELLED' ||
      selectedOrder.orderStatus === 'FAILED' ||
      selectedOrder.paymentStatus === 'FAILED'

    const activeIndex = getActiveStepIndex(selectedOrder.orderStatus)
    const timelineSteps = getTimelineSteps()

    return (
      <div className="anivom-orders-container">
        <div className="anivom-orders-header">
          <div>
            <button
              className="anivom-orders-back-link"
              onClick={() => setSelectedOrder(null)}
            >
              &larr; BACK TO MY ORDERS
            </button>
            <h1 className="anivom-orders-title">
              ORDER #{selectedOrder._id}
            </h1>
            <p className="anivom-orders-subtitle">
              Placed on {formatDate(selectedOrder.createdAt)}
            </p>
          </div>

          <div className="anivom-orders-header-badges">
            <span className={`anivom-status-badge status-${selectedOrder.orderStatus.toLowerCase()}`}>
              {selectedOrder.orderStatus}
            </span>
            <span className={`anivom-status-badge payment-${selectedOrder.paymentStatus.toLowerCase()}`}>
              PAYMENT: {selectedOrder.paymentStatus}
            </span>
          </div>
        </div>

        <div className="anivom-orders-section">
          <h2 className="anivom-orders-section-title">01. ORDER TRACKING</h2>

          {isCancelledOrFailed ? (
            <div className="anivom-orders-cancelled-banner">
              <span className="anivom-cancelled-icon">⚠️</span>
              <div>
                <h3 className="anivom-cancelled-head">
                  {selectedOrder.orderStatus === 'CANCELLED'
                    ? 'ORDER CANCELLED'
                    : 'PAYMENT / ORDER FAILED'}
                </h3>
                <p className="anivom-cancelled-desc">
                  {selectedOrder.orderStatus === 'CANCELLED'
                    ? 'This order has been cancelled and is no longer being processed.'
                    : 'Payment verification failed or was declined. Please try placing your order again.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="anivom-timeline-container">
              <div className="anivom-timeline-track">
                {timelineSteps.map((step, idx) => {
                  const isCompleted = activeIndex >= 0 && idx < activeIndex
                  const isCurrent = idx === activeIndex
                  const isPending = activeIndex < 0 || idx > activeIndex

                  return (
                    <div
                      key={step.key}
                      className={`anivom-timeline-step ${
                        isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'
                      }`}
                    >
                      <div className="anivom-timeline-node">
                        {isCompleted ? '✓' : isCurrent ? '✦' : ''}
                      </div>
                      <span className="anivom-timeline-label">{step.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="anivom-orders-detail-grid">
          <div className="anivom-orders-main-col">
            <div className="anivom-orders-section">
              <h2 className="anivom-orders-section-title">02. GARMENTS & CREATIONS</h2>
              <div className="anivom-orders-item-list">
                {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="anivom-orders-item-card">
                    <div className="anivom-orders-item-info">
                      <div className="anivom-orders-item-top">
                        <h3 className="anivom-orders-item-name">{item.name}</h3>
                        {item.customized && (
                          <span className="anivom-customized-tag">CUSTOMIZED</span>
                        )}
                      </div>

                      <div className="anivom-orders-item-meta">
                        <span>SIZE: <strong>{item.size}</strong></span>
                        <span className="anivom-meta-divider">|</span>
                        <span>COLOUR: <strong>{item.colour}</strong></span>
                        <span className="anivom-meta-divider">|</span>
                        <span>QTY: <strong>{item.quantity}</strong></span>
                      </div>

                      {item.customized && item.customizationSnapshot && (
                        <div className="anivom-customization-summary-box">
                          <h4 className="anivom-custom-summary-head">DESIGN SPECIFICATIONS</h4>
                          {item.customizationSnapshot.layers && item.customizationSnapshot.layers.length > 0 ? (
                            <ul className="anivom-custom-layer-list">
                              {item.customizationSnapshot.layers.map((layer, lIdx) => (
                                <li key={lIdx} className="anivom-custom-layer-item">
                                  {layer.type === 'text' && layer.text && (
                                    <span>
                                      <strong>Text:</strong> "{layer.text.content}" ({layer.text.fontFamily || 'Standard Font'}, Color: {layer.text.color})
                                    </span>
                                  )}
                                  {layer.type === 'predefined_design' && layer.design && (
                                    <span>
                                      <strong>Graphic:</strong> Predefined Design #{layer.design.designId}
                                    </span>
                                  )}
                                  {layer.type === 'uploaded_image' && (
                                    <span>
                                      <strong>Graphic:</strong> Custom Uploaded Artwork
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                              Customized garment with bespoke Studio layer configuration.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="anivom-orders-item-price-box">
                      <div className="anivom-item-unit-price">
                        &#8377;{item.unitPrice} each
                      </div>
                      <div className="anivom-item-subtotal">
                        &#8377;{item.subtotal}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="anivom-orders-side-col">
            <div className="anivom-orders-section">
              <h2 className="anivom-orders-section-title">03. DELIVERY SNAPSHOT</h2>
              {selectedOrder.shippingAddress ? (
                <div className="anivom-shipping-snapshot-card">
                  <div className="anivom-snapshot-name">
                    {selectedOrder.shippingAddress.fullName}
                  </div>
                  <div className="anivom-snapshot-line">
                    {selectedOrder.shippingAddress.phone}
                  </div>
                  <div className="anivom-snapshot-line">
                    {selectedOrder.shippingAddress.addressLine1}
                  </div>
                  {selectedOrder.shippingAddress.addressLine2 && (
                    <div className="anivom-snapshot-line">
                      {selectedOrder.shippingAddress.addressLine2}
                    </div>
                  )}
                  <div className="anivom-snapshot-line">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}
                  </div>
                  <div className="anivom-snapshot-line">
                    {selectedOrder.shippingAddress.country}
                  </div>
                </div>
              ) : (
                <p className="anivom-orders-state-sub">Address details unavailable.</p>
              )}
            </div>

            <div className="anivom-orders-section">
              <h2 className="anivom-orders-section-title">04. FINANCIAL SUMMARY</h2>
              <div className="anivom-financial-card">
                <div className="anivom-fin-line">
                  <span>Subtotal</span>
                  <span>&#8377;{selectedOrder.subtotal}</span>
                </div>
                <div className="anivom-fin-line">
                  <span>Shipping</span>
                  <span className="anivom-complimentary-tag">COMPLIMENTARY</span>
                </div>
                <div className="anivom-fin-line total">
                  <span>Total Paid</span>
                  <span>&#8377;{selectedOrder.totalAmount}</span>
                </div>

                {selectedOrder.razorpayOrderId && (
                  <div className="anivom-razorpay-ref">
                    Razorpay Ref: {selectedOrder.razorpayOrderId}
                  </div>
                )}
                {selectedOrder.razorpayPaymentId && (
                  <div className="anivom-razorpay-ref">
                    Payment Ref: {selectedOrder.razorpayPaymentId}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="anivom-orders-container">
        <div className="anivom-orders-header">
          <div>
            <h1 className="anivom-orders-title">MY ORDERS</h1>
            <p className="anivom-orders-subtitle">
              Every piece of your ANIVOM journey, in one place.
            </p>
          </div>
          <div className="anivom-orders-header-actions">
            {onBackToAccount && (
              <button className="anivom-btn-orders-secondary" onClick={onBackToAccount}>
                &larr; Back to Account
              </button>
            )}
            <button className="anivom-btn-orders-primary" onClick={onBackToCatalog}>
              Explore Catalog
            </button>
          </div>
        </div>

        <div className="anivom-orders-empty-box">
          <span className="anivom-orders-symbol">✦</span>
          <h2 className="anivom-orders-empty-head">NO ORDERS YET.</h2>
          <p className="anivom-orders-empty-sub">
            Your next ANIVOM piece is waiting.
          </p>
          <div className="anivom-orders-empty-actions">
            <button className="anivom-btn-orders-primary" onClick={onBackToCatalog}>
              Explore Collection
            </button>
            {onOpenStudio && (
              <button className="anivom-btn-orders-secondary" onClick={onOpenStudio}>
                Create Your Design
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="anivom-orders-container">
      <div className="anivom-orders-header">
        <div>
          <h1 className="anivom-orders-title">MY ORDERS</h1>
          <p className="anivom-orders-subtitle">
            Every piece of your ANIVOM journey, in one place.
          </p>
        </div>
        <div className="anivom-orders-header-actions">
          {onBackToAccount && (
            <button className="anivom-btn-orders-secondary" onClick={onBackToAccount}>
              &larr; Back to Account
            </button>
          )}
          <button className="anivom-btn-orders-primary" onClick={onBackToCatalog}>
            Back to Catalog
          </button>
        </div>
      </div>

      <div className="anivom-orders-list">
        {orders.map((order) => {
          const itemCount = order.items ? order.items.reduce((acc, i) => acc + i.quantity, 0) : 0
          const hasCustomizedItem = order.items && order.items.some((i) => i.customized)

          return (
            <div key={order._id} className="anivom-order-card">
              <div className="anivom-order-card-header">
                <div>
                  <div className="anivom-order-ref">ORDER #{order._id}</div>
                  <div className="anivom-order-date">{formatDate(order.createdAt)}</div>
                </div>

                <div className="anivom-order-badges">
                  <span className={`anivom-status-badge status-${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                  <span className={`anivom-status-badge payment-${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="anivom-order-card-body">
                <div className="anivom-order-items-preview">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="anivom-order-preview-chip">
                      <span className="anivom-preview-name">{item.name}</span>
                      <span className="anivom-preview-spec">({item.size} / {item.colour}) × {item.quantity}</span>
                      {item.customized && (
                        <span className="anivom-chip-custom-badge">✦ CUSTOM</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="anivom-order-card-summary">
                  <div className="anivom-card-item-count">{itemCount} Item{itemCount === 1 ? '' : 's'}</div>
                  {hasCustomizedItem && (
                    <div className="anivom-card-custom-indicator">Contains Bespoke Creation</div>
                  )}
                  <div className="anivom-card-total">&#8377;{order.totalAmount}</div>
                </div>
              </div>

              <div className="anivom-order-card-footer">
                <button
                  className="anivom-btn-track-order"
                  onClick={() => setSelectedOrder(order)}
                >
                  Track & Order Details &rarr;
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Orders

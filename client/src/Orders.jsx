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

  const [activeModalOrder, setActiveModalOrder] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState(null)

  const [cancellationReason, setCancellationReason] = useState('')

  const [returnReason, setReturnReason] = useState('Size mismatch / does not fit')
  const [returnDetails, setReturnDetails] = useState('')
  const [isDefectiveOrDamaged, setIsDefectiveOrDamaged] = useState(false)

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
        } else if (selectedOrder) {
          const updatedSelected = fetchedOrders.find((o) => o._id === selectedOrder._id)
          if (updatedSelected) {
            setSelectedOrder(updatedSelected)
          }
        }
      } else {
        const data = await res.json()
        setError(data.message || "We couldn't load your orders.")
      }
    } catch (err) {
      setError("We couldn't load your orders.")
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
        setSelectedOrderError(data.message || "We couldn't load this order.")
      }
    } catch {
      setSelectedOrderError("We couldn't load this order.")
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

  const isOrderWithinReturnWindow = (order) => {
    if (!order || order.orderStatus !== 'DELIVERED') return false
    const deliveryTime = order.deliveredAt
    if (!deliveryTime) return true
    const diffDays = (new Date() - new Date(deliveryTime)) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }

  const openCancelModal = (e, order) => {
    e.stopPropagation()
    setActiveModalOrder(order)
    setModalType('cancel')
    setCancellationReason('')
    setActionError(null)
    setActionSuccess(null)
  }

  const openReturnModal = (e, order) => {
    e.stopPropagation()
    const hasCustomized = order.items && order.items.some((item) => item.customized)
    setActiveModalOrder(order)
    setModalType('return')
    setReturnReason(hasCustomized ? 'Defective garment delivered' : 'Size mismatch / does not fit')
    setReturnDetails('')
    setIsDefectiveOrDamaged(hasCustomized)
    setActionError(null)
    setActionSuccess(null)
  }

  const closeModal = () => {
    if (actionLoading) return
    setActiveModalOrder(null)
    setModalType(null)
    setActionError(null)
    setActionSuccess(null)
  }

  const handleCancelSubmit = async (e) => {
    e.preventDefault()
    if (!activeModalOrder || actionLoading) return

    setActionLoading(true)
    setActionError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/${activeModalOrder._id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          cancellationReason: cancellationReason.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setActionSuccess('Order cancelled successfully.')
        await fetchOrders()
        if (selectedOrder && selectedOrder._id === activeModalOrder._id) {
          fetchSingleOrder(activeModalOrder._id)
        }
        setTimeout(() => {
          closeModal()
        }, 1200)
      } else {
        setActionError(data.message || 'Unable to cancel order at this time.')
      }
    } catch {
      setActionError('Network error while cancelling order. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReturnSubmit = async (e) => {
    e.preventDefault()
    if (!activeModalOrder || actionLoading) return

    const hasCustomized = activeModalOrder.items && activeModalOrder.items.some((i) => i.customized)
    if (hasCustomized && !isDefectiveOrDamaged) {
      setActionError('Customized ANIVOM Studio garments can be returned only when defective or damaged.')
      return
    }

    if (isDefectiveOrDamaged && !returnDetails.trim()) {
      setActionError('Please provide return details explaining the defect or damage.')
      return
    }

    setActionLoading(true)
    setActionError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/${activeModalOrder._id}/return`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          returnReason: returnReason.trim() || 'Item return requested',
          returnDetails: returnDetails.trim() || undefined,
          isDefectiveOrDamaged: isDefectiveOrDamaged,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setActionSuccess('Return requested successfully. ANIVOM Support will review your request.')
        await fetchOrders()
        if (selectedOrder && selectedOrder._id === activeModalOrder._id) {
          fetchSingleOrder(activeModalOrder._id)
        }
        setTimeout(() => {
          closeModal()
        }, 1500)
      } else {
        setActionError(data.message || 'Unable to submit return request at this time.')
      }
    } catch {
      setActionError('Network error while submitting return request. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const renderRefundStatusBadge = (refundStatus) => {
    if (!refundStatus || refundStatus === 'NONE') return null
    if (refundStatus === 'PENDING') {
      return <span className="anivom-status-badge refund-pending">Refund processing</span>
    }
    if (refundStatus === 'REFUNDED') {
      return <span className="anivom-status-badge refund-completed">Refund completed</span>
    }
    if (refundStatus === 'FAILED') {
      return <span className="anivom-status-badge refund-failed">Refund requires support</span>
    }
    return null
  }

  const renderRefundBannerMessage = (order) => {
    if (order.orderStatus !== 'CANCELLED' && order.refundStatus === 'NONE') return null

    if (order.refundStatus === 'PENDING') {
      return (
        <div className="anivom-refund-info-box info-pending">
          Your order was cancelled and your refund is being processed.
        </div>
      )
    }
    if (order.refundStatus === 'REFUNDED') {
      return (
        <div className="anivom-refund-info-box info-completed">
          ✓ Refund completed.
        </div>
      )
    }
    if (order.refundStatus === 'FAILED') {
      return (
        <div className="anivom-refund-info-box info-failed">
          ⚠️ Your order was cancelled, but the refund could not be completed automatically. Please contact support.
        </div>
      )
    }
    return null
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
    if (status === 'RETURN_REQUESTED' || status === 'RETURN_APPROVED' || status === 'RETURN_REJECTED') {
      return 4
    }
    return steps.indexOf(status)
  }

  if (!user) {
    return (
      <div className="anivom-orders-container">
        <div className="anivom-orders-empty-box">
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

    const canCancel = ['PLACED', 'CONFIRMED', 'PROCESSING'].includes(selectedOrder.orderStatus)
    const canReturn = selectedOrder.orderStatus === 'DELIVERED' && isOrderWithinReturnWindow(selectedOrder)
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
              ORDER DETAIL
            </h1>
            <p className="anivom-orders-subtitle">
              Placed on {formatDate(selectedOrder.createdAt)}
            </p>
          </div>

          <div className="anivom-orders-header-badges">
            <span className={`anivom-status-badge status-${selectedOrder.orderStatus.toLowerCase()}`}>
              {selectedOrder.orderStatus === 'RETURN_REQUESTED'
                ? 'RETURN REQUESTED'
                : selectedOrder.orderStatus === 'RETURN_APPROVED'
                ? 'RETURN APPROVED'
                : selectedOrder.orderStatus === 'RETURN_REJECTED'
                ? 'RETURN REJECTED'
                : selectedOrder.orderStatus}
            </span>
            <span className={`anivom-status-badge payment-${selectedOrder.paymentStatus.toLowerCase()}`}>
              PAYMENT: {selectedOrder.paymentStatus}
            </span>
            {renderRefundStatusBadge(selectedOrder.refundStatus)}
          </div>
        </div>

        <div className="anivom-orders-section">
          <div className="anivom-section-header-flex">
            <h2 className="anivom-orders-section-title">01. ORDER TRACKING</h2>
            <div className="anivom-action-button-group">
              {canCancel && (
                <button
                  className="anivom-btn-action-cancel"
                  onClick={(e) => openCancelModal(e, selectedOrder)}
                >
                  Cancel Order
                </button>
              )}
              {canReturn && (
                <button
                  className="anivom-btn-action-return"
                  onClick={(e) => openReturnModal(e, selectedOrder)}
                >
                  Request Return
                </button>
              )}
            </div>
          </div>

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
                {selectedOrder.cancellationReason && (
                  <p className="anivom-cancelled-reason">
                    <strong>Reason:</strong> {selectedOrder.cancellationReason}
                  </p>
                )}
                {renderRefundBannerMessage(selectedOrder)}
              </div>
            </div>
          ) : (
            <div>
              <div className="anivom-timeline-container">
                <div className="anivom-timeline-track">
                  {timelineSteps.map((step, idx) => {
                    const isCompleted = activeIndex >= 0 && idx < activeIndex
                    const isCurrent = idx === activeIndex

                    return (
                      <div
                        key={step.key}
                        className={`anivom-timeline-step ${
                          isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'
                        }`}
                      >
                        <div className="anivom-timeline-node">
                          {isCompleted ? '✓' : ''}
                        </div>
                        <span className="anivom-timeline-label">{step.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {selectedOrder.deliveredAt && (
                <div className="anivom-delivery-date-note">
                  Delivered on {formatDate(selectedOrder.deliveredAt)}
                </div>
              )}

              {selectedOrder.orderStatus === 'RETURN_REQUESTED' && (
                <div className="anivom-return-status-banner banner-requested">
                  <h4 className="anivom-return-banner-title">RETURN REQUESTED</h4>
                  <p className="anivom-return-banner-text">
                    Your return request is currently under review by ANIVOM Support. We will notify you once verified.
                  </p>
                  {selectedOrder.returnReason && (
                    <div className="anivom-return-banner-meta">
                      <strong>Reason:</strong> {selectedOrder.returnReason}
                    </div>
                  )}
                </div>
              )}

              {selectedOrder.orderStatus === 'RETURN_APPROVED' && (
                <div className="anivom-return-status-banner banner-approved">
                  <h4 className="anivom-return-banner-title">RETURN APPROVED</h4>
                  <p className="anivom-return-banner-text">
                    Your return request has been approved. Our team will coordinate the pickup or return details with you.
                  </p>
                  {renderRefundBannerMessage(selectedOrder)}
                </div>
              )}

              {selectedOrder.orderStatus === 'RETURN_REJECTED' && (
                <div className="anivom-return-status-banner banner-rejected">
                  <h4 className="anivom-return-banner-title">RETURN REQUEST REJECTED</h4>
                  <p className="anivom-return-banner-text">
                    Your return request could not be approved in accordance with ANIVOM return terms. Please contact support if you need further assistance.
                  </p>
                </div>
              )}
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
      <div className="anivom-orders-header reveal">
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
        {orders.map((order, idx) => {
          const itemCount = order.items ? order.items.reduce((acc, i) => acc + i.quantity, 0) : 0
          const hasCustomizedItem = order.items && order.items.some((i) => i.customized)
          const canCancel = ['PLACED', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus)
          const canReturn = order.orderStatus === 'DELIVERED' && isOrderWithinReturnWindow(order)

          return (
            <div
              key={order._id}
              className="anivom-order-card reveal"
              style={{ '--reveal-delay': `${(idx % 5) * 60}ms` }}
            >
              <div className="anivom-order-card-header">
                <div>
                  <div className="anivom-order-date">{formatDate(order.createdAt)}</div>
                </div>

                <div className="anivom-order-badges">
                  <span className={`anivom-status-badge status-${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus === 'RETURN_REQUESTED'
                      ? 'RETURN REQUESTED'
                      : order.orderStatus === 'RETURN_APPROVED'
                      ? 'RETURN APPROVED'
                      : order.orderStatus === 'RETURN_REJECTED'
                      ? 'RETURN REJECTED'
                      : order.orderStatus}
                  </span>
                  <span className={`anivom-status-badge payment-${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                  {renderRefundStatusBadge(order.refundStatus)}
                </div>
              </div>

              <div className="anivom-order-card-body">
                <div className="anivom-order-items-preview">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="anivom-order-preview-chip">
                      <span className="anivom-preview-name">{item.name}</span>
                      <span className="anivom-preview-spec">({item.size} / {item.colour}) × {item.quantity}</span>
                      {item.customized && (
                        <span className="anivom-chip-custom-badge">CUSTOM</span>
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

              {order.deliveredAt && (
                <div className="anivom-card-delivered-note">
                  Delivered on {formatDate(order.deliveredAt)}
                </div>
              )}

              {renderRefundBannerMessage(order)}

              <div className="anivom-order-card-footer">
                <div className="anivom-card-footer-actions">
                  {canCancel && (
                    <button
                      className="anivom-btn-action-cancel"
                      onClick={(e) => openCancelModal(e, order)}
                    >
                      Cancel Order
                    </button>
                  )}
                  {canReturn && (
                    <button
                      className="anivom-btn-action-return"
                      onClick={(e) => openReturnModal(e, order)}
                    >
                      Request Return
                    </button>
                  )}
                  <button
                    className="anivom-btn-track-order"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Track & Order Details &rarr;
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {activeModalOrder && modalType === 'cancel' && (
        <div className="anivom-modal-overlay" onClick={closeModal}>
          <div className="anivom-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="anivom-modal-close" onClick={closeModal} disabled={actionLoading}>
              &times;
            </button>
            <h3 className="anivom-modal-title">CANCEL ORDER</h3>
            <p className="anivom-modal-sub">
              Are you sure you wish to cancel this order? Once cancelled, this action cannot be reversed.
            </p>

            {actionError && (
              <div className="anivom-modal-error">{actionError}</div>
            )}

            {actionSuccess && (
              <div className="anivom-modal-success">{actionSuccess}</div>
            )}

            <form onSubmit={handleCancelSubmit}>
              <div className="anivom-form-group">
                <label className="anivom-form-label">
                  CANCELLATION REASON (OPTIONAL)
                </label>
                <textarea
                  className="anivom-form-textarea"
                  rows={3}
                  placeholder="Please let us know why you are cancelling..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  disabled={actionLoading}
                />
              </div>

              <div className="anivom-modal-footer">
                <button
                  type="button"
                  className="anivom-btn-orders-secondary"
                  onClick={closeModal}
                  disabled={actionLoading}
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  className="anivom-btn-orders-primary danger"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Cancelling Order...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModalOrder && modalType === 'return' && (
        <div className="anivom-modal-overlay" onClick={closeModal}>
          <div className="anivom-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="anivom-modal-close" onClick={closeModal} disabled={actionLoading}>
              &times;
            </button>
            <h3 className="anivom-modal-title">REQUEST RETURN</h3>
            <p className="anivom-modal-sub">
              Please submit your return request details below. ANIVOM Support will review your request.
            </p>

            {activeModalOrder.items && activeModalOrder.items.some((i) => i.customized) ? (
              <div className="anivom-modal-notice customized">
                <strong>ANIVOM Studio Notice:</strong> Customized items can be returned only when delivered defective or damaged.
              </div>
            ) : null}

            {actionError && (
              <div className="anivom-modal-error">{actionError}</div>
            )}

            {actionSuccess && (
              <div className="anivom-modal-success">{actionSuccess}</div>
            )}

            <form onSubmit={handleReturnSubmit}>
              <div className="anivom-form-group">
                <label className="anivom-form-label">RETURN REASON</label>
                <select
                  className="anivom-form-select"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  disabled={actionLoading}
                >
                  <option value="Size mismatch / does not fit">Size mismatch / does not fit</option>
                  <option value="Defective or damaged item delivered">Defective or damaged item delivered</option>
                  <option value="Garment color or style not as expected">Garment color or style not as expected</option>
                  <option value="Received incorrect garment">Received incorrect garment</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div className="anivom-form-group">
                <label className="anivom-form-label">RETURN DETAILS</label>
                <textarea
                  className="anivom-form-textarea"
                  rows={4}
                  placeholder="Provide specific details about the issue or defect..."
                  value={returnDetails}
                  onChange={(e) => setReturnDetails(e.target.value)}
                  disabled={actionLoading}
                />
              </div>

              <div className="anivom-form-group checkbox-group">
                <label className="anivom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isDefectiveOrDamaged}
                    onChange={(e) => setIsDefectiveOrDamaged(e.target.checked)}
                    disabled={actionLoading || (activeModalOrder.items && activeModalOrder.items.some((i) => i.customized))}
                  />
                  <span>Garment is defective or damaged</span>
                </label>
              </div>

              <div className="anivom-modal-footer">
                <button
                  type="button"
                  className="anivom-btn-orders-secondary"
                  onClick={closeModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="anivom-btn-orders-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Submitting Request...' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders

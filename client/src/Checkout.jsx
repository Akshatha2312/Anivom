import { useState, useEffect } from 'react'
import './Checkout.css'
import { API_BASE_URL } from './config'

function Checkout({ user, onReturnToCart, onContinueShopping, onLoginRedirect, onNavigateToOrders }) {
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState('IDLE')
  const [error, setError] = useState(null)
  const [addressMsg, setAddressMsg] = useState(null)
  const [completedOrder, setCompletedOrder] = useState(null)

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code.')
      return
    }
    setValidatingCoupon(true)
    setCouponError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/coupons/validate?code=${encodeURIComponent(couponInput.trim())}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setAppliedCoupon(data.data)
        setCouponError(null)
      } else {
        setAppliedCoupon(null)
        setCouponError(data.message || 'Invalid coupon code.')
      }
    } catch (err) {
      setCouponError('Error validating coupon.')
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError(null)
  }

  const [fullName, setFullName] = useState(user ? user.name || '' : '')
  const [phone, setPhone] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country] = useState('India')
  const [label, setLabel] = useState('Home')
  const [isDefault, setIsDefault] = useState(false)

  const fetchAddresses = async () => {
    if (!user) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/addresses`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        const list = data.data.addresses || []
        setAddresses(list)
        if (list.length > 0) {
          const defaultAddr = list.find((a) => a.isDefault)
          setSelectedAddressId(defaultAddr ? defaultAddr._id : list[0]._id)
        }
      }
    } catch (err) {
      console.error('Error loading addresses', err)
    }
  }

  const fetchCheckoutSummary = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart/checkout-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const data = await res.json()
      if (res.ok) {
        setSummary(data.data.summary)
      } else {
        setError(data.message || 'Unable to generate checkout summary.')
      }
    } catch (err) {
      setError('Network error connecting to backend checkout validation server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
    fetchCheckoutSummary()
  }, [user])

  const handleCreateAddress = async (e) => {
    e.preventDefault()
    setAddressMsg(null)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country,
          label,
          isDefault,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setAddressMsg('New delivery address saved successfully!')
        setShowAddForm(false)
        await fetchAddresses()
        if (data.data && data.data.address) {
          setSelectedAddressId(data.data.address._id)
        }
      } else {
        setError(data.message || 'Failed to save address.')
      }
    } catch (err) {
      setError('Network error saving address.')
    }
  }

  const handleSetDefaultAddress = async (addressId, e) => {
    e.stopPropagation()
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${addressId}/default`, {
        method: 'PATCH',
        credentials: 'include',
      })
      if (res.ok) {
        await fetchAddresses()
      }
    } catch (err) {
      console.error('Failed setting default address', err)
    }
  }

  const handleDeleteAddress = async (addressId, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this delivery address?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        await fetchAddresses()
      }
    } catch (err) {
      console.error('Failed deleting address', err)
    }
  }

  const handleProceedToPayment = async () => {
    if (!selectedAddressId) {
      setError('Please select or create a delivery address before proceeding.')
      return
    }

    setPaymentStatus('PREPARING')
    setError(null)

    try {
      const summaryRes = await fetch(`${API_BASE_URL}/api/v1/cart/checkout-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const summaryData = await summaryRes.json()
      if (!summaryRes.ok) {
        setError(summaryData.message || 'Checkout revalidation failed. Cart state changed.')
        setPaymentStatus('FAILED')
        return
      }
      setSummary(summaryData.data.summary)

      const orderRes = await fetch(`${API_BASE_URL}/api/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          addressId: selectedAddressId,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        setError(orderData.message || 'Failed to create order on server.')
        setPaymentStatus('FAILED')
        return
      }

      const { order, razorpayOrder } = orderData.data
      setPaymentStatus('OPENING_GATEWAY')

      if (typeof window.Razorpay === 'undefined') {
        setError('Razorpay SDK failed to load. Please check network connection.')
        setPaymentStatus('FAILED')
        return
      }

      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'ANIVOM Couture',
        description: `ANIVOM Order #${order._id}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: user ? user.name : '',
          email: user ? user.email : '',
        },
        theme: {
          color: '#111111',
        },
        handler: async function (response) {
          setPaymentStatus('VERIFYING')
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/v1/orders/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                orderId: order._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyRes.json()
            if (verifyRes.ok) {
              setPaymentStatus('SUCCESS')
              setCompletedOrder(verifyData.data.order)
            } else {
              setError(verifyData.message || 'Payment signature verification failed.')
              setPaymentStatus('FAILED')
            }
          } catch (err) {
            setError('Network error during payment signature verification.')
            setPaymentStatus('FAILED')
          }
        },
        modal: {
          ondismiss: function () {
            setError('Payment process was cancelled by user.')
            setPaymentStatus('FAILED')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        setError(response.error ? response.error.description : 'Payment failed.')
        setPaymentStatus('FAILED')
      })
      rzp.open()
    } catch (err) {
      setError('Network error initializing payment.')
      setPaymentStatus('FAILED')
    }
  }

  if (!user) {
    return (
      <div className="anivom-checkout-container">
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#F7F2E8', border: '1px solid #e5e0d8' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', margin: '0 0 12px 0' }}>SIGN IN TO CHECKOUT</h2>
          <p style={{ color: '#666666', fontSize: '0.95rem', marginBottom: '28px' }}>
            Please log in with your ANIVOM customer account to complete your order.
          </p>
          <button className="anivom-btn-pay" style={{ width: 'auto', padding: '14px 36px' }} onClick={onLoginRedirect}>
            Sign In to ANIVOM
          </button>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'SUCCESS' && completedOrder) {
    return (
      <div className="anivom-checkout-container">
        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#FFFDF8', border: '1px solid #7A1F3D' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: '#111111', margin: '0 0 8px 0' }}>ORDER CONFIRMED</h2>
          <p style={{ color: '#555555', fontSize: '1rem', marginBottom: '32px' }}>
            Thank you for your order with ANIVOM. Your payment has been securely verified.
          </p>
          <div style={{ maxWidth: '520px', margin: '0 auto 32px auto', background: '#F7F2E8', padding: '24px', textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.8', border: '1px solid #e5e0d8' }}>
            <div><strong>Order Reference:</strong> #{completedOrder._id}</div>
            <div><strong>Razorpay Payment ID:</strong> {completedOrder.razorpayPaymentId}</div>
            <div><strong>Total Paid:</strong> &#8377;{completedOrder.totalAmount}</div>
            <div><strong>Payment Status:</strong> <span style={{ color: '#2e7d32', fontWeight: '700' }}>{completedOrder.paymentStatus}</span></div>
            <div><strong>Order Status:</strong> <span style={{ color: '#2e7d32', fontWeight: '700' }}>{completedOrder.orderStatus}</span></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {onNavigateToOrders && (
              <button
                className="anivom-btn-pay"
                style={{ width: 'auto', padding: '14px 32px' }}
                onClick={() => onNavigateToOrders(completedOrder._id)}
              >
                Track Your Order &rarr;
              </button>
            )}
            <button
              className="anivom-btn-return-bag"
              style={{ width: 'auto', padding: '14px 32px', border: '1px solid #111111' }}
              onClick={onContinueShopping}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="anivom-checkout-container">
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#F7F2E8', border: '1px solid #e5e0d8' }}>
          <p style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.85rem', color: '#666666' }}>
            Validating order details with ANIVOM server...
          </p>
        </div>
      </div>
    )
  }

  const items = summary && summary.items ? summary.items : []

  if (items.length === 0) {
    return (
      <div className="anivom-checkout-container">
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#F7F2E8', border: '1px solid #e5e0d8' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', margin: '0 0 12px 0' }}>YOUR BAG IS EMPTY</h2>
          <p style={{ color: '#666666', fontSize: '0.95rem', marginBottom: '28px' }}>
            Please add items to your shopping bag before proceeding to checkout.
          </p>
          <button className="anivom-btn-pay" style={{ width: 'auto', padding: '14px 36px' }} onClick={onContinueShopping}>
            Explore Catalog &rarr;
          </button>
        </div>
      </div>
    )
  }

  const isProcessing = paymentStatus !== 'IDLE' && paymentStatus !== 'FAILED'

  return (
    <div className="anivom-checkout-container">
      <header className="anivom-checkout-header">
        <div className="anivom-checkout-brand-group">
          <h1 className="anivom-checkout-brand">ANIVOM</h1>
          <span className="anivom-checkout-tagline">Wear It Your Way.</span>
        </div>
        <div className="anivom-checkout-trust-badge">
          🔒 Secure 256-Bit SSL Checkout
        </div>
      </header>

      <nav className="anivom-checkout-stepper">
        <div className="anivom-step-item active">
          <span className="anivom-step-num">01</span> DELIVERY ADDRESS
        </div>
        <div className="anivom-step-item active">
          <span className="anivom-step-num">02</span> ORDER REVIEW
        </div>
        <div className="anivom-step-item active">
          <span className="anivom-step-num">03</span> PAYMENT
        </div>
      </nav>

      {error && (
        <div style={{ background: 'rgba(211, 47, 47, 0.1)', border: '1px solid rgba(211, 47, 47, 0.3)', color: '#d32f2f', padding: '12px 18px', marginBottom: '24px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {addressMsg && (
        <div style={{ background: 'rgba(46, 125, 50, 0.1)', border: '1px solid rgba(46, 125, 50, 0.3)', color: '#2e7d32', padding: '12px 18px', marginBottom: '24px', fontSize: '0.9rem' }}>
          {addressMsg}
        </div>
      )}

      <div className="anivom-checkout-layout">
        <div>
          <div className="anivom-checkout-section">
            <div className="anivom-section-heading">
              <span>01. Delivery Address</span>
              <button className="anivom-btn-add-address" disabled={isProcessing} onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Cancel' : '+ Add Address'}
              </button>
            </div>

            {addresses.length === 0 && !showAddForm ? (
              <p style={{ color: '#666666', fontSize: '0.9rem' }}>No saved addresses found. Please add a delivery address below.</p>
            ) : (
              <div className="anivom-address-grid">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id
                  return (
                    <div
                      key={addr._id}
                      className={`anivom-address-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => !isProcessing && setSelectedAddressId(addr._id)}
                    >
                      <div className="anivom-address-card-header">
                        <span className="anivom-address-name">{addr.fullName}</span>
                        <span className="anivom-address-tag">{addr.label}</span>
                      </div>
                      <div className="anivom-address-body">
                        {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                        {addr.city}, {addr.state} - {addr.postalCode}<br />
                        {addr.country} | Phone: {addr.phone}
                      </div>
                      <div className="anivom-address-actions">
                        {!addr.isDefault && (
                          <button className="anivom-address-action-btn" disabled={isProcessing} onClick={(e) => handleSetDefaultAddress(addr._id, e)}>
                            Set as Default
                          </button>
                        )}
                        {addr.isDefault && <span style={{ color: '#2e7d32', fontWeight: '700' }}>✓ Default</span>}
                        <button className="anivom-address-action-btn" style={{ color: '#C65D3B' }} disabled={isProcessing} onClick={(e) => handleDeleteAddress(addr._id, e)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {showAddForm && (
              <form onSubmit={handleCreateAddress} className="anivom-address-form-box">
                <h4 style={{ margin: '0 0 16px 0', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.08em' }}>New Delivery Address</h4>
                <div className="anivom-form-grid">
                  <div className="anivom-form-field">
                    <label className="anivom-form-label">Full Name</label>
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="anivom-form-input" />
                  </div>
                  <div className="anivom-form-field">
                    <label className="anivom-form-label">Phone Number</label>
                    <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="anivom-form-input" />
                  </div>
                  <div className="anivom-form-field">
                    <label className="anivom-form-label">Address Line 1</label>
                    <input type="text" required value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className="anivom-form-input" />
                  </div>
                  <div className="anivom-form-field">
                    <label className="anivom-form-label">Address Line 2 (Optional)</label>
                    <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className="anivom-form-input" />
                  </div>
                  <div className="anivom-form-field">
                    <label className="anivom-form-label">City</label>
                    <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="anivom-form-input" />
                  </div>
                  <div className="anivom-form-field">
                    <label className="anivom-form-label">State</label>
                    <input type="text" required value={state} onChange={(e) => setState(e.target.value)} className="anivom-form-input" />
                  </div>
                  <div className="anivom-form-field">
                    <label className="anivom-form-label">Postal Code</label>
                    <input type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="anivom-form-input" />
                  </div>
                  <div className="anivom-form-field">
                    <label className="anivom-form-label">Address Type</label>
                    <select value={label} onChange={(e) => setLabel(e.target.value)} className="anivom-form-input">
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '14px' }}>
                  <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#555555' }}>
                    <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
                    Make this my default delivery address
                  </label>
                </div>
                <button type="submit" className="anivom-btn-save-address">
                  Save Address & Select
                </button>
              </form>
            )}
          </div>

          <div className="anivom-checkout-section">
            <div className="anivom-section-heading">
              <span>02. Order Review ({summary.totalItemCount} {summary.totalItemCount === 1 ? 'Item' : 'Items'})</span>
            </div>

            <div>
              {items.map((item) => {
                const product = item.product || {}
                const image = product.images && product.images.length > 0 ? product.images[0] : null
                return (
                  <div key={item._id} className="anivom-checkout-item-mini">
                    {image ? (
                      <img src={image} alt={product.name} className="anivom-checkout-item-img" />
                    ) : (
                      <div className="anivom-checkout-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#888' }}>ANIVOM</div>
                    )}
                    <div className="anivom-checkout-item-details">
                      <h4 className="anivom-checkout-item-name">{product.name}</h4>
                      <div className="anivom-checkout-item-meta">
                        Size: <strong>{item.size}</strong> | Colour: <strong>{item.colour}</strong> | Qty: <strong>{item.quantity}</strong>
                      </div>
                      {item.customized && (
                        <div style={{ fontSize: '0.78rem', color: '#7A1F3D', fontWeight: '700', marginTop: '4px' }}>
                          ✨ Customized Design Attached
                        </div>
                      )}
                    </div>
                    <div className="anivom-checkout-item-price">
                      &#8377;{item.itemSubtotal}
                      <div style={{ fontSize: '0.75rem', color: '#888888', fontWeight: '500' }}>(&#8377;{item.unitPrice} ea)</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="anivom-checkout-summary-card">
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: '600', margin: '0 0 14px 0', paddingBottom: '10px', borderBottom: '1px solid #e5e0d8' }}>
            03. Payment Summary
          </h3>

          <div className="anivom-summary-line">
            <span>Total Items</span>
            <span>{summary.totalItemCount}</span>
          </div>

          <div className="anivom-summary-line">
            <span>Authoritative Subtotal</span>
            <span>&#8377;{summary.subtotal}</span>
          </div>

          <div className="anivom-coupon-box" style={{ margin: '14px 0', padding: '12px', background: '#F7F2E8', border: '1px solid #E0D8CC' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', color: '#111' }}>
              Promotional Coupon
            </div>
            {!appliedCoupon ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={isProcessing || validatingCoupon}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    border: '1px solid #CCC',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isProcessing || validatingCoupon || !couponInput.trim()}
                  style={{
                    padding: '8px 14px',
                    background: '#111',
                    color: '#FFFDF8',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {validatingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFDF8', padding: '8px 12px', border: '1px solid #7A1F3D' }}>
                <div>
                  <span style={{ fontWeight: '700', color: '#7A1F3D', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                    {appliedCoupon.code}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#2e7d32', marginLeft: '8px', fontWeight: '600' }}>
                    (-₹{appliedCoupon.discountAmount})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  disabled={isProcessing}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#C65D3B',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Remove
                </button>
              </div>
            )}
            {couponError && (
              <div style={{ color: '#d32f2f', fontSize: '0.78rem', marginTop: '6px' }}>
                {couponError}
              </div>
            )}
          </div>

          {appliedCoupon && (
            <div className="anivom-summary-line" style={{ color: '#2e7d32', fontWeight: '600' }}>
              <span>Coupon Discount ({appliedCoupon.code})</span>
              <span>-&#8377;{appliedCoupon.discountAmount}</span>
            </div>
          )}

          <div className="anivom-summary-line">
            <span>Standard Shipping</span>
            <span style={{ color: '#2e7d32', fontWeight: '600', fontSize: '0.85rem' }}>COMPLIMENTARY</span>
          </div>

          <div className="anivom-summary-line total">
            <span>Total Payable</span>
            <span>&#8377;{Math.max(0, summary.subtotal - (appliedCoupon ? appliedCoupon.discountAmount : 0))}</span>
          </div>

          <button className="anivom-btn-pay" disabled={isProcessing} onClick={handleProceedToPayment}>
            {paymentStatus === 'PREPARING' && 'Preparing Order...'}
            {paymentStatus === 'OPENING_GATEWAY' && 'Opening Gateway...'}
            {paymentStatus === 'VERIFYING' && 'Verifying Payment...'}
            {(paymentStatus === 'IDLE' || paymentStatus === 'FAILED') &&
              `Pay ₹${Math.max(0, summary.subtotal - (appliedCoupon ? appliedCoupon.discountAmount : 0))} Securely`}
          </button>

          <button className="anivom-btn-return-bag" disabled={isProcessing} onClick={onReturnToCart}>
            Back to Bag
          </button>

          <p className="anivom-security-note">
            Payment handled securely via Razorpay Test Mode.<br />
            256-bit encrypted checkout transaction.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Checkout

import { useState, useEffect } from 'react'
import './Checkout.css'
import { API_BASE_URL } from './config'

function Checkout({ user, onReturnToCart, onContinueShopping, onLoginRedirect }) {
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState('IDLE')
  const [error, setError] = useState(null)
  const [addressMsg, setAddressMsg] = useState(null)
  const [completedOrder, setCompletedOrder] = useState(null)

  const [fullName, setFullName] = useState(user ? user.name || '' : '')
  const [phone, setPhone] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('India')
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
        body: JSON.stringify({ addressId: selectedAddressId }),
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
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#FFFDF8', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0' }}>Sign in to Checkout</h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
            Please log in with your ANIVOM customer account to complete your purchase.
          </p>
          <button className="anivom-btn-pay" style={{ width: 'auto', padding: '12px 32px' }} onClick={onLoginRedirect}>
            Log In Now
          </button>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'SUCCESS' && completedOrder) {
    return (
      <div className="anivom-checkout-container">
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFDF8', border: '1px solid #10b981', borderRadius: '8px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#111111', margin: '0 0 8px 0' }}>ORDER CONFIRMED!</h2>
          <p style={{ color: '#4b5563', fontSize: '15px', marginBottom: '24px' }}>
            Thank you for shopping with ANIVOM. Your payment has been securely verified.
          </p>
          <div style={{ maxWidth: '500px', margin: '0 auto 24px auto', background: '#F7F2E8', padding: '16px', borderRadius: '6px', textAlign: 'left', fontSize: '13px' }}>
            <div><strong>Order Reference:</strong> #{completedOrder._id}</div>
            <div><strong>Razorpay Payment ID:</strong> {completedOrder.razorpayPaymentId}</div>
            <div><strong>Total Paid:</strong> &#8377;{completedOrder.totalAmount}</div>
            <div><strong>Payment Status:</strong> <span style={{ color: '#047857', fontWeight: '700' }}>{completedOrder.paymentStatus}</span></div>
            <div><strong>Order Status:</strong> <span style={{ color: '#047857', fontWeight: '700' }}>{completedOrder.orderStatus}</span></div>
          </div>
          <button className="anivom-btn-pay" style={{ width: 'auto', padding: '12px 32px' }} onClick={onContinueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="anivom-checkout-container">
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#FFFDF8', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#4b5563' }}>Validating order details with ANIVOM server...</p>
        </div>
      </div>
    )
  }

  const items = summary && summary.items ? summary.items : []

  if (items.length === 0) {
    return (
      <div className="anivom-checkout-container">
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#FFFDF8', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0' }}>Your bag is empty</h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
            Add items to your shopping bag before proceeding to checkout.
          </p>
          <button className="anivom-btn-pay" style={{ width: 'auto', padding: '12px 32px' }} onClick={onContinueShopping}>
            Explore Catalog &rarr;
          </button>
        </div>
      </div>
    )
  }

  const isProcessing = paymentStatus !== 'IDLE' && paymentStatus !== 'FAILED'

  return (
    <div className="anivom-checkout-container">
      <div className="anivom-checkout-header">
        <h2 className="anivom-checkout-title">Checkout</h2>
        <span className="anivom-checkout-secure-badge">&#128274; 256-Bit SSL Encryption</span>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '14px 18px', borderRadius: '6px', marginBottom: '24px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {addressMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '14px 18px', borderRadius: '6px', marginBottom: '24px', fontSize: '14px' }}>
          {addressMsg}
        </div>
      )}

      <div className="anivom-checkout-layout">
        <div>
          <div className="anivom-checkout-section">
            <div className="anivom-section-heading">
              <span>1. Delivery Address</span>
              <button className="anivom-btn-add-address" disabled={isProcessing} onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Cancel' : '+ Add Address'}
              </button>
            </div>

            {addresses.length === 0 && !showAddForm ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No saved addresses found. Please add a shipping address below.</p>
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
                        {addr.isDefault && <span style={{ color: '#047857', fontWeight: '700' }}>✓ Default Address</span>}
                        <button className="anivom-address-action-btn" style={{ color: '#ef4444' }} disabled={isProcessing} onClick={(e) => handleDeleteAddress(addr._id, e)}>
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
                <h4 style={{ margin: '0 0 16px 0', textTransform: 'uppercase', fontSize: '14px', fontWeight: '800' }}>New Delivery Address</h4>
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
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
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
              <span>2. Order Items ({summary.totalItemCount})</span>
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
                      <div className="anivom-checkout-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>No Img</div>
                    )}
                    <div className="anivom-checkout-item-details">
                      <div className="anivom-checkout-item-name">{product.name}</div>
                      <div className="anivom-checkout-item-meta">
                        Size: <strong>{item.size}</strong> | Colour: <strong>{item.colour}</strong> | Qty: <strong>{item.quantity}</strong>
                      </div>
                      {item.customized && (
                        <div style={{ fontSize: '11px', color: '#7e22ce', fontWeight: '700', marginTop: '4px' }}>
                          ✨ Customized Design Attached
                        </div>
                      )}
                    </div>
                    <div className="anivom-checkout-item-price">
                      &#8377;{item.itemSubtotal}
                      <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>(&#8377;{item.unitPrice} ea)</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="anivom-checkout-summary-card">
          <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Order Summary</h3>

          <div className="anivom-summary-line">
            <span>Items Count</span>
            <span>{summary.totalItemCount}</span>
          </div>

          <div className="anivom-summary-line">
            <span>Subtotal (Authoritative)</span>
            <span>&#8377;{summary.subtotal}</span>
          </div>

          <div className="anivom-summary-line">
            <span>Shipping Fee</span>
            <span style={{ color: '#047857', fontWeight: '700' }}>COMPLIMENTARY</span>
          </div>

          <div className="anivom-summary-line total">
            <span>Total Payable</span>
            <span>&#8377;{summary.totalAmount}</span>
          </div>

          <button className="anivom-btn-pay" disabled={isProcessing} onClick={handleProceedToPayment}>
            {paymentStatus === 'PREPARING' && 'Preparing Order...'}
            {paymentStatus === 'OPENING_GATEWAY' && 'Opening Gateway...'}
            {paymentStatus === 'VERIFYING' && 'Verifying Payment...'}
            {(paymentStatus === 'IDLE' || paymentStatus === 'FAILED') && 'Proceed to Pay 💳'}
          </button>

          <button className="anivom-btn-return-bag" disabled={isProcessing} onClick={onReturnToCart}>
            Return to Shopping Bag
          </button>
        </div>
      </div>
    </div>
  )
}

export default Checkout

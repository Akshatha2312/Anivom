import { useState, useEffect } from 'react'
import './Cart.css'
import { API_BASE_URL } from './config'

function Cart({ user, onContinueShopping, onLoginRedirect, onProceedToCheckout, onCartUpdated, onSelectProduct }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingItemId, setUpdatingItemId] = useState(null)
  const [error, setError] = useState(null)
  const [recommendations, setRecommendations] = useState([])

  const fetchCart = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setCart(data.data.cart)
      } else {
        const data = await res.json()
        setError(data.message || 'Failed to retrieve shopping cart.')
      }
    } catch (err) {
      setError('Network error while connecting to cart server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [user])

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/products?limit=4`)
        const data = await res.json()
        if (res.ok) {
          setRecommendations(data.data.products || [])
        }
      } catch (e) {
        // silent recommendation fallback
      }
    }
    fetchRecs()
  }, [])

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    setUpdatingItemId(itemId)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity }),
      })

      const data = await res.json()
      if (res.ok) {
        setCart(data.data.cart)
        if (onCartUpdated) onCartUpdated()
      } else {
        setError(data.message || 'Unable to update item quantity.')
      }
    } catch (err) {
      setError('Network error while updating item quantity.')
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleRemoveItem = async (itemId) => {
    setUpdatingItemId(itemId)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()
      if (res.ok) {
        setCart(data.data.cart)
        if (onCartUpdated) onCartUpdated()
      } else {
        setError(data.message || 'Unable to remove item from cart.')
      }
    } catch (err) {
      setError('Network error while removing item.')
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear all items from your cart?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()
      if (res.ok) {
        setCart(data.data.cart)
        if (onCartUpdated) onCartUpdated()
      } else {
        setError(data.message || 'Unable to clear cart.')
      }
    } catch (err) {
      setError('Network error while clearing cart.')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckoutClick = () => {
    if (onProceedToCheckout) {
      onProceedToCheckout()
    }
  }

  if (!user) {
    return (
      <div className="anivom-cart-container">
        <div className="anivom-empty-cart">
          <div className="anivom-empty-icon">🔒</div>
          <h3 className="anivom-empty-title">YOUR BAG REQUIRES SIGN-IN</h3>
          <p className="anivom-empty-sub">
            Log in with your ANIVOM customer account to view your saved items and complete your bespoke order.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button className="anivom-btn-checkout" style={{ width: 'auto', padding: '12px 28px' }} onClick={onLoginRedirect}>
              Sign In to ANIVOM
            </button>
            <button className="anivom-btn-continue" style={{ width: 'auto', padding: '12px 28px' }} onClick={onContinueShopping}>
              Explore Catalog
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="anivom-cart-container">
        <div className="anivom-empty-cart">
          <p style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.85rem', color: '#666666' }}>
            Retrieving your ANIVOM shopping bag...
          </p>
        </div>
      </div>
    )
  }

  const items = cart && cart.items ? cart.items : []
  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = items.reduce((acc, item) => {
    const price = item.product ? item.product.basePrice || 0 : 0
    return acc + price * item.quantity
  }, 0)

  if (items.length === 0) {
    return (
      <div className="anivom-cart-container">
        <div className="anivom-cart-header">
          <div className="anivom-cart-title-group">
            <h1 className="anivom-cart-title">YOUR BAG <span className="anivom-cart-count">(0)</span></h1>
            <p className="anivom-cart-subtitle">Everything you chose, ready when you are.</p>
          </div>
        </div>

        {error && (
          <div className="anivom-error-banner">
            <span>{error}</span>
            <button className="anivom-error-dismiss" onClick={() => setError(null)}>&#10005;</button>
          </div>
        )}

        <div className="anivom-empty-cart">
          <h2 className="anivom-empty-title">YOUR BAG IS WAITING.</h2>
          <p className="anivom-empty-sub">
            Looks like you haven't added any garments or custom Studio creations to your bag yet.
          </p>
          <button className="anivom-btn-checkout" style={{ width: 'auto', padding: '14px 36px' }} onClick={onContinueShopping}>
            Shop the Collection &rarr;
          </button>
        </div>

        {recommendations.length > 0 && (
          <section className="anivom-cart-rec-section">
            <h3 className="anivom-cart-rec-title">Users also buy!</h3>
            <div className="anivom-cart-rec-grid">
              {recommendations.map((rec) => {
                const recImg = rec.images && rec.images.length > 0 ? rec.images[0] : null
                return (
                  <div
                    key={rec._id}
                    className="anivom-rec-card"
                    onClick={() => onSelectProduct ? onSelectProduct(rec) : onContinueShopping()}
                  >
                    <div className="anivom-rec-img-wrap">
                      {recImg ? (
                        <img src={recImg} alt={rec.name} className="anivom-rec-img" />
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: '#888' }}>ANIVOM</div>
                      )}
                    </div>
                    <h4 className="anivom-rec-name">{rec.name}</h4>
                    <span className="anivom-rec-price">&#8377;{rec.basePrice}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    )
  }

  return (
    <div className="anivom-cart-container">
      <div className="anivom-cart-header">
        <div className="anivom-cart-title-group">
          <h1 className="anivom-cart-title">YOUR BAG <span className="anivom-cart-count">({totalItemCount})</span></h1>
          <p className="anivom-cart-subtitle">Everything you chose, ready when you are.</p>
        </div>
        <button className="anivom-cart-clear-btn" onClick={handleClearCart}>
          Clear Bag
        </button>
      </div>

      {error && (
        <div className="anivom-error-banner">
          <span>{error}</span>
          <button className="anivom-error-dismiss" onClick={() => setError(null)}>&#10005;</button>
        </div>
      )}

      <div className="anivom-cart-layout">
        <div className="anivom-cart-items-list">
          {items.map((item) => {
            const product = item.product || {}
            const image = product.images && product.images.length > 0 ? product.images[0] : null
            const itemPrice = product.basePrice || 0
            const itemTotal = itemPrice * item.quantity
            const isUpdating = updatingItemId === item._id

            return (
              <div key={item._id} className="anivom-cart-item-card" style={{ opacity: isUpdating ? 0.6 : 1 }}>
                <div className="anivom-cart-item-img-wrap">
                  {image ? (
                    <img src={image} alt={product.name || 'Product'} className="anivom-cart-item-img" />
                  ) : (
                    <span className="anivom-cart-item-no-img">ANIVOM</span>
                  )}
                </div>

                <div className="anivom-cart-item-details">
                  <div className="anivom-cart-item-header">
                    <h3 className="anivom-cart-item-name">{product.name || 'ANIVOM Garment'}</h3>
                    {item.customized && (
                      <span className="anivom-badge-customized">✨ Customized</span>
                    )}
                  </div>

                  <div className="anivom-cart-item-meta">
                    <span>Size: <strong className="anivom-meta-label">{item.size}</strong></span>
                    <span>Colour: <strong className="anivom-meta-label">{item.colour}</strong></span>
                  </div>

                  {item.customized && item.customization && item.customization.layers && (
                    <div className="anivom-customization-preview">
                      <div className="anivom-preview-title">Bespoke Layers ({item.customization.layers.length})</div>
                      <div className="anivom-layer-chips-group">
                        {item.customization.layers.map((layer, idx) => (
                          <span key={layer._id || idx} className="anivom-layer-chip">
                            {layer.type === 'text' && `Text: "${layer.text?.content || 'Text'}"`}
                            {layer.type === 'predefined_design' && `Design: ${layer.design?.name || layer.design?.designId || 'Vector'}`}
                            {layer.type === 'uploaded_image' && 'Uploaded Graphic'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="anivom-cart-item-price-row">
                    Unit Price: &#8377;{itemPrice}
                  </div>
                </div>

                <div className="anivom-cart-item-actions">
                  <div className="anivom-item-total">
                    &#8377;{itemTotal}
                  </div>

                  <div className="anivom-qty-control">
                    <button
                      className="anivom-qty-btn"
                      disabled={item.quantity <= 1 || isUpdating}
                      onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="anivom-qty-val">{item.quantity}</span>
                    <button
                      className="anivom-qty-btn"
                      disabled={isUpdating}
                      onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="anivom-remove-btn"
                    disabled={isUpdating}
                    onClick={() => handleRemoveItem(item._id)}
                  >
                    Remove Item
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="anivom-cart-summary-card">
          <h3 className="anivom-summary-title">Order Summary</h3>

          <div className="anivom-summary-row">
            <span>Total Items</span>
            <span>{totalItemCount}</span>
          </div>

          <div className="anivom-summary-row">
            <span>Bag Subtotal</span>
            <span>&#8377;{subtotal}</span>
          </div>

          <div className="anivom-summary-row">
            <span>Standard Shipping</span>
            <span style={{ color: '#2e7d32', fontWeight: '600', fontSize: '0.85rem' }}>COMPLIMENTARY</span>
          </div>

          <div className="anivom-summary-row total">
            <span>Total Amount</span>
            <span>&#8377;{subtotal}</span>
          </div>

          <button className="anivom-btn-checkout" onClick={handleCheckoutClick}>
            Proceed to Checkout
          </button>

          <button className="anivom-btn-continue" onClick={onContinueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>

      {recommendations.length > 0 && (
        <section className="anivom-cart-rec-section">
          <h3 className="anivom-cart-rec-title">Users also buy!</h3>
          <div className="anivom-cart-rec-grid">
            {recommendations.map((rec) => {
              const recImg = rec.images && rec.images.length > 0 ? rec.images[0] : null
              return (
                <div
                  key={rec._id}
                  className="anivom-rec-card"
                  onClick={() => onSelectProduct ? onSelectProduct(rec) : onContinueShopping()}
                >
                  <div className="anivom-rec-img-wrap">
                    {recImg ? (
                      <img src={recImg} alt={rec.name} className="anivom-rec-img" />
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: '#888' }}>ANIVOM</div>
                    )}
                  </div>
                  <h4 className="anivom-rec-name">{rec.name}</h4>
                  <span className="anivom-rec-price">&#8377;{rec.basePrice}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default Cart

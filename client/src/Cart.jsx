import { useState, useEffect } from 'react'
import './Cart.css'
import { API_BASE_URL } from './config'

function Cart({ user, onContinueShopping, onLoginRedirect, onProceedToCheckout }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingItemId, setUpdatingItemId] = useState(null)
  const [error, setError] = useState(null)

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
          <div className="anivom-empty-icon">&#128091;</div>
          <h3 className="anivom-empty-title">Sign in to view your bag</h3>
          <p className="anivom-empty-sub">
            Log in with your ANIVOM customer account to access your saved shopping cart.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="anivom-btn-checkout" style={{ width: 'auto', padding: '10px 24px' }} onClick={onLoginRedirect}>
              Log In Now
            </button>
            <button className="anivom-btn-continue" style={{ width: 'auto', padding: '10px 24px' }} onClick={onContinueShopping}>
              Browse Catalog
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
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#4b5563' }}>Loading your ANIVOM shopping bag...</p>
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
            <h2 className="anivom-cart-title">Your Shopping Bag</h2>
            <span className="anivom-cart-count">(0 ITEMS)</span>
          </div>
        </div>

        {error && (
          <div className="anivom-error-banner">
            <span>{error}</span>
            <button className="anivom-error-dismiss" onClick={() => setError(null)}>&#10005;</button>
          </div>
        )}

        <div className="anivom-empty-cart">
          <div className="anivom-empty-icon">&#128092;</div>
          <h3 className="anivom-empty-title">Your shopping bag is empty</h3>
          <p className="anivom-empty-sub">
            Discover our latest apparel collections and custom Studio designs to add items to your cart.
          </p>
          <button className="anivom-btn-checkout" style={{ width: 'auto', padding: '12px 32px' }} onClick={onContinueShopping}>
            Explore Catalog &rarr;
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="anivom-cart-container">
      <div className="anivom-cart-header">
        <div className="anivom-cart-title-group">
          <h2 className="anivom-cart-title">Your Shopping Bag</h2>
          <span className="anivom-cart-count">({totalItemCount} {totalItemCount === 1 ? 'ITEM' : 'ITEMS'})</span>
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
                    <span className="anivom-cart-item-no-img">No Image</span>
                  )}
                </div>

                <div className="anivom-cart-item-details">
                  <div>
                    <div className="anivom-cart-item-header">
                      <h4 className="anivom-cart-item-name">{product.name || 'ANIVOM Apparel'}</h4>
                      {item.customized && (
                        <span className="anivom-badge-customized">&#10024; Customized</span>
                      )}
                    </div>

                    <div className="anivom-cart-item-meta">
                      <span>Size: <strong className="anivom-meta-label">{item.size}</strong></span>
                      <span>Colour: <strong className="anivom-meta-label">{item.colour}</strong></span>
                    </div>

                    {item.customized && item.customization && item.customization.layers && (
                      <div className="anivom-customization-preview">
                        <div className="anivom-preview-title">Custom Design Layers ({item.customization.layers.length}):</div>
                        <div>
                          {item.customization.layers.map((layer, idx) => (
                            <span key={layer._id || idx} className="anivom-layer-chip">
                              {layer.type === 'text' && `Text: "${layer.text?.content || 'Text'}"`}
                              {layer.type === 'predefined_design' && `Design: ${layer.design?.designId || 'Vector'}`}
                              {layer.type === 'uploaded_image' && 'Uploaded Graphic'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

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
                    Remove
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
            <span>Estimated Shipping</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>COMPLIMENTARY</span>
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
    </div>
  )
}

export default Cart

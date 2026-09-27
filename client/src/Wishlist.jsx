import React, { useState, useEffect } from 'react'
import './Wishlist.css'
import { API_BASE_URL } from './config'
import formatINRAmount from './formatINRAmount'

const Wishlist = ({ user, onBackToCatalog, onLoginRedirect, onSelectProduct, onCartUpdated, openStudio, onWishlistToggle, onBuyNow }) => {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingId, setAddingId] = useState(null)
  const [cardMsg, setCardMsg] = useState({})
  const [selectedSizes, setSelectedSizes] = useState({})
  const [buyNowErrors, setBuyNowErrors] = useState({})

  const fetchWishlist = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/wishlist`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setWishlistItems(data.data.wishlist?.products || [])
      } else {
        const data = await res.json()
        setError(data.message || 'Unable to load your wishlist.')
      }
    } catch (err) {
      setError('Network error loading wishlist items.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [user])

  const getWishlistGarmentImage = (product, selectedColour) => {
    if (selectedColour && product?.garmentImages?.byColour) {
      const byColourObj = product.garmentImages.byColour
      const colourMapObj = byColourObj instanceof Map ? Object.fromEntries(byColourObj) : byColourObj
      const normSelected = String(selectedColour).trim().toLowerCase()
      const colourEntry = Object.entries(colourMapObj || {}).find(
        ([key]) => String(key).trim().toLowerCase() === normSelected
      )
      const colourData = colourEntry ? colourEntry[1] : colourMapObj?.[selectedColour]
      if (colourData && colourData.front) {
        return colourData.front
      }
    }
    return product?.garmentImages?.front || (product?.images && product.images.length > 0 ? product.images[0] : null)
  }

  const handleRemoveFromWishlist = async (product, e) => {
    if (e) e.stopPropagation()
    const productId = product._id
    const selectedColour = product.selectedColour || product.initialColor || ''
    if (onWishlistToggle) {
      await onWishlistToggle(productId, selectedColour)
      setWishlistItems((prev) => prev.filter((item) => {
        const itemCol = item.selectedColour || item.initialColor || ''
        return !(item._id === productId && itemCol === selectedColour)
      }))
      return
    }
    try {
      const queryParam = selectedColour ? `?colour=${encodeURIComponent(selectedColour)}` : ''
      const res = await fetch(`${API_BASE_URL}/api/v1/wishlist/${productId}${queryParam}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setWishlistItems((prev) => prev.filter((item) => {
          const itemCol = item.selectedColour || item.initialColor || ''
          return !(item._id === productId && itemCol === selectedColour)
        }))
      }
    } catch (err) {
      console.error('Failed to remove item from wishlist', err)
    }
  }

  const handleAddToCart = async (product, e) => {
    if (e) e.stopPropagation()
    if (!user) {
      if (onLoginRedirect) onLoginRedirect()
      return
    }

    const selectedColour = product.selectedColour || product.initialColor || (product.variants && product.variants.length > 0 ? product.variants[0].colour : 'Black')
    const matchingVariant = product.variants ? product.variants.find((v) => v.colour === selectedColour && v.stock > 0) || product.variants[0] : null
    const selectedSize = matchingVariant ? matchingVariant.size : 'M'

    const itemKey = `${product._id}_${selectedColour}`
    setAddingId(itemKey)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          product: product._id,
          size: selectedSize,
          colour: selectedColour,
          quantity: 1,
          customized: false,
        }),
      })

      if (res.ok) {
        setCardMsg((prev) => ({ ...prev, [itemKey]: 'Added to Bag!' }))
        if (onCartUpdated) onCartUpdated()
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to add item to bag.')
      }
    } catch (err) {
      alert('Network error adding product to bag.')
    } finally {
      setAddingId(null)
    }
  }

  const handleBuyNow = (product, selectedColour, selectedSize, itemKey, e) => {
    if (e) e.stopPropagation()
    if (!selectedColour || !selectedSize) {
      setBuyNowErrors((prev) => ({ ...prev, [itemKey]: 'Please select an available colour and size.' }))
      return
    }

    setBuyNowErrors((prev) => ({ ...prev, [itemKey]: '' }))
    if (onBuyNow) {
      onBuyNow({
        productId: product._id,
        size: selectedSize,
        colour: selectedColour,
        quantity: 1,
        customized: false,
      })
    }
  }

  const DEFAULT_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='100%' height='100%' fill='%23F7F2E8'/><text x='50%' y='48%' font-family='serif' font-size='28' fill='%237A1F3D' text-anchor='middle' letter-spacing='4'>ANIVOM</text><text x='50%' y='53%' font-family='sans-serif' font-size='14' fill='%23C6A15B' text-anchor='middle' letter-spacing='2'>COUTURE</text></svg>"

  if (!user) {
    return (
      <div className="anivom-wishlist-container">
        <div className="anivom-wishlist-empty-box reveal">
          <h2 className="anivom-wishlist-empty-head">SIGN IN TO VIEW YOUR WISHLIST</h2>
          <p className="anivom-wishlist-empty-sub">
            Please log in with your ANIVOM customer account to view your saved products.
          </p>
          <div className="anivom-wishlist-empty-actions">
            <button className="anivom-btn-wishlist-primary" onClick={onLoginRedirect}>
              Sign In to ANIVOM
            </button>
            <button className="anivom-btn-wishlist-secondary" onClick={onBackToCatalog}>
              Explore Catalog
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="anivom-wishlist-container">
        <div className="anivom-wishlist-empty-box reveal">
          <p className="anivom-wishlist-loading-text">Loading your saved wishlist items...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="anivom-wishlist-container">
        <div className="anivom-wishlist-empty-box error reveal">
          <h2 className="anivom-wishlist-empty-head">UNABLE TO LOAD WISHLIST</h2>
          <p className="anivom-wishlist-empty-sub">{error}</p>
          <button className="anivom-btn-wishlist-primary" onClick={fetchWishlist}>
            Retry Request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="anivom-wishlist-container">
      <header className="anivom-wishlist-header reveal">
        <div>
          <h1 className="anivom-wishlist-title">
            MY WISHLIST
            <span className="anivom-wishlist-count">({wishlistItems.length})</span>
          </h1>
          <p className="anivom-wishlist-subtitle">Your saved couture pieces and custom essentials.</p>
        </div>
        <button className="anivom-wishlist-back-btn" onClick={onBackToCatalog}>
          &larr; Return to Shop
        </button>
      </header>

      {wishlistItems.length === 0 ? (
        <div className="anivom-wishlist-empty-box reveal">
          <h2 className="anivom-wishlist-empty-head">YOUR WISHLIST IS EMPTY</h2>
          <p className="anivom-wishlist-empty-sub">
            Save your favorite T-shirts and bespoke garments by clicking the heart icon while browsing our collection.
          </p>
          <div className="anivom-wishlist-empty-actions">
            <button className="anivom-btn-wishlist-primary" onClick={onBackToCatalog}>
              Explore Collection
            </button>
          </div>
        </div>
      ) : (
        <div className="anivom-wishlist-grid">
          {wishlistItems.map((product, idx) => {
            const selectedColour = product.selectedColour || product.initialColor || ''
            const itemKey = `${product._id}_${selectedColour}_${idx}`
            const cardImg = getWishlistGarmentImage(product, selectedColour)
            const displayName = selectedColour ? `${product.name} - ${selectedColour}` : product.name
            const availableSizes = product.variants?.length
              ? Array.from(new Set(
                  product.variants
                    .filter((variant) => variant.colour === selectedColour && variant.stock > 0)
                    .map((variant) => variant.size)
                ))
              : []
            const selectedSize = availableSizes.includes(selectedSizes[itemKey])
              ? selectedSizes[itemKey]
              : availableSizes[0] || ''

            return (
              <div
                key={itemKey}
                className="anivom-wishlist-card reveal"
                style={{ '--reveal-delay': `${(idx % 4) * 60}ms` }}
                onClick={() => {
                  if (onSelectProduct) {
                    onSelectProduct(product, { initialColor: selectedColour })
                  }
                }}
              >
                <div className="anivom-wishlist-card-img-wrap">
                  {cardImg ? (
                    <img
                      src={cardImg}
                      alt={displayName}
                      className="anivom-wishlist-card-img"
                      onError={(e) => {
                        const fallback = product?.images && product.images.length > 0 ? product.images[0] : null
                        if (fallback && e.target.src !== fallback) {
                          e.target.src = fallback
                        } else {
                          e.target.onerror = null
                          e.target.src = DEFAULT_PLACEHOLDER
                        }
                      }}
                    />
                  ) : (
                    <div className="anivom-wishlist-no-img">ANIVOM COUTURE</div>
                  )}

                  <button
                    className="anivom-wishlist-remove-btn"
                    title="Remove from Wishlist"
                    aria-label="Remove from Wishlist"
                    onClick={(e) => handleRemoveFromWishlist(product, e)}
                  >
                    ✕
                  </button>

                  <button
                    className="anivom-wishlist-quickadd-btn"
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={addingId === `${product._id}_${selectedColour}`}
                  >
                    {addingId === `${product._id}_${selectedColour}` ? 'Adding...' : '+ Add to Bag'}
                  </button>
                </div>

                <div className="anivom-wishlist-card-body">
                  <span className="anivom-wishlist-card-cat">{product.category || 'Collection'}</span>
                  <h3 className="anivom-wishlist-card-name">{displayName}</h3>
                  <div className="anivom-wishlist-card-price">&#8377;{formatINRAmount(product.basePrice)}</div>

                  <div className="anivom-wishlist-size-group">
                    <span className="anivom-wishlist-size-label">SIZE</span>
                    <div className="anivom-wishlist-sizes-wrap">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => {
                        const isAvailable = availableSizes.includes(size)
                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={!isAvailable}
                            className={`anivom-wishlist-size-pill ${selectedSize === size ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (isAvailable) {
                                setSelectedSizes((prev) => ({ ...prev, [itemKey]: size }))
                                setBuyNowErrors((prev) => ({ ...prev, [itemKey]: '' }))
                              }
                            }}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {buyNowErrors[itemKey] && (
                    <div className="anivom-wishlist-buy-error">{buyNowErrors[itemKey]}</div>
                  )}

                  {cardMsg[`${product._id}_${selectedColour}`] && (
                    <div className="anivom-wishlist-card-msg">{cardMsg[`${product._id}_${selectedColour}`]}</div>
                  )}

                  <div className="anivom-wishlist-card-actions">
                    {openStudio && (
                      <button
                        className="anivom-wishlist-studio-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          openStudio(product, { initialColor: selectedColour })
                        }}
                      >
                        Customize in Studio
                      </button>
                    )}
                    <button
                      className="anivom-wishlist-buy-btn"
                      onClick={(e) => handleBuyNow(product, selectedColour, selectedSize, itemKey, e)}
                    >
                      BUY NOW
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Wishlist

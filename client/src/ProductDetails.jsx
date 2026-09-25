import { useState, useEffect } from 'react'
import './ProductDetails.css'
import { API_BASE_URL } from './config'

function ProductDetails({ product: propProduct, productId, initialProduct, user, onBackToCatalog, onNavigateToStudio, openStudio, onCartUpdated, onSelectProduct }) {
  const [product, setProduct] = useState(propProduct || initialProduct || null)
  const [loadingProduct, setLoadingProduct] = useState(!propProduct && !initialProduct && !!productId)
  const [productFetchErr, setProductFetchErr] = useState(null)

  const [selectedImgIndex, setSelectedImgIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColour, setSelectedColour] = useState('Black')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const [adding, setAdding] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  const handleStudioNavigation = openStudio || onNavigateToStudio || (() => {})

  useEffect(() => {
    window.scrollTo(0, 0)
    const activeObj = propProduct || initialProduct
    if (activeObj) {
      setProduct(activeObj)
      setSelectedImgIndex(0)
      if (activeObj.variants && activeObj.variants.length > 0) {
        const firstVar = activeObj.variants[0]
        setSelectedSize(firstVar.size)
        setSelectedColour(firstVar.colour)
      }
    } else if (productId) {
      const fetchProductById = async () => {
        setLoadingProduct(true)
        setProductFetchErr(null)
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/products/${productId}`)
          const data = await res.json()
          if (res.ok && data.data && data.data.product) {
            const fetchedProduct = data.data.product
            setProduct(fetchedProduct)
            setSelectedImgIndex(0)
            if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
              const firstVar = fetchedProduct.variants[0]
              setSelectedSize(firstVar.size)
              setSelectedColour(firstVar.colour)
            }
          } else {
            setProductFetchErr('Garment details could not be retrieved.')
          }
        } catch (e) {
          setProductFetchErr('Network error loading product details.')
        } finally {
          setLoadingProduct(false)
        }
      }
      fetchProductById()
    }
  }, [propProduct, initialProduct, productId])

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (!user || !product) return
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/wishlist`, {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          const prods = data.data.wishlist?.products || []
          const found = prods.some((p) => (p._id || p) === product._id)
          setIsWishlisted(found)
        }
      } catch (e) {
        // silent catch
      }
    }
    fetchWishlistStatus()
  }, [user, product])

  const handleWishlistToggle = async () => {
    if (!user) {
      setErr('Please sign in to add products to your wishlist.')
      return
    }

    try {
      const url = `${API_BASE_URL}/api/v1/wishlist${isWishlisted ? `/${product._id}` : ''}`
      const method = isWishlisted ? 'DELETE' : 'POST'
      const body = isWishlisted ? null : JSON.stringify({ productId: product._id })

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body,
      })

      if (res.ok) {
        const data = await res.json()
        const prods = data.data.wishlist?.products || []
        const found = prods.some((p) => (p._id || p) === product._id)
        setIsWishlisted(found)
      } else {
        const data = await res.json()
        setErr(data.message || 'Failed to update wishlist.')
      }
    } catch (e) {
      setErr('Network error updating wishlist.')
    }
  }

  if (loadingProduct) {
    return (
      <div className="anivom-pdp-container">
        <div className="pdp-loading">
          <div className="pdp-loading-spinner"></div>
          <p style={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Loading ANIVOM Garment...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="anivom-pdp-container">
        <div className="anivom-pdp-error-box">
          <h2>Product Not Found</h2>
          <p>{productFetchErr || 'The requested garment could not be loaded.'}</p>
          <button className="anivom-btn-primary" onClick={onBackToCatalog}>
            &larr; Return to Catalog
          </button>
        </div>
      </div>
    )
  }

  const variants = product.variants || []
  const availableColours = Array.from(new Set(variants.map((v) => v.colour)))
  const availableSizesForColour = Array.from(
    new Set(variants.filter((v) => v.colour === selectedColour).map((v) => v.size))
  )

  const activeVariant = variants.find(
    (v) => v.colour === selectedColour && v.size === selectedSize
  )

  const stockAvailable = activeVariant ? activeVariant.stock : 0
  const isOutOfStock = !activeVariant || stockAvailable <= 0

  const handleColourChange = (colour) => {
    setSelectedColour(colour)
    setSelectedImgIndex(0)
    const validSizes = Array.from(
      new Set(variants.filter((v) => v.colour === colour).map((v) => v.size))
    )
    if (!validSizes.includes(selectedSize)) {
      setSelectedSize(validSizes[0] || 'M')
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      setErr('Please sign in to add products to your bag.')
      return
    }

    if (isOutOfStock) {
      setErr('Selected variant is currently out of stock.')
      return
    }

    setAdding(true)
    setMsg(null)
    setErr(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          product: product._id,
          size: selectedSize,
          colour: selectedColour,
          quantity: Number(quantity),
          customized: false,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        if (onCartUpdated) onCartUpdated()
      } else {
        setErr(data.message || 'Failed to add product to cart.')
      }
    } catch (e) {
      setErr('Network error adding product to bag.')
    } finally {
      setAdding(false)
    }
  }

  const DEFAULT_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='100%' height='100%' fill='%23F7F2E8'/><text x='50%' y='48%' font-family='serif' font-size='28' fill='%237A1F3D' text-anchor='middle' letter-spacing='4'>ANIVOM</text><text x='50%' y='53%' font-family='sans-serif' font-size='14' fill='%23C6A15B' text-anchor='middle' letter-spacing='2'>COUTURE</text></svg>"

  const getProductDetailsImages = () => {
    if (selectedColour && product?.garmentImages?.byColour) {
      const byColourObj = product.garmentImages.byColour
      const colourMapObj = byColourObj instanceof Map ? Object.fromEntries(byColourObj) : byColourObj
      const colourData = colourMapObj?.[selectedColour]
      if (colourData) {
        const list = []
        if (colourData.front) list.push(colourData.front)
        if (colourData.back) list.push(colourData.back)
        if (colourData.left) list.push(colourData.left)
        if (colourData.right) list.push(colourData.right)
        if (list.length > 0) return list
      }
    }
    const garmentImagesList = []
    if (product?.garmentImages) {
      if (product.garmentImages.front) garmentImagesList.push(product.garmentImages.front)
      if (product.garmentImages.back) garmentImagesList.push(product.garmentImages.back)
      if (product.garmentImages.left) garmentImagesList.push(product.garmentImages.left)
      if (product.garmentImages.right) garmentImagesList.push(product.garmentImages.right)
    }
    return garmentImagesList.length > 0 ? garmentImagesList : (product?.images && product.images.length > 0 ? product.images : [])
  }

  const images = getProductDetailsImages()

  return (
    <div className="anivom-pdp-root">
      <div className="anivom-pdp-container">
        <nav className="anivom-breadcrumb">
          <span onClick={onBackToCatalog}>Home</span> /{' '}
          <span onClick={onBackToCatalog}>Catalog</span> /{' '}
          <span className="active">{product.name}</span>
        </nav>

        <div className="anivom-pdp-grid">
          <div className="anivom-pdp-gallery-col">
            <div className="anivom-pdp-main-frame">
              {images.length > 0 ? (
                <img
                  src={images[selectedImgIndex] || images[0]}
                  alt={product.name}
                  className="anivom-pdp-main-img"
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
                <div className="anivom-pdp-no-img">ANIVOM Couture</div>
              )}

              <button
                className="anivom-pdp-wishlist-btn"
                aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                onClick={handleWishlistToggle}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                {isWishlisted ? '❤️' : '🤍'}
              </button>
            </div>

            {images.length > 1 && (
              <div className="anivom-pdp-thumbnails">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className={`anivom-pdp-thumb ${selectedImgIndex === idx ? 'selected' : ''}`}
                    onClick={() => setSelectedImgIndex(idx)}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = DEFAULT_PLACEHOLDER
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="anivom-pdp-details-col">
            <span className="anivom-pdp-cat-badge">{product.category || 'Collection'}</span>
            <h1 className="anivom-pdp-title">{product.name}</h1>
            <div className="anivom-pdp-price">&#8377;{product.basePrice}</div>

            <div className="anivom-pdp-stock-status">
              {isOutOfStock ? (
                <span className="out-of-stock">✕ Currently Out of Stock</span>
              ) : stockAvailable <= 5 ? (
                <span className="low-stock">⚡ Low Stock: Only {stockAvailable} items remaining</span>
              ) : (
                <span className="in-stock">✓ In Stock & Ready to Ship</span>
              )}
            </div>

            <p className="anivom-pdp-desc">
              {product.description ||
                'Crafted from heavy 240 GSM combed ring-spun cotton with reinforced shoulder stitching. Perfect classic streetwear drape.'}
            </p>

            <div className="anivom-pdp-option-section">
              <label className="anivom-option-label">
                Select Colour: <strong>{selectedColour}</strong>
              </label>
              <div className="anivom-color-chips">
                {availableColours.map((c) => (
                  <button
                    key={c}
                    className={`anivom-color-chip ${selectedColour === c ? 'active' : ''}`}
                    onClick={() => handleColourChange(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="anivom-pdp-option-section">
              <label className="anivom-option-label">
                Select Size: <strong>{selectedSize}</strong>
              </label>
              <div className="anivom-size-chips">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((s) => {
                  const isSupported = availableSizesForColour.includes(s)
                  return (
                    <button
                      key={s}
                      disabled={!isSupported}
                      className={`anivom-size-chip ${selectedSize === s ? 'active' : ''} ${!isSupported ? 'disabled' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="anivom-pdp-option-section">
              <label className="anivom-option-label">Quantity</label>
              <div className="anivom-qty-picker">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="anivom-qty-btn"
                >
                  -
                </button>
                <span className="anivom-qty-val">{quantity}</span>
                <button
                  disabled={quantity >= stockAvailable}
                  onClick={() => setQuantity((prev) => Math.min(stockAvailable, prev + 1))}
                  className="anivom-qty-btn"
                >
                  +
                </button>
              </div>
            </div>

            {msg && <div className="anivom-pdp-notice success">{msg}</div>}
            {err && <div className="anivom-pdp-notice error">{err}</div>}

            <div className="anivom-pdp-cta-block">
              <button
                disabled={adding || isOutOfStock}
                onClick={handleAddToCart}
                className="anivom-btn-add-pdp"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {adding ? 'Adding to Bag...' : isOutOfStock ? 'Out of Stock' : (
                  <>
                    <span>Add to Bag</span>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </>
                )}
              </button>

              <button
                onClick={() => handleStudioNavigation(product)}
                className="anivom-btn-studio-pdp"
              >
                Customize in Studio ✦
              </button>
            </div>

            <div className="anivom-custom-note-box">
              <div className="anivom-note-title">✦ WANT TO MAKE IT YOURS?</div>
              <p className="anivom-note-body">
                Add your own text, custom artwork, or an ANIVOM vector design on this T-shirt using our interactive Studio engine.
              </p>
              <button
                className="anivom-note-btn"
                onClick={() => handleStudioNavigation(product)}
              >
                Customize Product in Studio &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails

import { useState, useEffect } from 'react'
import './Catalog.css'
import { API_BASE_URL } from './config'
import AuthModal from './AuthModal'

function CatalogProductCard({ product, user, openStudio, onCartUpdated, onSelectProduct, wishlistIds = [], onWishlistToggle, onRequireAuth }) {
  const availableSizes = product && product.variants && product.variants.length > 0
    ? Array.from(new Set(product.variants.map((v) => v.size)))
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  const availableColours = product && product.variants && product.variants.length > 0
    ? Array.from(new Set(product.variants.map((v) => v.colour)))
    : ['Black', 'White', 'Navy']

  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || 'M')
  const [selectedColour, setSelectedColour] = useState(availableColours[0] || 'Black')
  const [adding, setAdding] = useState(false)
  const [cardMsg, setCardMsg] = useState(null)
  const [cardErr, setCardErr] = useState(null)

  const isWishlisted = wishlistIds.includes(product._id)

  const primaryImage = product.images && product.images.length > 0 ? product.images[0] : null
  const secondaryImage = product.images && product.images.length > 1 ? product.images[1] : primaryImage

  const handleCardClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product)
    } else {
      openStudio(product)
    }
  }

  const handleWishlistClick = (e) => {
    e.stopPropagation()
    if (!user) {
      setCardErr('Please log in to add items to your wishlist.')
      return
    }
    if (onWishlistToggle) {
      onWishlistToggle(product._id)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      if (onRequireAuth) onRequireAuth()
      return
    }

    setAdding(true)
    setCardMsg(null)
    setCardErr(null)

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

      const data = await res.json()
      if (res.ok) {
        if (onCartUpdated) onCartUpdated()
      } else {
        setCardErr(data.message || 'Failed to add item to cart.')
      }
    } catch (err) {
      setCardErr('Network error adding item to cart.')
    } finally {
      setAdding(false)
    }
  }

  const DEFAULT_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='100%' height='100%' fill='%23F7F2E8'/><text x='50%' y='48%' font-family='serif' font-size='28' fill='%237A1F3D' text-anchor='middle' letter-spacing='4'>ANIVOM</text><text x='50%' y='53%' font-family='sans-serif' font-size='14' fill='%23C6A15B' text-anchor='middle' letter-spacing='2'>COUTURE</text></svg>"

  return (
    <div className="anivom-fashion-card">
      <div className="anivom-card-img-container" onClick={handleCardClick}>
        {primaryImage ? (
          <>
            <img
              src={primaryImage}
              alt={product.name}
              className="anivom-card-img-primary"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = DEFAULT_PLACEHOLDER
              }}
            />
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name} hover`}
                className="anivom-card-img-secondary"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = DEFAULT_PLACEHOLDER
                }}
              />
            )}
          </>
        ) : (
          <div className="anivom-card-no-img">
            ANIVOM Couture
          </div>
        )}

        <button
          className="anivom-wishlist-btn"
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          onClick={handleWishlistClick}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>

        <button
          className="anivom-quick-hover-btn"
          onClick={(e) => {
            e.stopPropagation()
            handleAddToCart()
          }}
          disabled={adding}
        >
          {adding ? 'Adding...' : '+ Quick Add Bag'}
        </button>
      </div>

      <div className="anivom-card-body">
        <div>
          <div className="anivom-card-cat-badge">{product.category || 'Collection'}</div>
          <h4 className="anivom-card-title">{product.name}</h4>
          <div className="anivom-card-price">&#8377;{product.basePrice}</div>

          <div className="anivom-variant-selectors">
            <div>
              <label className="anivom-filter-label">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="anivom-filter-select"
                style={{ width: '100%' }}
              >
                {availableSizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="anivom-filter-label">Colour</label>
              <select
                value={selectedColour}
                onChange={(e) => setSelectedColour(e.target.value)}
                className="anivom-filter-select"
                style={{ width: '100%' }}
              >
                {availableColours.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {cardMsg && <div className="anivom-card-msg success">{cardMsg}</div>}
          {cardErr && <div className="anivom-card-msg error">{cardErr}</div>}
        </div>

        <div className="anivom-card-btn-group">
          <button
            onClick={() => openStudio(product)}
            className="anivom-btn-studio"
          >
            CUSTOMIZE IN STUDIO
          </button>
        </div>
      </div>
    </div>
  )
}

function Catalog({ user, openStudio, onCartUpdated, onSelectProduct, onAuthSuccess, initialCategory = 'All' }) {
  const [products, setProducts] = useState([])
  const [wishlistIds, setWishlistIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistIds([])
      return
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/wishlist`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        const prods = data.data.wishlist?.products || []
        setWishlistIds(prods.map((p) => p._id || p))
      }
    } catch (err) {
      // silent catch for wishlist fetch error
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [user])

  const handleWishlistToggle = async (productId) => {
    if (!user) return
    const isWishlisted = wishlistIds.includes(productId)
    try {
      const url = `${API_BASE_URL}/api/v1/wishlist${isWishlisted ? `/${productId}` : ''}`
      const method = isWishlisted ? 'DELETE' : 'POST'
      const body = isWishlisted ? null : JSON.stringify({ productId })

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body,
      })

      if (res.ok) {
        const data = await res.json()
        const prods = data.data.wishlist?.products || []
        setWishlistIds(prods.map((p) => p._id || p))
      }
    } catch (err) {
      console.error('Wishlist error', err)
    }
  }

  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'All')
  const [selectedSize, setSelectedSize] = useState('All')
  const [selectedColour, setSelectedColour] = useState('All')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortOption, setSortOption] = useState('newest')

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const [dbCategories, setDbCategories] = useState([])
  const [dbSizes, setDbSizes] = useState([])
  const [dbColours, setDbColours] = useState([])

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.categories && data.data.categories.length > 0) {
          setDbCategories(data.data.categories.map((c) => c.name))
        }
      })
      .catch(() => {})

    fetch(`${API_BASE_URL}/api/v1/sizes`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.sizes && data.data.sizes.length > 0) {
          setDbSizes(data.data.sizes.map((s) => s.name))
        }
      })
      .catch(() => {})

    fetch(`${API_BASE_URL}/api/v1/colours`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.colours && data.data.colours.length > 0) {
          setDbColours(data.data.colours.map((c) => c.name))
        }
      })
      .catch(() => {})
  }, [])

  const defaultCategories = ['Oversized', 'Regular Fit', 'Graphic', 'Minimal', 'Custom']
  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  const defaultColours = ['Black', 'White', 'Navy', 'Grey', 'Olive', 'Cream', 'Maroon', 'Red']

  const categories = ['All', ...Array.from(new Set([...(dbCategories.length > 0 ? dbCategories : defaultCategories), initialCategory]))].filter(Boolean)
  const sizes = ['All', ...(dbSizes.length > 0 ? dbSizes : defaultSizes)]
  const colours = ['All', ...(dbColours.length > 0 ? dbColours : defaultColours)]

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.append('search', searchQuery.trim())
      if (activeCategory !== 'All') params.append('category', activeCategory)
      if (selectedSize !== 'All') params.append('size', selectedSize)
      if (selectedColour !== 'All') params.append('colour', selectedColour)
      if (minPrice !== '') params.append('minPrice', minPrice)
      if (maxPrice !== '') params.append('maxPrice', maxPrice)
      if (sortOption) params.append('sort', sortOption)
      params.append('page', page)
      params.append('limit', 12)

      const res = await fetch(`${API_BASE_URL}/api/v1/products?${params.toString()}`)
      const data = await res.json()

      if (res.ok) {
        setProducts(data.data.products || [])
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1)
          setTotalProducts(data.pagination.totalProducts || 0)
        }
      } else {
        setError(data.message || 'Failed to load catalog products.')
      }
    } catch (err) {
      setError('Network error connecting to ANIVOM catalog server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, activeCategory, selectedSize, selectedColour, minPrice, maxPrice, sortOption, page])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    setSearchQuery(search)
  }

  const handleCategoryChange = (cat) => {
    setPage(1)
    setActiveCategory(cat)
  }

  const handleResetFilters = () => {
    setSearch('')
    setSearchQuery('')
    setActiveCategory('All')
    setSelectedSize('All')
    setSelectedColour('All')
    setMinPrice('')
    setMaxPrice('')
    setSortOption('newest')
    setPage(1)
  }

  const startItemNum = totalProducts > 0 ? (page - 1) * 12 + 1 : 0
  const endItemNum = Math.min(page * 12, totalProducts)

  return (
    <div className="anivom-catalog-root">
      <div className="anivom-hero-banner">
        <div className="anivom-hero-content-box">
          <span className="anivom-hero-kicker">CURATED APPAREL</span>
          <h1 className="anivom-brand-title">THE ANIVOM COLLECTION</h1>
          <p className="anivom-brand-tagline">Find your fit. Find your colour. Make it yours.</p>
          <div className="anivom-catalog-count-badge">
            {totalProducts} PRODUCTS AVAILABLE
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="anivom-search-container">
          <div className="anivom-search-input-wrap">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search oversized tees, minimal cuts, graphics..."
              className="anivom-search-input"
            />
            <button type="submit" className="anivom-search-btn">
              Search
            </button>
          </div>
        </form>

        <div className="anivom-trending-tags">
          <span className="anivom-trending-label">Trending:</span>
          {['Oversized', 'Graphic', 'Minimal', 'Custom', 'Black Tees', 'New Drops'].map((tag) => (
            <span
              key={tag}
              className="anivom-tag-pill"
              onClick={() => {
                if (tag === 'Black Tees') {
                  setActiveCategory('Minimal')
                } else if (tag === 'New Drops') {
                  setSortOption('newest')
                } else {
                  setActiveCategory(tag)
                }
                setPage(1)
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="anivom-catalog-content">
        <div className="anivom-category-nav">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`anivom-category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat === 'All' ? 'All Collections' : cat}
            </button>
          ))}
        </div>

        <div className="anivom-filter-toolbar">
          <div className="anivom-filter-group">
            <label className="anivom-filter-label">Size</label>
            <select
              value={selectedSize}
              onChange={(e) => { setPage(1); setSelectedSize(e.target.value); }}
              className="anivom-filter-select"
            >
              {sizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="anivom-filter-group">
            <label className="anivom-filter-label">Colour</label>
            <select
              value={selectedColour}
              onChange={(e) => { setPage(1); setSelectedColour(e.target.value); }}
              className="anivom-filter-select"
            >
              {colours.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="anivom-filter-group">
            <label className="anivom-filter-label">Min Price (₹)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => { setPage(1); setMinPrice(e.target.value); }}
              placeholder="0"
              className="anivom-filter-input"
              style={{ width: '80px' }}
            />
          </div>

          <div className="anivom-filter-group">
            <label className="anivom-filter-label">Max Price (₹)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => { setPage(1); setMaxPrice(e.target.value); }}
              placeholder="3000"
              className="anivom-filter-input"
              style={{ width: '80px' }}
            />
          </div>

          <div className="anivom-filter-group">
            <label className="anivom-filter-label">Sort By</label>
            <select
              value={sortOption}
              onChange={(e) => { setPage(1); setSortOption(e.target.value); }}
              className="anivom-filter-select"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <button onClick={handleResetFilters} className="anivom-filter-reset-btn">
            Clear Filters
          </button>
        </div>

        {error && (
          <div className="anivom-catalog-error-box">
            <span>{error}</span>
            <button onClick={fetchProducts} className="anivom-retry-btn">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="anivom-catalog-loading-box">
            Discovering ANIVOM products...
          </div>
        ) : products.length === 0 ? (
          <div className="anivom-catalog-empty-box">
            <h3 className="anivom-empty-head">Nothing matched that search</h3>
            <p className="anivom-empty-sub">Try another style, colour, or price range.</p>
            <button onClick={handleResetFilters} className="anivom-btn-add-bag" style={{ width: 'auto', padding: '10px 24px' }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="anivom-product-grid">
              {products.map((product) => (
                <CatalogProductCard
                  key={product._id}
                  product={product}
                  user={user}
                  openStudio={openStudio}
                  onCartUpdated={onCartUpdated}
                  onSelectProduct={onSelectProduct}
                  wishlistIds={wishlistIds}
                  onWishlistToggle={handleWishlistToggle}
                  onRequireAuth={() => setShowAuthModal(true)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="anivom-pagination-bar">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="anivom-pagination-btn"
                >
                  &larr; Previous
                </button>
                <span className="anivom-pagination-info">
                  Showing <strong>{startItemNum}–{endItemNum}</strong> of <strong>{totalProducts}</strong> Products
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="anivom-pagination-btn"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showAuthModal && (
        <AuthModal
          user={user}
          mode="login"
          isOverlay={true}
          onClose={() => setShowAuthModal(false)}
          onNavigateToCatalog={() => setShowAuthModal(false)}
          onAuthSuccess={(userData) => {
            setShowAuthModal(false)
            if (onAuthSuccess) onAuthSuccess(userData)
          }}
        />
      )}
    </div>
  )
}

export default Catalog

import { useState, useEffect, useCallback, useMemo } from 'react'
import './Catalog.css'
import { API_BASE_URL } from './config'
import AuthModal from './AuthModal'

function CatalogProductCard({ product, initialColour, index = 0, user, openStudio, onCartUpdated, onSelectProduct, wishlistIds = [], onWishlistToggle, onRequireAuth }) {
  const availableColours = useMemo(() => {
    return product && product.variants && product.variants.length > 0
      ? Array.from(new Set(product.variants.filter((v) => v.stock > 0).map((v) => v.colour)))
      : []
  }, [product])

  const [selectedColour, setSelectedColour] = useState(initialColour || availableColours[0] || '')

  useEffect(() => {
    if (initialColour && availableColours.includes(initialColour)) {
      setSelectedColour(initialColour)
    } else if (availableColours.length > 0 && !availableColours.includes(selectedColour)) {
      setSelectedColour(availableColours[0])
    }
  }, [availableColours, initialColour, selectedColour])

  const availableSizes = useMemo(() => {
    return product && product.variants && product.variants.length > 0
      ? Array.from(new Set(
          product.variants
            .filter((v) => (selectedColour ? v.colour === selectedColour : true) && v.stock > 0)
            .map((v) => v.size)
        ))
      : []
  }, [product, selectedColour])

  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || '')

  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0])
    }
  }, [availableSizes, selectedSize])

  const [adding, setAdding] = useState(false)
  const [cardMsg, setCardMsg] = useState(null)
  const [cardErr, setCardErr] = useState(null)

  const isWishlisted = wishlistIds.includes(product._id)

  const getCardGarmentImage = (view) => {
    if (selectedColour && product?.garmentImages?.byColour) {
      const byColourObj = product.garmentImages.byColour
      const colourMapObj = byColourObj instanceof Map ? Object.fromEntries(byColourObj) : byColourObj
      const colourData = colourMapObj?.[selectedColour]
      if (colourData && colourData[view]) {
        return colourData[view]
      }
    }
    return product?.garmentImages?.[view] || null
  }

  const colourFrontGarmentImage = getCardGarmentImage('front')
  const defaultModelImage = product?.images && product.images.length > 0 ? product.images[0] : null

  const primaryImage =
    (selectedColour ? colourFrontGarmentImage : null) ||
    defaultModelImage ||
    colourFrontGarmentImage

  const secondaryImage =
    getCardGarmentImage('back') ||
    (product?.images && product.images.length > 1 ? product.images[1] : primaryImage)

  const handleCardClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product, { initialColor: selectedColour, initialSize: selectedSize })
    } else {
      openStudio(product, { initialColor: selectedColour, initialSize: selectedSize })
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

    if (!selectedColour || !selectedSize) {
      setCardErr('Please select an available colour and size.')
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
  const allSizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

  const getHexForColour = (colName) => {
    const map = {
      'Black': '#111111',
      'White': '#FFFFFF',
      'Navy Blue': '#1B2A4A',
      'Sky Blue': '#87CEEB',
      'Maroon': '#500B13',
      'Grey': '#808080',
      'Olive Green': '#556B2F',
      'Soft Pink': '#FFB6C1',
      'Cream': '#FDFBF7',
      'Mustard': '#E1AD01',
      'Wine': '#722F37',
      'Purple': '#4B0082',
      'Blue': '#1E40AF',
      'Green': '#15803D',
      'Pink': '#EC4899',
      'Yellow': '#EAB308',
    }
    return map[colName] || '#CCCCCC'
  }

  return (
    <div className="anivom-fashion-card reveal" style={{ '--reveal-delay': `${(index % 6) * 50}ms` }}>
      <div className="anivom-card-img-container" onClick={handleCardClick}>
        {primaryImage ? (
          <>
            <img
              src={primaryImage}
              alt={product.name}
              className="anivom-card-img-primary"
              loading={index < 4 ? 'eager' : 'lazy'}
              fetchPriority={index < 4 ? 'high' : 'auto'}
              decoding="async"
              onError={(e) => {
                if (defaultModelImage && e.target.src !== defaultModelImage) {
                  e.target.src = defaultModelImage
                } else {
                  e.target.onerror = null
                  e.target.src = DEFAULT_PLACEHOLDER
                }
              }}
            />
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name} hover`}
                className="anivom-card-img-secondary"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  if (defaultModelImage && e.target.src !== defaultModelImage) {
                    e.target.src = defaultModelImage
                  } else {
                    e.target.onerror = null
                    e.target.src = DEFAULT_PLACEHOLDER
                  }
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
          disabled={adding || availableColours.length === 0}
        >
          {adding ? 'Adding...' : '+ Quick Add Bag'}
        </button>
      </div>

      <div className="anivom-card-body">
        <div>
          <div className="anivom-card-cat-badge">{product.category || 'Collection'}</div>
          <h4 className="anivom-card-title">
            {product.name}{selectedColour ? ` - ${selectedColour}` : ''}
          </h4>
          <div className="anivom-card-price">&#8377;{product.basePrice}</div>

          <div className="anivom-card-variant-section">
            <div className="anivom-size-group">
              <span className="anivom-variant-label">SIZE</span>
              <div className="anivom-sizes-wrap">
                {allSizesList.map((sz) => {
                  const isAvailable = availableSizes.includes(sz)
                  const isSelected = selectedSize === sz

                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={!isAvailable}
                      className={`anivom-size-pill ${isSelected ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                      onClick={() => {
                        if (isAvailable) setSelectedSize(sz)
                      }}
                    >
                      {sz}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {cardMsg && <div className="anivom-card-msg success">{cardMsg}</div>}
          {cardErr && <div className="anivom-card-msg error">{cardErr}</div>}
        </div>

        <div className="anivom-card-btn-group">
          <button
            onClick={() => openStudio(product, { initialColor: selectedColour, initialSize: selectedSize })}
            className="anivom-btn-studio"
          >
            CUSTOMIZE IN STUDIO
          </button>
        </div>
      </div>
    </div>
  )
}

let cachedDbCategories = null
let cachedDbSizes = null
let cachedDbColours = null

function Catalog({ user, openStudio, onCartUpdated, onSelectProduct, onAuthSuccess, initialCategory = 'All', wishlistIds: propWishlistIds, onWishlistToggle: propWishlistToggle }) {
  const [products, setProducts] = useState([])
  const [internalWishlistIds, setInternalWishlistIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const wishlistIds = Array.isArray(propWishlistIds) ? propWishlistIds : internalWishlistIds

  useEffect(() => {
    const fetchWishlistData = async () => {
      if (!user || propWishlistIds !== undefined) {
        if (!user) setInternalWishlistIds([])
        return
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/wishlist`, {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          const prods = data.data.wishlist?.products || []
          setInternalWishlistIds(prods.map((p) => p._id || p))
        }
      } catch (err) {
        setInternalWishlistIds([])
      }
    }
    fetchWishlistData()
  }, [user, propWishlistIds])

  const handleWishlistToggle = async (productId) => {
    if (propWishlistToggle) {
      propWishlistToggle(productId)
      return
    }
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
        setInternalWishlistIds(prods.map((p) => p._id || p))
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

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [tempSize, setTempSize] = useState('All')
  const [tempColour, setTempColour] = useState('All')
  const [tempMinPrice, setTempMinPrice] = useState('')
  const [tempMaxPrice, setTempMaxPrice] = useState('')

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const [_dbCategories, setDbCategories] = useState(cachedDbCategories || [])
  const [dbSizes, setDbSizes] = useState(cachedDbSizes || [])
  const [dbColours, setDbColours] = useState(cachedDbColours || [])

  useEffect(() => {
    if (!cachedDbCategories) {
      fetch(`${API_BASE_URL}/api/v1/categories`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.categories && data.data.categories.length > 0) {
            const list = data.data.categories.map((c) => c.name)
            cachedDbCategories = list
            setDbCategories(list)
          }
        })
        .catch(() => { })
    }

    if (!cachedDbSizes) {
      fetch(`${API_BASE_URL}/api/v1/sizes`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.sizes && data.data.sizes.length > 0) {
            const list = data.data.sizes.map((s) => s.name)
            cachedDbSizes = list
            setDbSizes(list)
          }
        })
        .catch(() => { })
    }

    if (!cachedDbColours) {
      fetch(`${API_BASE_URL}/api/v1/colours`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.colours && data.data.colours.length > 0) {
            const list = data.data.colours.map((c) => c.name)
            cachedDbColours = list
            setDbColours(list)
          }
        })
        .catch(() => { })
    }
  }, [])

  const _defaultCategories = ['Oversized', 'Regular Fit', 'Graphic', 'Minimal', 'Custom']
  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  const defaultColours = ['Black', 'White', 'Navy', 'Grey', 'Olive', 'Cream', 'Maroon', 'Red']

  const categories = ['All', 'Cropped', 'Full Sleeve', 'Oversized', 'Polo', 'Sleeveless', 'Slim Fit', 'V-Neck']
  const sizes = ['All', ...(dbSizes.length > 0 ? dbSizes : defaultSizes)]
  const colours = ['All', ...(dbColours.length > 0 ? dbColours : defaultColours)]

  const fetchProducts = useCallback(async () => {
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
  }, [searchQuery, activeCategory, selectedSize, selectedColour, minPrice, maxPrice, sortOption, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    setSearchQuery(search)
  }

  const handleCategoryChange = (cat) => {
    setPage(1)
    setActiveCategory(cat)
  }

  const handleOpenFilters = () => {
    setTempSize(selectedSize)
    setTempColour(selectedColour)
    setTempMinPrice(minPrice)
    setTempMaxPrice(maxPrice)
    setIsFilterOpen((prev) => !prev)
  }

  const handleApplyFilters = () => {
    setPage(1)
    setSelectedSize(tempSize)
    setSelectedColour(tempColour)
    setMinPrice(tempMinPrice)
    setMaxPrice(tempMaxPrice)
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    setSearch('')
    setSearchQuery('')
    setActiveCategory('All')
    setSelectedSize('All')
    setSelectedColour('All')
    setMinPrice('')
    setMaxPrice('')
    setTempSize('All')
    setTempColour('All')
    setTempMinPrice('')
    setTempMaxPrice('')
    setSortOption('newest')
    setPage(1)
  }

  const catalogCards = useMemo(() => {
    const list = []
    products.forEach((product) => {
      const colours = product.variants && product.variants.length > 0
        ? Array.from(new Set(product.variants.filter((v) => v.stock > 0).map((v) => v.colour)))
        : []

      if (colours.length > 0) {
        colours.forEach((col) => {
          list.push({
            cardKey: `${product._id}-${col}`,
            product,
            initialColour: col,
          })
        })
      } else {
        list.push({
          cardKey: product._id,
          product,
          initialColour: '',
        })
      }
    })
    return list
  }, [products])

  const hasActiveFilters = selectedSize !== 'All' || selectedColour !== 'All' || minPrice !== '' || maxPrice !== ''

  const startItemNum = totalProducts > 0 ? (page - 1) * 12 + 1 : 0
  const endItemNum = Math.min(page * 12, totalProducts)

  return (
    <div className="anivom-catalog-root">
      <div className="anivom-hero-banner">
        <div className="anivom-hero-content-box reveal">
          <span className="anivom-hero-kicker">CURATED APPAREL</span>
          <h1 className="anivom-brand-title">THE ANIVOM COLLECTION</h1>
          <p className="anivom-brand-tagline">Find your fit. Find your colour. Make it yours.</p>
          <div className="anivom-catalog-count-badge">
            {catalogCards.length > 0 ? catalogCards.length : totalProducts} VARIANTS AVAILABLE
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="anivom-search-container">
          <div className="anivom-search-input-wrap">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search oversized, slim fit, v-neck, cropped..."
              className="anivom-search-input"
            />
            <button type="submit" className="anivom-search-btn">
              Search
            </button>
          </div>
        </form>

        <div className="anivom-trending-tags">
          <span className="anivom-trending-label">Trending:</span>
          {['Cropped', 'Full Sleeve', 'Oversized', 'Polo', 'Sleeveless', 'Slim Fit', 'V-Neck', 'New Drops'].map((tag) => (
            <span
              key={tag}
              className="anivom-tag-pill"
              onClick={() => {
                if (tag === 'New Drops') {
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

        <div className="anivom-compact-toolbar">
          <div className="anivom-toolbar-left">
            <button
              type="button"
              className={`anivom-filter-toggle-btn ${isFilterOpen || hasActiveFilters ? 'active' : ''}`}
              onClick={handleOpenFilters}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              <span>FILTER {hasActiveFilters ? '•' : ''}</span>
            </button>

            {hasActiveFilters && (
              <button onClick={handleResetFilters} className="anivom-toolbar-clear-btn">
                CLEAR
              </button>
            )}
          </div>

          <div className="anivom-toolbar-right">
            <label className="anivom-sort-label">SORT:</label>
            <select
              value={sortOption}
              onChange={(e) => { setPage(1); setSortOption(e.target.value); }}
              className="anivom-sort-select"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {isFilterOpen && (
          <div className="anivom-filter-panel">
            <div className="anivom-filter-panel-grid">
              <div className="anivom-filter-field">
                <label className="anivom-filter-field-label">Size</label>
                <select
                  value={tempSize}
                  onChange={(e) => setTempSize(e.target.value)}
                  className="anivom-filter-field-select"
                >
                  {sizes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="anivom-filter-field">
                <label className="anivom-filter-field-label">Colour</label>
                <select
                  value={tempColour}
                  onChange={(e) => setTempColour(e.target.value)}
                  className="anivom-filter-field-select"
                >
                  {colours.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="anivom-filter-field">
                <label className="anivom-filter-field-label">Min Price (₹)</label>
                <input
                  type="number"
                  value={tempMinPrice}
                  onChange={(e) => setTempMinPrice(e.target.value)}
                  placeholder="0"
                  className="anivom-filter-field-input"
                />
              </div>

              <div className="anivom-filter-field">
                <label className="anivom-filter-field-label">Max Price (₹)</label>
                <input
                  type="number"
                  value={tempMaxPrice}
                  onChange={(e) => setTempMaxPrice(e.target.value)}
                  placeholder="3000"
                  className="anivom-filter-field-input"
                />
              </div>
            </div>

            <div className="anivom-filter-panel-actions">
              <button type="button" onClick={handleResetFilters} className="anivom-filter-panel-clear">
                Clear Filters
              </button>
              <button type="button" onClick={handleApplyFilters} className="anivom-filter-panel-apply">
                Apply Filters
              </button>
            </div>
          </div>
        )}

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
              {catalogCards.map((item, idx) => (
                <CatalogProductCard
                  key={item.cardKey}
                  index={idx}
                  product={item.product}
                  initialColour={item.initialColour}
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

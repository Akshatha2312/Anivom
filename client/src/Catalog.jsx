import { useState, useEffect } from 'react'
import './Catalog.css'
import { API_BASE_URL } from './config'

function CatalogProductCard({ product, user, openStudio, onCartUpdated }) {
  const availableSizes = product && product.variants && product.variants.length > 0
    ? Array.from(new Set(product.variants.map((v) => v.size)))
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  const availableColours = product && product.variants && product.variants.length > 0
    ? Array.from(new Set(product.variants.map((v) => v.colour)))
    : ['Black', 'White', 'Navy']

  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || 'M')
  const [selectedColour, setSelectedColour] = useState(availableColours[0] || 'Black')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [adding, setAdding] = useState(false)
  const [cardMsg, setCardMsg] = useState(null)
  const [cardErr, setCardErr] = useState(null)

  const primaryImage = product.images && product.images.length > 0 ? product.images[0] : null
  const secondaryImage = product.images && product.images.length > 1 ? product.images[1] : primaryImage

  const handleAddToCart = async () => {
    if (!user) {
      setCardErr('Please log in to add items to your cart.')
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
          quantity: Number(quantity),
          customized: false,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setCardMsg('Added to bag!')
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

  return (
    <div className="anivom-fashion-card">
      <div className="anivom-card-img-container" onClick={() => openStudio(product)}>
        {primaryImage ? (
          <>
            <img src={primaryImage} alt={product.name} className="anivom-card-img-primary" />
            {secondaryImage && (
              <img src={secondaryImage} alt={`${product.name} hover`} className="anivom-card-img-secondary" />
            )}
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontWeight: '600' }}>
            ANIVOM Apparel
          </div>
        )}

        <button
          className="anivom-wishlist-btn"
          onClick={(e) => {
            e.stopPropagation()
            setIsWishlisted(!isWishlisted)
          }}
          title="Add to Wishlist"
        >
          {isWishlisted ? '❤️' : '🤍'}
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

          {cardMsg && <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '700', marginBottom: '8px' }}>{cardMsg}</div>}
          {cardErr && <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', marginBottom: '8px' }}>{cardErr}</div>}
        </div>

        <div className="anivom-card-btn-group">
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="anivom-btn-add-bag"
          >
            {adding ? 'Adding...' : 'Add to Bag 🛍️'}
          </button>

          <button
            onClick={() => openStudio(product)}
            className="anivom-btn-studio"
          >
            Customize in Studio 🎨
          </button>
        </div>
      </div>
    </div>
  )
}

function Catalog({ user, openStudio, onCartUpdated }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedSize, setSelectedSize] = useState('All')
  const [selectedColour, setSelectedColour] = useState('All')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortOption, setSortOption] = useState('newest')

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const categories = ['All', 'Oversized', 'Regular Fit', 'Graphic', 'Minimal', 'Custom']
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  const colours = ['All', 'Black', 'White', 'Navy', 'Grey', 'Olive', 'Cream', 'Maroon', 'Red']

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
      params.append('limit', 6)

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

  return (
    <div className="anivom-catalog-root">
      <div className="anivom-promo-ticker">
        COMPLIMENTARY NATIONWIDE EXPRESS SHIPPING ON ALL ORDERS | WEAR IT YOUR WAY
      </div>

      <div className="anivom-hero-banner">
        <h1 className="anivom-brand-title">ANIVOM</h1>
        <p className="anivom-brand-tagline">Wear It Your Way.</p>

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
          <span className="anivom-trending-label">Trending Now:</span>
          {['Oversized', 'Graphic', 'Minimal', 'Custom', 'Egyptian Cotton'].map((tag) => (
            <span
              key={tag}
              className="anivom-tag-pill"
              onClick={() => {
                setSearch(tag === 'Egyptian Cotton' ? '' : tag)
                if (tag !== 'Egyptian Cotton') {
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
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '16px', borderRadius: '6px', marginBottom: '24px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlignment: 'center', padding: '60px 20px', textAlign: 'center', fontSize: '16px', fontWeight: '600', color: '#6b7280' }}>
            Discovering ANIVOM products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F7F2E8', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' }}>No products match your filter criteria</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Try broadening your search or resetting size, colour, or price filters.</p>
            <button onClick={handleResetFilters} className="anivom-btn-add-bag" style={{ width: 'auto', padding: '10px 24px' }}>
              Reset All Filters
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
                  &larr; Previous Page
                </button>
                <span className="anivom-pagination-info">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalProducts} Products)
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="anivom-pagination-btn"
                >
                  Next Page &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Catalog

import { useState, useEffect } from 'react'
import './Home.css'
import { API_BASE_URL } from './config'

function Home({ user, onNavigateToCatalog, onNavigateToStudio, onCartUpdated }) {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true)
      try {
        const [prodRes, bannerRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/products?limit=8`),
          fetch(`${API_BASE_URL}/api/v1/banners`),
        ])

        const prodData = await prodRes.json()
        if (prodRes.ok) {
          const list = prodData.data?.products || []
          setFeaturedProducts(list.slice(0, 4))
          setRecommendations(list.slice(4, 8).length > 0 ? list.slice(4, 8) : list.slice(0, 4))
        } else {
          setError(prodData.message || 'Failed to load featured products.')
        }

        if (bannerRes.ok) {
          const bannerData = await bannerRes.json()
          if (bannerData.data?.banners) {
            setBanners(bannerData.data.banners)
          }
        }
      } catch (err) {
        setError('Network error loading homepage items.')
      } finally {
        setLoading(false)
      }
    }
    fetchHomeData()
  }, [])

  const handleBannerAction = (link) => {
    if (!link) {
      onNavigateToCatalog()
      return
    }
    const cleanLink = link.trim()
    if (cleanLink.startsWith('/studio')) {
      onNavigateToStudio(null)
    } else if (cleanLink.startsWith('/product/')) {
      onNavigateToCatalog()
    } else if (cleanLink.startsWith('/catalog') || cleanLink === '/') {
      onNavigateToCatalog()
    } else if (cleanLink.startsWith('http://') || cleanLink.startsWith('https://')) {
      window.location.href = cleanLink
    } else {
      onNavigateToCatalog()
    }
  }

  const handleQuickAdd = async (product, e) => {
    e.stopPropagation()
    if (!user) {
      alert('Please sign in to add items to your shopping bag.')
      return
    }

    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : { size: 'M', colour: 'Black' }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          product: product._id,
          size: defaultVariant.size,
          colour: defaultVariant.colour,
          quantity: 1,
          customized: false,
        }),
      })

      if (res.ok) {
        if (onCartUpdated) onCartUpdated()
        alert(`Added ${product.name} (${defaultVariant.size} / ${defaultVariant.colour}) to your bag!`)
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to add item to bag.')
      }
    } catch (err) {
      alert('Network error adding product to bag.')
    }
  }

  const stylesCategories = [
    { title: 'Oversized', desc: 'Relaxed heavy silhouettes with dropped shoulders', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80', cat: 'Oversized' },
    { title: 'Regular Fit', desc: 'Timeless classic cut built from premium combed cotton', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', cat: 'Regular Fit' },
    { title: 'Graphic Tees', desc: 'Bespoke artistic graphics and statement typography', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80', cat: 'Graphic' },
    { title: 'Minimalist', desc: 'Subtle couture details, refined aesthetic cuts', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80', cat: 'Minimal' },
    { title: 'Custom Studio', desc: 'Designed by you on ANIVOM interactive studio', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80', cat: 'Custom' },
  ]

  const trendingTags = ['Oversized', 'Graphic', 'Minimal', 'Custom', 'Black Tees', 'New Drops']

  const activeHeroBanner = banners.length > 0 ? banners[0] : null

  return (
    <div className="anivom-home-root">
      <section className="anivom-hero-editorial">
        <div className="anivom-hero-grid">
          <div className="anivom-hero-text-col">
            <span className="anivom-hero-kicker">
              {activeHeroBanner?.title || 'AUTUMN / WINTER COUTURE'}
            </span>
            <h1 className="anivom-hero-heading">ANIVOM</h1>
            <div className="anivom-hero-subtag">
              {activeHeroBanner?.subtitle || 'Wear It Your Way.'}
            </div>
            <p className="anivom-hero-desc">
              Your T-shirt. Your design. Your rules. High fashion ready-to-wear collections meets interactive custom apparel tailoring.
            </p>
            <div className="anivom-hero-cta-group">
              {activeHeroBanner ? (
                <>
                  <button
                    className="anivom-btn-primary"
                    onClick={() => handleBannerAction(activeHeroBanner.buttonLink)}
                  >
                    {activeHeroBanner.buttonText || 'Explore Collection'}
                  </button>
                  <button className="anivom-btn-secondary" onClick={() => onNavigateToStudio(null)}>
                    Customize Yours ✦
                  </button>
                </>
              ) : (
                <>
                  <button className="anivom-btn-primary" onClick={onNavigateToCatalog}>
                    Shop T-Shirts
                  </button>
                  <button className="anivom-btn-secondary" onClick={() => onNavigateToStudio(null)}>
                    Customize Yours ✦
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="anivom-hero-visual-col">
            <div className="anivom-hero-img-frame">
              <img
                src={
                  activeHeroBanner?.image ||
                  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
                }
                alt={activeHeroBanner?.title || 'ANIVOM Fashion Hero'}
                className="anivom-hero-img"
              />
              <div className="anivom-hero-img-badge">NEW COLLECTION</div>
            </div>
          </div>
        </div>
      </section>

      <section className="anivom-intro-section">
        <div className="anivom-intro-container">
          <h2 className="anivom-intro-title">REDEFINING CUSTOM STREETWEAR COUTURE</h2>
          <p className="anivom-intro-text">
            ANIVOM merges contemporary oversized fits with custom digital design. Choose from our signature ready-to-wear drops or personalize every layer with your custom graphics, artwork, and text.
          </p>
          <div className="anivom-intro-tamil-accent">
            <span>உன் Style. உன் Rules.</span>
          </div>
        </div>
      </section>

      <section className="anivom-styles-section">
        <div className="anivom-section-header">
          <h2 className="anivom-section-title">SHOP BY STYLE</h2>
          <span className="anivom-section-sub">CURATED CATEGORIES & FITS</span>
        </div>

        <div className="anivom-styles-grid">
          {stylesCategories.map((style) => (
            <div
              key={style.title}
              className="anivom-style-tile"
              onClick={() => {
                if (style.cat === 'Custom') {
                  onNavigateToStudio(null)
                } else {
                  onNavigateToCatalog(style.cat)
                }
              }}
            >
              <img src={style.image} alt={style.title} className="anivom-style-img" />
              <div className="anivom-style-overlay">
                <h3 className="anivom-style-title">{style.title}</h3>
                <p className="anivom-style-desc">{style.desc}</p>
                <span className="anivom-style-arrow">Explore Category &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="anivom-featured-section">
        <div className="anivom-section-header">
          <h2 className="anivom-section-title">FEATURED DROPS</h2>
          <button className="anivom-link-btn" onClick={() => onNavigateToCatalog()}>
            View All Products &rarr;
          </button>
        </div>

        {error && <div className="anivom-error-notice">{error}</div>}

        {loading ? (
          <div className="anivom-loading-notice">Loading featured drop collection...</div>
        ) : (
          <div className="anivom-featured-grid">
            {featuredProducts.map((product) => {
              const img = product.images && product.images.length > 0 ? product.images[0] : null
              return (
                <div key={product._id} className="anivom-home-card" onClick={onNavigateToCatalog}>
                  <div className="anivom-home-card-img-wrap">
                    {img ? (
                      <img src={img} alt={product.name} className="anivom-home-card-img" />
                    ) : (
                      <div className="anivom-no-img">ANIVOM</div>
                    )}
                    <button
                      className="anivom-home-card-quickadd"
                      onClick={(e) => handleQuickAdd(product, e)}
                    >
                      + Quick Add Bag
                    </button>
                  </div>
                  <div className="anivom-home-card-body">
                    <span className="anivom-home-card-cat">{product.category}</span>
                    <h3 className="anivom-home-card-title">{product.name}</h3>
                    <div className="anivom-home-card-price">&#8377;{product.basePrice}</div>
                    <div className="anivom-home-card-actions">
                      <button
                        className="anivom-card-sub-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          onNavigateToStudio(product)
                        }}
                      >
                        Customize in Studio ✦
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="anivom-custom-banner">
        <div className="anivom-custom-banner-content">
          <span className="anivom-custom-badge">ANIVOM STUDIO ENGINE</span>
          <h2 className="anivom-custom-heading">MAKE IT YOURS.</h2>
          <div className="anivom-custom-steps">
            <div className="anivom-step">
              <span className="anivom-step-num">01</span>
              <h4>Select Apparel</h4>
              <p>Choose your garment fit & shade</p>
            </div>
            <div className="anivom-step">
              <span className="anivom-step-num">02</span>
              <h4>Add Artwork</h4>
              <p>Upload graphics or select vector art</p>
            </div>
            <div className="anivom-step">
              <span className="anivom-step-num">03</span>
              <h4>Position & Preview</h4>
              <p>Scale, rotate, and align on canvas</p>
            </div>
            <div className="anivom-step">
              <span className="anivom-step-num">04</span>
              <h4>Wear It</h4>
              <p>Tailored & printed to perfection</p>
            </div>
          </div>
          <button className="anivom-btn-primary" onClick={() => onNavigateToStudio(null)}>
            Customize in Studio &rarr;
          </button>
        </div>
      </section>

      <section className="anivom-trending-section">
        <div className="anivom-section-header">
          <h2 className="anivom-section-title">TRENDING NOW</h2>
          <span className="anivom-section-sub">POPULAR SEARCH SUGGESTIONS</span>
        </div>
        <div className="anivom-trending-pills">
          {trendingTags.map((tag) => (
            <button
              key={tag}
              className="anivom-trending-pill-btn"
              onClick={() => onNavigateToCatalog(tag === 'Black Tees' ? 'Minimal' : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      </section>

      <section className="anivom-rec-section">
        <div className="anivom-section-header">
          <h2 className="anivom-section-title">USERS ALSO BUY</h2>
          <span className="anivom-section-sub">RECOMMENDED COMBINATIONS</span>
        </div>

        <div className="anivom-rec-grid">
          {recommendations.map((product) => {
            const img = product.images && product.images.length > 0 ? product.images[0] : null
            return (
              <div key={product._id} className="anivom-rec-card" onClick={onNavigateToCatalog}>
                {img && <img src={img} alt={product.name} className="anivom-rec-img" />}
                <div className="anivom-rec-details">
                  <h4 className="anivom-rec-name">{product.name}</h4>
                  <span className="anivom-rec-price">&#8377;{product.basePrice}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="anivom-statement-section">
        <div className="anivom-statement-box">
          <h2 className="anivom-statement-text">
            &ldquo;DON&rsquo;T JUST WEAR A T-SHIRT. MAKE IT YOURS.&rdquo;
          </h2>
          <span className="anivom-statement-sub">ANIVOM HIGH COUTURE APPAREL</span>
        </div>
      </section>

      <section className="anivom-final-cta-section">
        <h2 className="anivom-cta-title">READY TO WEAR IT YOUR WAY?</h2>
        <p className="anivom-cta-sub">Discover our latest collection or craft your own bespoke design in seconds.</p>
        <div className="anivom-hero-cta-group" style={{ justifyContent: 'center' }}>
          <button className="anivom-btn-primary" onClick={onNavigateToCatalog}>
            Shop the Collection
          </button>
          <button className="anivom-btn-secondary" onClick={() => onNavigateToStudio(null)}>
            Create Your T-Shirt ✦
          </button>
        </div>
      </section>
    </div>
  )
}

export default Home

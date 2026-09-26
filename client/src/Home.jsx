import { useState, useEffect } from 'react'
import './Home.css'
import { API_BASE_URL } from './config'

function Home({ user, onNavigateToCatalog, onNavigateToStudio, onCartUpdated, onSelectProduct }) {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true)
      try {
        const bannerRes = await fetch(`${API_BASE_URL}/api/v1/banners`)
        if (bannerRes.ok) {
          const bannerData = await bannerRes.json()
          if (bannerData.data?.banners) {
            setBanners(bannerData.data.banners)
          }
        }
      } catch (err) {
        // Silent fallback for banners
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

  const stylesCategories = [
    { title: 'Cropped', desc: 'Modern cropped silhouette with raw hem trim', image: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790346010/cropped_black_front_view_kwqgk4.png', cat: 'Cropped' },
    { title: 'Full Sleeve', desc: 'Structured long sleeve silhouette in heavyweight cotton', image: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360283/fullsleve-black-front_ptxokc.png', cat: 'Full Sleeve' },
    { title: 'Oversized', desc: 'Relaxed heavy silhouettes with dropped shoulders', image: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343924/oversized-black-front_alria0.png', cat: 'Oversized' },
    { title: 'Polo', desc: 'Refined pique knit cotton with structured collar', image: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355362/polo-black-front_y82xzd.png', cat: 'Polo' },
    { title: 'Sleeveless', desc: 'Athletic cut armless tank tee for unrestricted comfort', image: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358628/sleeveless-black-front_lsu9bw.png', cat: 'Sleeveless' },
    { title: 'Slim Fit', desc: 'Form-fitting tailored cut with flexible comfort', image: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338620/slim-fit-white-front_xmwgos.png', cat: 'Slim Fit' },
    { title: 'V-Neck', desc: 'Sleek V-neck cut for modern layering', image: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342172/v-neck-black-front_pnt0pc.png', cat: 'V-Neck' },
  ]

  const activeHeroBanner = banners.length > 0 ? banners[0] : null

  return (
    <div className="anivom-home-root">
      <section className="anivom-hero-editorial">
        <div className="anivom-hero-grid">
          <div className="anivom-hero-text-col reveal">
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
                    Customize Yours
                  </button>
                </>
              ) : (
                <>
                  <button className="anivom-btn-primary" onClick={onNavigateToCatalog}>
                    Shop T-Shirts
                  </button>
                  <button className="anivom-btn-secondary" onClick={() => onNavigateToStudio(null)}>
                    Customize Yours
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="anivom-hero-visual-col reveal" style={{ '--reveal-delay': '120ms' }}>
            <div className="anivom-hero-img-frame">
              <img
                src={
                  activeHeroBanner?.image ||
                  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
                }
                alt={activeHeroBanner?.title || 'ANIVOM Fashion Hero'}
                className="anivom-hero-img"
                fetchPriority="high"
                decoding="async"
              />
              <div className="anivom-hero-img-badge">NEW COLLECTION</div>
            </div>
          </div>
        </div>
      </section>

      <section className="anivom-intro-section">
        <div className="anivom-intro-container reveal">
          <h2 className="anivom-intro-title">REDEFINING CUSTOM STREETWEAR COUTURE</h2>
          <p className="anivom-intro-text">
            ANIVOM merges contemporary oversized fits with custom digital design. Choose from our signature ready-to-wear drops or personalize every layer with your custom graphics, artwork, and text.
          </p>
        </div>
      </section>

      <section className="anivom-styles-section">
        <div className="anivom-section-header reveal">
          <h2 className="anivom-section-title">SHOP BY STYLE</h2>
          <span className="anivom-section-sub">CURATED CATEGORIES & FITS</span>
        </div>

        <div className="anivom-styles-grid">
          {stylesCategories.map((style, idx) => (
            <div
              key={style.title}
              className="anivom-style-tile reveal"
              style={{ '--reveal-delay': `${(idx % 4) * 60}ms` }}
              onClick={() => {
                if (style.cat === 'Custom') {
                  onNavigateToStudio(null)
                } else {
                  onNavigateToCatalog(style.cat)
                }
              }}
            >
              <img src={style.image} alt={style.title} className="anivom-style-img" loading="lazy" decoding="async" />
              <div className="anivom-style-overlay">
                <h3 className="anivom-style-title">{style.title}</h3>
                <p className="anivom-style-desc">{style.desc}</p>
                <span className="anivom-style-arrow">Explore Category &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="anivom-custom-banner">
        <div className="anivom-custom-banner-content reveal">
          <span className="anivom-custom-badge">ANIVOM STUDIO ENGINE</span>
          <h2 className="anivom-custom-heading">MAKE IT YOURS.</h2>
          <div className="anivom-custom-steps">
            {[
              { num: '01', title: 'Select Apparel', desc: 'Choose your garment fit & shade' },
              { num: '02', title: 'Add Artwork', desc: 'Upload graphics or select vector art' },
              { num: '03', title: 'Position & Preview', desc: 'Scale, rotate, and align on canvas' },
              { num: '04', title: 'Wear It', desc: 'Tailored & printed to perfection' },
            ].map((step, idx) => (
              <div key={step.num} className="anivom-step reveal" style={{ '--reveal-delay': `${(idx % 4) * 70}ms` }}>
                <span className="anivom-step-num">{step.num}</span>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
          <button className="anivom-btn-primary" onClick={() => onNavigateToStudio(null)}>
            Customize in Studio &rarr;
          </button>
        </div>
      </section>

      <section className="anivom-statement-section">
        <div className="anivom-statement-box reveal">
          <h2 className="anivom-statement-text">
            &ldquo;DON&rsquo;T JUST WEAR A T-SHIRT. MAKE IT YOURS.&rdquo;
          </h2>
          <span className="anivom-statement-sub">ANIVOM HIGH COUTURE APPAREL</span>
        </div>
      </section>

      <section className="anivom-final-cta-section reveal">
        <h2 className="anivom-cta-title">READY TO WEAR IT YOUR WAY?</h2>
        <p className="anivom-cta-sub">Discover our latest collection or craft your own bespoke design in seconds.</p>
        <div className="anivom-hero-cta-group" style={{ justifyContent: 'center' }}>
          <button className="anivom-btn-primary" onClick={onNavigateToCatalog}>
            Shop the Collection
          </button>
          <button className="anivom-btn-secondary" onClick={() => onNavigateToStudio(null)}>
            Create Your T-Shirt
          </button>
        </div>
      </section>
    </div>
  )
}

export default Home

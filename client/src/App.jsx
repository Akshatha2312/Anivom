import { useState, useEffect } from 'react'
import './App.css'
import Studio from './Studio'
import MyCreations from './MyCreations'
import Cart from './Cart'
import Catalog from './Catalog'
import Checkout from './Checkout'
import Home from './Home'
import ProductDetails from './ProductDetails'
import AuthModal from './AuthModal'
import Account from './Account'
import Orders from './Orders'
import WelcomeModal from './WelcomeModal'
import { API_BASE_URL } from './config'

const TICKER_MESSAGES = [
  'FREE SHIPPING ON SELECTED ORDERS',
  'MAKE IT YOURS WITH ANIVOM STUDIO',
  'WEAR IT YOUR WAY.',
  'NEW DROPS. YOUR STYLE.',
  'DESIGNED BY YOU. MADE FOR YOU.',
]

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [mode, setMode] = useState('login')

  const [view, setView] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [initialCustomization, setInitialCustomization] = useState(null)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  useEffect(() => {
    try {
      const dismissed =
        sessionStorage.getItem('anivom_welcome_dismissed') ||
        localStorage.getItem('anivom_welcome_dismissed')
      if (!dismissed) {
        const timer = setTimeout(() => {
          setShowWelcomeModal(true)
        }, 800)
        return () => clearTimeout(timer)
      }
    } catch (err) {
      //
    }
  }, [])

  const handleDismissWelcome = () => {
    try {
      sessionStorage.setItem('anivom_welcome_dismissed', 'true')
      localStorage.setItem('anivom_welcome_dismissed', 'true')
    } catch (err) {
      // silent
    }
    setShowWelcomeModal(false)
  }

  const openOrders = (orderArg = null) => {
    let targetId = null
    if (typeof orderArg === 'string') {
      targetId = orderArg
    } else if (orderArg && typeof orderArg === 'object' && orderArg._id && typeof orderArg._id === 'string') {
      targetId = orderArg._id
    }
    setSelectedOrderId(targetId)
    setView('orders')
  }

  const [creations, setCreations] = useState([])
  const [loadingCreations, setLoadingCreations] = useState(false)
  const [creationsError, setCreationsError] = useState(null)

  const [cartCount, setCartCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tickerIndex, setTickerIndex] = useState(0)

  useEffect(() => {
    const defaultTitle = 'ANIVOM | Wear It Your Way.'
    const blurTitle = 'Come back to ANIVOM ✦'

    document.title = defaultTitle

    const handleBlur = () => {
      document.title = blurTitle
    }

    const handleFocus = () => {
      document.title = defaultTitle
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TICKER_MESSAGES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.data.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      setUser(null)
    } finally {
      setAuthLoading(false)
    }
  }

  const fetchCartCount = async () => {
    if (!user) {
      setCartCount(0)
      return
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        const items = data.data.cart ? data.data.cart.items || [] : []
        const total = items.reduce((acc, item) => acc + item.quantity, 0)
        setCartCount(total)
      }
    } catch (err) {
      console.error('Failed to fetch cart count', err)
    }
  }

  const fetchCreations = async () => {
    if (!user) return
    setLoadingCreations(true)
    setCreationsError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/customizations`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setCreations(data.data.customizations || [])
      } else {
        const data = await res.json()
        setCreationsError(data.message || 'Failed to load saved creations.')
      }
    } catch (err) {
      setCreationsError('Network error while loading creations.')
    } finally {
      setLoadingCreations(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    fetchCartCount()
  }, [user])

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      setView('catalog')
      setCartCount(0)
    } catch (err) {
      console.error('Logout error', err)
    }
  }

  const openStudio = (product) => {
    setSelectedProduct(product)
    setInitialCustomization(null)
    setView('studio')
  }

  const openMyCreations = () => {
    fetchCreations()
    setView('creations')
  }

  const handleEditCreation = (customization) => {
    setSelectedProduct(customization.product)
    setInitialCustomization(customization)
    setView('studio')
  }

  const handleDeleteCreation = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/customizations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setCreations((prev) => prev.filter((item) => item._id !== id))
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to delete customization.')
      }
    } catch (err) {
      alert('Error connecting to backend to delete customization.')
    }
  }

  if (view === 'studio') {
    return (
      <Studio
        product={selectedProduct}
        user={user}
        initialCustomization={initialCustomization}
        onBack={() => setView('catalog')}
        onCartUpdated={fetchCartCount}
        onNavigateToCart={() => {
          fetchCartCount()
          setView('cart')
        }}
      />
    )
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#FFFDF8', display: 'flex', flexDirection: 'column' }}>
      <header className="anivom-shell-header">
        <div className="anivom-ticker-bar">
          <span className="anivom-ticker-content">✦ {TICKER_MESSAGES[tickerIndex]} ✦</span>
        </div>

        <div className="anivom-nav-container">
          <div className="anivom-brand-group" onClick={() => setView('home')}>
            <h1 className="anivom-wordmark">ANIVOM</h1>
            <span className="anivom-tagline">Wear It Your Way.</span>
            <span className="anivom-tamil-accent">அனிவோம்</span>
          </div>

          <nav className="anivom-desktop-nav" aria-label="Main Navigation">
            <button
              onClick={() => setView('home')}
              className={`anivom-nav-link ${view === 'home' ? 'active' : ''}`}
            >
              Home
            </button>

            <button
              onClick={() => setView('catalog')}
              className={`anivom-nav-link ${view === 'catalog' ? 'active' : ''}`}
            >
              Catalog
            </button>

            <button
              onClick={() => openStudio(null)}
              className="anivom-nav-link anivom-badge-studio"
            >
              ✦ Studio
            </button>

            {user && (
              <>
                <button
                  onClick={() => openOrders(null)}
                  className={`anivom-nav-link ${view === 'orders' ? 'active' : ''}`}
                >
                  My Orders
                </button>
                <button
                  onClick={openMyCreations}
                  className={`anivom-nav-link ${view === 'creations' ? 'active' : ''}`}
                >
                  My Creations
                </button>
              </>
            )}

            <button
              onClick={() => setView('cart')}
              className={`anivom-nav-link ${view === 'cart' ? 'active' : ''}`}
            >
              Bag ({cartCount})
            </button>

            {authLoading ? (
              <span style={{ fontSize: '12px', color: '#999' }}>Loading...</span>
            ) : user ? (
              <div className="anivom-auth-user">
                <button
                  onClick={() => setView('account')}
                  className={`anivom-user-greeting-btn ${view === 'account' ? 'active' : ''}`}
                  style={{ background: 'transparent', border: 'none', color: '#FFFDF8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}
                >
                  Account (<strong>{user.name}</strong>)
                </button>
                <button onClick={handleLogout} className="anivom-btn-logout">
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setView('account')}
                className={`anivom-nav-link ${view === 'account' ? 'active' : ''}`}
                style={{ border: '1px solid #FFFDF8', marginLeft: '8px' }}
              >
                Account / Sign In
              </button>
            )}
          </nav>

          <button
            className="anivom-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        <div className={`anivom-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <button onClick={() => { setView('home'); setMobileMenuOpen(false); }} className="anivom-nav-link">
            Home
          </button>
          <button onClick={() => { setView('catalog'); setMobileMenuOpen(false); }} className="anivom-nav-link">
            Catalog
          </button>
          <button onClick={() => { openStudio(null); setMobileMenuOpen(false); }} className="anivom-nav-link anivom-badge-studio">
            ✦ Studio
          </button>
          <button onClick={() => { setView('account'); setMobileMenuOpen(false); }} className="anivom-nav-link">
            Account
          </button>
          {user && (
            <>
              <button onClick={() => { openOrders(null); setMobileMenuOpen(false); }} className="anivom-nav-link">
                My Orders
              </button>
              <button onClick={() => { openMyCreations(); setMobileMenuOpen(false); }} className="anivom-nav-link">
                My Creations
              </button>
            </>
          )}
          <button onClick={() => { setView('cart'); setMobileMenuOpen(false); }} className="anivom-nav-link">
            Bag ({cartCount})
          </button>
          {!user && (
            <button onClick={() => { setView('auth'); setMode('login'); setMobileMenuOpen(false); }} className="anivom-nav-link">
              Sign In / Register
            </button>
          )}
          {user && (
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="anivom-btn-logout" style={{ marginTop: '8px' }}>
              Log Out ({user.name})
            </button>
          )}
        </div>
      </header>

      {view === 'auth' && (
        <AuthModal
          user={user}
          mode={mode}
          onClose={() => setView('catalog')}
          onNavigateToCatalog={() => setView('catalog')}
          onAuthSuccess={(userData) => {
            setUser(userData)
            fetchCartCount()
            setView('account')
          }}
        />
      )}

      <WelcomeModal
        isOpen={showWelcomeModal && (view === 'home' || view === 'catalog')}
        user={user}
        onClose={handleDismissWelcome}
        onShopCollection={() => {
          setView('catalog')
          handleDismissWelcome()
        }}
        onCreateDesign={() => {
          openStudio(null)
          handleDismissWelcome()
        }}
      />

      <main className="anivom-shell-main">
        {view === 'home' && (
          <Home
            openStudio={openStudio}
            onSelectProduct={(product) => {
              setSelectedProduct(product)
              setView('product')
            }}
            onNavigateCatalog={() => setView('catalog')}
          />
        )}

        {view === 'account' && (
          <Account
            user={user}
            onBackToCatalog={() => setView('catalog')}
            onNavigateToCreations={openMyCreations}
            onNavigateToOrders={openOrders}
            onLoginRedirect={() => { setView('auth'); setMode('login'); }}
            onLogout={handleLogout}
          />
        )}

        {view === 'orders' && (
          <Orders
            user={user}
            initialOrderId={selectedOrderId}
            onBackToAccount={() => setView('account')}
            onBackToCatalog={() => setView('catalog')}
            onOpenStudio={openStudio}
            onLoginRedirect={() => { setView('auth'); setMode('login'); }}
          />
        )}

        {view === 'product' && (
          <ProductDetails
            user={user}
            product={selectedProduct}
            productId={selectedProduct ? selectedProduct._id : null}
            initialProduct={selectedProduct}
            openStudio={openStudio}
            onCartUpdated={fetchCartCount}
            onBackToCatalog={() => setView('catalog')}
            onSelectProduct={(product) => {
              setSelectedProduct(product)
              setView('product')
            }}
          />
        )}

        {view === 'creations' && (
          <MyCreations
            user={user}
            customizations={creations}
            loading={loadingCreations}
            error={creationsError}
            onEdit={handleEditCreation}
            onDelete={handleDeleteCreation}
            onBackToCatalog={() => setView('catalog')}
            onLoginRedirect={() => { setView('auth'); setMode('login'); }}
            onRetry={fetchCreations}
          />
        )}

        {view === 'cart' && (
          <Cart
            user={user}
            onContinueShopping={() => setView('catalog')}
            onLoginRedirect={() => { setView('catalog'); setMode('login'); }}
            onProceedToCheckout={() => setView('checkout')}
            onCartUpdated={fetchCartCount}
            onSelectProduct={(product) => {
              setSelectedProduct(product)
              setView('product')
            }}
          />
        )}

        {view === 'checkout' && (
          <Checkout
            user={user}
            onContinueShopping={() => setView('catalog')}
            onReturnToCart={() => setView('cart')}
            onLoginRedirect={() => { setView('catalog'); setMode('login'); }}
            onNavigateToOrders={openOrders}
          />
        )}

        {view === 'catalog' && (
          <Catalog
            user={user}
            openStudio={openStudio}
            onCartUpdated={fetchCartCount}
            onSelectProduct={(product) => {
              setSelectedProduct(product)
              setView('product')
            }}
          />
        )}
      </main>

      <footer className="anivom-shell-footer">
        <div className="anivom-footer-container">
          <div>
            <h3 className="anivom-footer-brand-title">ANIVOM</h3>
            <div className="anivom-footer-tagline">Wear It Your Way.</div>
            <p className="anivom-footer-desc">
              ANIVOM is a modern high-couture custom apparel brand allowing customers to design bespoke graphic oversized and classic fit garments.
            </p>
          </div>

          <div>
            <h4 className="anivom-footer-col-title">Navigation</h4>
            <ul className="anivom-footer-links">
              <li className="anivom-footer-link" onClick={() => setView('catalog')}>Catalog</li>
              <li className="anivom-footer-link" onClick={() => openStudio(null)}>ANIVOM Studio</li>
              <li className="anivom-footer-link" onClick={() => setView('cart')}>Bag ({cartCount})</li>
              {user && <li className="anivom-footer-link" onClick={openMyCreations}>My Creations</li>}
            </ul>
          </div>

          <div>
            <h4 className="anivom-footer-col-title">Customer Care</h4>
            <ul className="anivom-footer-links">
              <li className="anivom-footer-link">Order Status</li>
              <li className="anivom-footer-link">Shipping & Returns</li>
              <li className="anivom-footer-link">Size Guide</li>
              <li className="anivom-footer-link">Care Instructions</li>
            </ul>
          </div>

          <div>
            <h4 className="anivom-footer-col-title">Identity</h4>
            <div style={{ fontSize: '13px', color: '#b3b3b3', lineHeight: '1.6' }}>
              ANIVOM Custom Studio<br />
              High Couture Apparel<br />
              <span style={{ color: '#C6A15B', fontSize: '12px' }}>அனிவோம் - தமிழ் அடையாளம்</span>
            </div>
          </div>
        </div>

        <div className="anivom-footer-bottom">
          <div>&copy; {new Date().getFullYear()} ANIVOM. All rights reserved.</div>
          <div className="anivom-signature">with love, akshu ❤️</div>
        </div>
      </footer>
    </div>
  )
}

export default App

import { useState, useEffect, useRef } from 'react'
import './App.css'
import Studio from './Studio'
import MyCreations from './MyCreations'
import Wishlist from './Wishlist'
import Cart from './Cart'
import Catalog from './Catalog'
import Checkout from './Checkout'
import Home from './Home'
import ProductDetails from './ProductDetails'
import AuthModal from './AuthModal'
import Account from './Account'
import Orders from './Orders'
import WelcomeModal from './WelcomeModal'
import BagToast from './BagToast'
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
  const [showBagToast, setShowBagToast] = useState(false)
  const bagToastTimerRef = useRef(null)

  const triggerBagToast = () => {
    if (bagToastTimerRef.current) {
      clearTimeout(bagToastTimerRef.current)
    }
    setShowBagToast(true)
    bagToastTimerRef.current = setTimeout(() => {
      setShowBagToast(false)
    }, 3500)
  }

  const handleCartItemAdded = () => {
    fetchCartCount()
    triggerBagToast()
  }

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

  const openStudio = (product, options = {}) => {
    setSelectedProduct(product)
    if (options.initialColor || options.initialSize) {
      setInitialCustomization({
        colour: options.initialColor,
        size: options.initialSize,
      })
    } else {
      setInitialCustomization(null)
    }
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

  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountDropdownOpen && !e.target.closest('.anivom-account-dropdown-wrapper')) {
        setAccountDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [accountDropdownOpen])

  if (view === 'studio') {
    return (
      <>
        <Studio
          product={selectedProduct}
          user={user}
          initialCustomization={initialCustomization}
          onBack={() => setView('catalog')}
          onCartUpdated={handleCartItemAdded}
          onNavigateToCart={() => {
            fetchCartCount()
            setView('cart')
          }}
          onAuthSuccess={(userData) => {
            setUser(userData)
            fetchCartCount()
          }}
        />
        {showBagToast && (
          <BagToast
            onClick={() => {
              setShowBagToast(false)
              setView('cart')
            }}
            onClose={() => setShowBagToast(false)}
          />
        )}
      </>
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
            <div className="anivom-brand-sub">
              <span className="anivom-tagline">Wear It Your Way.</span>
              <span className="anivom-tamil-accent">அனிவோம்</span>
            </div>
          </div>

          <nav className="anivom-center-nav" aria-label="Main Navigation">
            <button
              onClick={() => setView('home')}
              className={`anivom-nav-link ${view === 'home' ? 'active' : ''}`}
            >
              Home
            </button>

            <button
              onClick={() => setView('catalog')}
              className={`anivom-nav-link ${view === 'catalog' || view === 'product' ? 'active' : ''}`}
            >
              Shop
            </button>

            <button
              onClick={() => openStudio(null)}
              className={`anivom-nav-link ${view === 'studio' ? 'active' : ''}`}
            >
              Studio
            </button>
          </nav>

          <div className="anivom-right-actions">
            <button
              onClick={() => setView('cart')}
              className={`anivom-icon-action-btn ${view === 'cart' ? 'active' : ''}`}
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <span className="anivom-action-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </span>
              <span className="anivom-action-label">Bag</span>
              {cartCount > 0 && <span className="anivom-badge-count">{cartCount}</span>}
            </button>

            {authLoading ? (
              <span style={{ fontSize: '11px', color: '#999', letterSpacing: '0.05em' }}>...</span>
            ) : user ? (
              <div className="anivom-account-dropdown-wrapper">
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className={`anivom-account-btn ${view === 'account' || view === 'orders' || view === 'creations' ? 'active' : ''}`}
                  aria-expanded={accountDropdownOpen}
                  aria-label="Account Menu"
                >
                  <span className="anivom-user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                  <span className="anivom-user-name">{user.name}</span>
                  <span className="anivom-dropdown-caret">▾</span>
                </button>

                {accountDropdownOpen && (
                  <div className="anivom-account-menu">
                    <div className="anivom-menu-header">
                      <div className="anivom-menu-user-name">{user.name}</div>
                      <div className="anivom-menu-user-email">{user.email}</div>
                    </div>
                    <div className="anivom-menu-divider" />
                    <button
                      className="anivom-menu-item"
                      onClick={() => {
                        setView('account')
                        setAccountDropdownOpen(false)
                      }}
                    >
                      ✦ My Profile
                    </button>
                    <button
                      className="anivom-menu-item"
                      onClick={() => {
                        openOrders(null)
                        setAccountDropdownOpen(false)
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                      My Orders
                    </button>
                    <button
                      className="anivom-menu-item"
                      onClick={() => {
                        setView('wishlist')
                        setAccountDropdownOpen(false)
                      }}
                    >
                      <span style={{ fontSize: '14px', marginRight: '6px', verticalAlign: 'middle' }}>❤️</span>
                      My Wishlist
                    </button>
                    <button
                      className="anivom-menu-item"
                      onClick={() => {
                        openMyCreations()
                        setAccountDropdownOpen(false)
                      }}
                    >
                      My Creations
                    </button>
                    <div className="anivom-menu-divider" />
                    <button
                      className="anivom-menu-item logout"
                      onClick={() => {
                        handleLogout()
                        setAccountDropdownOpen(false)
                      }}
                    >
                      ↳ Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setView('account')}
                className={`anivom-btn-auth-link ${view === 'account' ? 'active' : ''}`}
              >
                Sign In
              </button>
            )}

            <button
              className="anivom-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        <div className={`anivom-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <button onClick={() => { setView('home'); setMobileMenuOpen(false); }} className={`anivom-mobile-link ${view === 'home' ? 'active' : ''}`}>
            Home
          </button>
          <button onClick={() => { setView('catalog'); setMobileMenuOpen(false); }} className={`anivom-mobile-link ${view === 'catalog' ? 'active' : ''}`}>
            Shop / Catalog
          </button>
          <button onClick={() => { openStudio(null); setMobileMenuOpen(false); }} className="anivom-mobile-link studio">
            ✦ ANIVOM Studio
          </button>
          <button onClick={() => { setView('cart'); setMobileMenuOpen(false); }} className={`anivom-mobile-link ${view === 'cart' ? 'active' : ''}`}>
            Shopping Bag ({cartCount})
          </button>

          <div className="anivom-mobile-divider" />

          {user ? (
            <>
              <div className="anivom-mobile-user-info">Signed in as <strong>{user.name}</strong></div>
              <button onClick={() => { setView('account'); setMobileMenuOpen(false); }} className="anivom-mobile-link">
                My Profile
              </button>
              <button onClick={() => { openOrders(null); setMobileMenuOpen(false); }} className="anivom-mobile-link">
                My Orders
              </button>
              <button onClick={() => { setView('wishlist'); setMobileMenuOpen(false); }} className="anivom-mobile-link">
                My Wishlist
              </button>
              <button onClick={() => { openMyCreations(); setMobileMenuOpen(false); }} className="anivom-mobile-link">
                My Creations
              </button>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="anivom-mobile-link logout">
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => { setView('account'); setMobileMenuOpen(false); }} className="anivom-mobile-link auth">
              Sign In / Register
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
            onNavigateToStudio={openStudio}
            onCartUpdated={handleCartItemAdded}
            onSelectProduct={(product) => {
              setSelectedProduct(product)
              setView('product')
            }}
            onNavigateToCatalog={() => setView('catalog')}
          />
        )}

        {view === 'account' && (
          <Account
            user={user}
            onBackToCatalog={() => setView('catalog')}
            onNavigateToCreations={openMyCreations}
            onNavigateToOrders={openOrders}
            onNavigateToWishlist={() => setView('wishlist')}
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
            onCartUpdated={handleCartItemAdded}
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

        {view === 'wishlist' && (
          <Wishlist
            user={user}
            onBackToCatalog={() => setView('catalog')}
            onLoginRedirect={() => { setView('auth'); setMode('login'); }}
            onSelectProduct={(product) => {
              setSelectedProduct(product)
              setView('product')
            }}
            onCartUpdated={handleCartItemAdded}
            openStudio={openStudio}
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
            onCartUpdated={handleCartItemAdded}
            onSelectProduct={(product) => {
              setSelectedProduct(product)
              setView('product')
            }}
            onAuthSuccess={(userData) => {
              setUser(userData)
              fetchCartCount()
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

      {showBagToast && (
        <BagToast
          onClick={() => {
            setShowBagToast(false)
            setView('cart')
          }}
          onClose={() => setShowBagToast(false)}
        />
      )}
    </div>
  )
}

export default App

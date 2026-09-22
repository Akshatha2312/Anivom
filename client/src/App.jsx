import { useState, useEffect } from 'react'
import './App.css'
import Studio from './Studio'
import MyCreations from './MyCreations'
import Cart from './Cart'
import Catalog from './Catalog'
import Checkout from './Checkout'
import { API_BASE_URL } from './config'

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const [view, setView] = useState('catalog')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [initialCustomization, setInitialCustomization] = useState(null)

  const [creations, setCreations] = useState([])
  const [loadingCreations, setLoadingCreations] = useState(false)
  const [creationsError, setCreationsError] = useState(null)

  const [cartCount, setCartCount] = useState(0)

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

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setUser(data.data.user)
        setSuccessMsg('Registration successful!')
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      setError('Network error during registration')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setUser(data.data.user)
        setSuccessMsg('Login successful!')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError('Network error during login')
    }
  }

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
        onNavigateToCart={() => {
          fetchCartCount()
          setView('cart')
        }}
      />
    )
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#FFFDF8', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#111111', color: '#FFFDF8' }}>
        <h2 style={{ margin: 0, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }} onClick={() => setView('catalog')}>
          ANIVOM
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setView('catalog')}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: view === 'catalog' ? '#7A1F3D' : 'transparent', color: '#FFFDF8', border: 'none', borderRadius: '4px', fontWeight: '600' }}
          >
            Catalog
          </button>

          <button
            onClick={() => setView('cart')}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: view === 'cart' ? '#7A1F3D' : 'transparent', color: '#FFFDF8', border: 'none', borderRadius: '4px', fontWeight: '600' }}
          >
            Bag ({cartCount})
          </button>

          {user && (
            <button
              onClick={openMyCreations}
              style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: view === 'creations' ? '#C6A15B' : '#C6A15B', color: '#111111', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
            >
              My Creations
            </button>
          )}

          {authLoading ? (
            <span>Checking auth...</span>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '8px' }}>
              <span>Hi, <strong>{user.name}</strong></span>
              <button
                onClick={handleLogout}
                style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '4px' }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
              <button
                onClick={() => { setView('catalog'); setMode('login'); }}
                style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#FFFDF8', color: '#111111', border: 'none', borderRadius: '4px', fontWeight: '600' }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </header>

      {!user && !authLoading && view === 'catalog' && (
        <div style={{ maxWidth: '480px', margin: '20px auto', padding: '24px', background: '#F7F2E8', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button
              onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
              style={{ fontWeight: mode === 'login' ? 'bold' : 'normal', padding: '6px 12px', cursor: 'pointer' }}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
              style={{ fontWeight: mode === 'register' ? 'bold' : 'normal', padding: '6px 12px', cursor: 'pointer' }}
            >
              Register
            </button>
          </div>

          {error && <p style={{ color: '#e53e3e', marginBottom: '10px' }}>{error}</p>}
          {successMsg && <p style={{ color: '#38a169', marginBottom: '10px' }}>{successMsg}</p>}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            {mode === 'register' && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
            )}

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '10px', backgroundColor: '#111111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
            >
              {mode === 'login' ? 'Log In' : 'Register Account'}
            </button>
          </form>
        </div>
      )}

      {view === 'creations' && (
        <MyCreations
          customizations={creations}
          loading={loadingCreations}
          error={creationsError}
          onEdit={handleEditCreation}
          onDelete={handleDeleteCreation}
          onBackToCatalog={() => setView('catalog')}
        />
      )}

      {view === 'cart' && (
        <Cart
          user={user}
          onContinueShopping={() => setView('catalog')}
          onLoginRedirect={() => { setView('catalog'); setMode('login'); }}
          onProceedToCheckout={() => setView('checkout')}
        />
      )}

      {view === 'checkout' && (
        <Checkout
          user={user}
          onContinueShopping={() => setView('catalog')}
          onReturnToCart={() => setView('cart')}
          onLoginRedirect={() => { setView('catalog'); setMode('login'); }}
        />
      )}

      {view === 'catalog' && (
        <Catalog
          user={user}
          openStudio={openStudio}
          onCartUpdated={fetchCartCount}
        />
      )}
    </div>
  )
}

export default App

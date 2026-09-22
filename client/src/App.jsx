import { useState, useEffect } from 'react'
import './App.css'
import Studio from './Studio'
import MyCreations from './MyCreations'

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
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [initialCustomization, setInitialCustomization] = useState(null)

  const [creations, setCreations] = useState([])
  const [loadingCreations, setLoadingCreations] = useState(false)
  const [creationsError, setCreationsError] = useState(null)

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/me', {
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

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const res = await fetch('http://localhost:5000/api/v1/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.data.products || [])
      }
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchCreations = async () => {
    if (!user) return
    setLoadingCreations(true)
    setCreationsError(null)
    try {
      const res = await fetch('http://localhost:5000/api/v1/customizations', {
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
    fetchProducts()
  }, [])

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      setSuccessMsg('Registration successful! Please log in.')
      setMode('login')
      setPassword('')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Login failed')
      }

      setName('')
      setEmail('')
      setPassword('')
      await fetchCurrentUser()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
    } finally {
      setUser(null)
      setView('catalog')
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
    const targetProduct = customization.product && typeof customization.product === 'object'
      ? customization.product
      : products.find((p) => p._id === customization.product) || { _id: customization.product, name: 'Custom Product', basePrice: 0 }

    setSelectedProduct(targetProduct)
    setInitialCustomization(customization)
    setView('studio')
  }

  const handleDeleteCreation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customization?')) {
      return
    }

    try {
      const res = await fetch(`http://localhost:5000/api/v1/customizations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || 'Failed to delete customization.')
        return
      }

      setCreations((prev) => prev.filter((item) => item._id !== id))
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
      />
    )
  }

  if (view === 'creations') {
    return (
      <MyCreations
        customizations={creations}
        loading={loadingCreations}
        error={creationsError}
        onEdit={handleEditCreation}
        onDelete={handleDeleteCreation}
        onBackToCatalog={() => setView('catalog')}
      />
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <h2 style={{ margin: 0 }}>ANIVOM Portal</h2>
        <div>
          {authLoading ? (
            <span>Checking auth...</span>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button
                onClick={openMyCreations}
                style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#805ad5', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
              >
                My Creations
              </button>
              <span>Hi, <strong>{user.name}</strong></span>
              <button
                onClick={handleLogout}
                style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '4px' }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '14px', color: '#666' }}>Not logged in</span>
          )}
        </div>
      </header>

      {!user && !authLoading && (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '30px' }}>
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
                <label style={{ display: 'block', marginBottom: '4px' }}>Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '10px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {mode === 'login' ? 'Log In' : 'Register'}
            </button>
          </form>
        </div>
      )}

      <section>
        <h3>Product Catalog</h3>
        {loadingProducts ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found in catalog.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginTop: '15px' }}>
            {products.map((product) => (
              <div
                key={product._id}
                style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '180px', backgroundColor: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', marginBottom: '10px' }}>
                      No Image
                    </div>
                  )}
                  <h4 style={{ margin: '0 0 5px 0' }}>{product.name}</h4>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>₹{product.basePrice}</p>
                </div>
                <button
                  onClick={() => openStudio(product)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#805ad5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Customize in Studio &rarr;
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default App



import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

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

  useEffect(() => {
    fetchCurrentUser()
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
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>ANIVOM Customer Portal</h2>

      {authLoading ? (
        <p>Checking authentication status...</p>
      ) : user ? (
        <div style={{ padding: '20px', border: '1px solid #38a169', borderRadius: '8px', backgroundColor: '#f0fff4' }}>
          <h3>Welcome, {user.name}!</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            Log Out
          </button>
        </div>
      ) : (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
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
    </div>
  )
}

export default App

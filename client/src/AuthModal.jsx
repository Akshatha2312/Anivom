import { useState } from 'react'
import './AuthModal.css'
import { API_BASE_URL } from './config'

function AuthModal({ user, mode: initialMode = 'login', onClose, onAuthSuccess, onNavigateToCatalog }) {
  const [mode, setMode] = useState(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  if (user) {
    return (
      <div className="anivom-auth-page">
        <div className="anivom-auth-card-logged">
          <h2 className="anivom-auth-heading">ALREADY SIGNED IN</h2>
          <p className="anivom-auth-desc">You are logged in as <strong>{user.email}</strong>.</p>
          <div className="anivom-auth-actions-logged">
            <button className="anivom-auth-btn-primary" onClick={onNavigateToCatalog || onClose}>
              Explore Catalog &rarr;
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!email || !password) {
      setError('Please provide both email address and password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (res.ok) {
        setSuccessMsg('Welcome back to ANIVOM!')
        if (onAuthSuccess) onAuthSuccess(data.data.user)
      } else {
        setError(data.message || 'Invalid email or password.')
      }
    } catch (err) {
      setError('Network error connecting to authentication server.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!name || !email || !password) {
      setError('Please fill in all required registration fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter passwords.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      if (res.ok) {
        setSuccessMsg('Account created successfully! Welcome to ANIVOM.')
        if (onAuthSuccess) onAuthSuccess(data.data.user)
      } else {
        setError(data.message || 'Registration failed. Email may already be in use.')
      }
    } catch (err) {
      setError('Network error connecting to registration server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="anivom-auth-page">
      <div className="anivom-auth-split-wrapper">
        <div className="anivom-auth-visual-side">
          <div className="anivom-auth-brand-area">
            <span className="anivom-auth-brand-logo">ANIVOM</span>
            <span className="anivom-auth-tagline">Wear It Your Way.</span>
            <p className="anivom-auth-manifesto">
              Join the bespoke fashion movement. Create custom streetwear, order classic heavyweight basics, and manage your saved creations.
            </p>
            <div className="anivom-auth-tamil-accent">
              "உன் Style. உன் Rules."
            </div>
          </div>

          <button className="anivom-auth-back-link" onClick={onNavigateToCatalog || onClose}>
            &larr; Back to ANIVOM
          </button>
        </div>

        <div className="anivom-auth-form-side">
          <div className="anivom-auth-header-toggle">
            <button
              type="button"
              className={`anivom-auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`anivom-auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
            >
              Create Account
            </button>
          </div>

          {error && <div className="anivom-auth-notice error">{error}</div>}
          {successMsg && <div className="anivom-auth-notice success">{successMsg}</div>}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="anivom-auth-form">
              <h2 className="anivom-auth-form-title">WELCOME BACK</h2>
              <p className="anivom-auth-form-sub">Sign in with your email and password.</p>

              <div className="anivom-auth-field">
                <label className="anivom-auth-label">Email Address</label>
                <input
                  type="email"
                  className="anivom-auth-input"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="anivom-auth-field">
                <label className="anivom-auth-label">Password</label>
                <div className="anivom-password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="anivom-auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="anivom-pwd-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button type="submit" className="anivom-auth-submit" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <p className="anivom-auth-switch-text">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="anivom-auth-switch-btn"
                  onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
                >
                  Create one now
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="anivom-auth-form">
              <h2 className="anivom-auth-form-title">JOIN ANIVOM</h2>
              <p className="anivom-auth-form-sub">Create your account to start designing and ordering.</p>

              <div className="anivom-auth-field">
                <label className="anivom-auth-label">Full Name</label>
                <input
                  type="text"
                  className="anivom-auth-input"
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="anivom-auth-field">
                <label className="anivom-auth-label">Email Address</label>
                <input
                  type="email"
                  className="anivom-auth-input"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="anivom-auth-field">
                <label className="anivom-auth-label">Password</label>
                <div className="anivom-password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="anivom-auth-input"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="anivom-pwd-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="anivom-auth-field">
                <label className="anivom-auth-label">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="anivom-auth-input"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="anivom-auth-submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="anivom-auth-switch-text">
                Already have an account?{' '}
                <button
                  type="button"
                  className="anivom-auth-switch-btn"
                  onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal

import { useState, useEffect, useRef } from 'react'
import './AuthModal.css'
import { API_BASE_URL } from './config'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function AuthModal({ user, mode: initialMode = 'login', onClose, onAuthSuccess, onNavigateToCatalog, isOverlay = false }) {
  const [mode, setMode] = useState(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [referralCode, setReferralCode] = useState(() => {
    return localStorage.getItem('anivom_ref_code') || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [showDemoPopup, setShowDemoPopup] = useState(true)

  const googleButtonRef = useRef(null)

  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      setError('Google Sign-In failed to return credentials. Please try again.')
      return
    }

    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      const storedRef = localStorage.getItem('anivom_ref_code') || referralCode || ''
      const payload = { credential: response.credential }
      if (storedRef && storedRef.trim()) {
        payload.referralCode = storedRef.trim().toUpperCase()
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.removeItem('anivom_ref_code')
        setSuccessMsg('Signed in with Google successfully!')
        if (onAuthSuccess) onAuthSuccess(data.data.user)
      } else {
        setError(data.message || 'Google authentication failed. Please try again.')
      }
    } catch (err) {
      setError('Network error connecting to authentication server.')
    } finally {
      setLoading(false)
    }
  }

  // Load Google Identity Services script if not loaded
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || user) return

    const scriptId = 'google-gsi-script'
    let script = document.getElementById(scriptId)

    const initGsi = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        })
        renderGoogleButton()
      }
    }

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initGsi
      document.head.appendChild(script)
    } else if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
      })
      renderGoogleButton()
    }
  }, [mode, user])

  const renderGoogleButton = () => {
    if (googleButtonRef.current && window.google && window.google.accounts && window.google.accounts.id) {
      googleButtonRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: mode === 'login' ? 'signin_with' : 'signup_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '100%',
      })
    }
  }

  // Render Google button whenever container ref attaches
  useEffect(() => {
    renderGoogleButton()
  }, [mode, loading])

  if (user) {
    return (
      <div className={isOverlay ? "anivom-welcome-overlay" : "anivom-auth-page"}>
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

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter passwords.')
      return
    }

    setLoading(true)
    try {
      const payload = { name, email, password }
      const storedRef = localStorage.getItem('anivom_ref_code') || referralCode || ''
      if (storedRef && storedRef.trim()) {
        payload.referralCode = storedRef.trim().toUpperCase()
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.removeItem('anivom_ref_code')
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

  const contentMarkup = (
    <div className="anivom-auth-split-wrapper" style={{ position: 'relative' }}>
      {isOverlay && onClose && (
        <button
          className="anivom-welcome-close-btn"
          onClick={onClose}
          aria-label="Close Authentication Modal"
          style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 20 }}
        >
          ✕
        </button>
      )}
      <div className="anivom-auth-visual-side">
        <div className="anivom-auth-brand-area">
          <span className="anivom-auth-brand-logo">ANIVOM</span>
          <span className="anivom-auth-tagline">Wear It Your Way.</span>
          <p className="anivom-auth-manifesto">
            Join the bespoke fashion movement. Create custom streetwear, order classic heavyweight basics, and manage your saved creations.
          </p>
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

        {showDemoPopup && mode === 'login' && (
          <div className="anivom-auth-dev-helper">
            <div className="anivom-dev-helper-header">
              <span className="anivom-dev-helper-title">DEMO LOGIN</span>
              <button
                type="button"
                className="anivom-dev-close-btn"
                onClick={() => setShowDemoPopup(false)}
                aria-label="Dismiss demo login notice"
              >
                ✕
              </button>
            </div>
            <div className="anivom-dev-helper-credentials">
              <span>Email: <strong>anivom1@gmail.com</strong></span>
              <span>Password: <strong>Anivom@1</strong></span>
            </div>
            <p className="anivom-dev-helper-subtext">Use these demo credentials to test the customer account.</p>
          </div>
        )}

        {mode === 'login' ? (
          <>
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
            </form>

            <div className="anivom-auth-divider">
              <span>OR CONTINUE WITH GOOGLE</span>
            </div>

            <div className="anivom-google-auth-container">
              <div
                ref={googleButtonRef}
                className={`anivom-google-btn-wrapper ${loading ? 'disabled' : ''}`}
              />
              {loading && <div className="anivom-google-loading">Authenticating with Google...</div>}
            </div>

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
          </>
        ) : (
          <>
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
                    placeholder="At least 8 characters"
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

              <div className="anivom-auth-field">
                <label className="anivom-auth-label">Referral Code (Optional)</label>
                <input
                  type="text"
                  className="anivom-auth-input"
                  placeholder="e.g. ANIVOM7X9K2P"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
              </div>

              <button type="submit" className="anivom-auth-submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="anivom-auth-divider">
              <span>OR CONTINUE WITH GOOGLE</span>
            </div>

            <div className="anivom-google-auth-container">
              <div
                ref={googleButtonRef}
                className={`anivom-google-btn-wrapper ${loading ? 'disabled' : ''}`}
              />
              {loading && <div className="anivom-google-loading">Authenticating with Google...</div>}
            </div>

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
          </>
        )}
      </div>
    </div>
  )

  if (isOverlay) {
    return (
      <div
        className="anivom-welcome-overlay"
        onClick={(e) => {
          if (e.target.classList.contains('anivom-welcome-overlay') && onClose) {
            onClose()
          }
        }}
        role="dialog"
        aria-modal="true"
      >
        {contentMarkup}
      </div>
    )
  }

  return <div className="anivom-auth-page">{contentMarkup}</div>
}

export default AuthModal

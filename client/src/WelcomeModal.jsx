import { useState, useEffect } from 'react'
import './WelcomeModal.css'

function WelcomeModal({
  isOpen,
  user,
  onClose,
  onShopCollection,
  onCreateDesign,
}) {
  const [email, setEmail] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleShopClick = () => {
    onShopCollection()
    onClose()
  }

  const handleDesignClick = () => {
    onCreateDesign()
    onClose()
  }

  return (
    <div
      className="anivom-welcome-overlay"
      onClick={(e) => {
        if (e.target.classList.contains('anivom-welcome-overlay')) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="anivom-welcome-title"
    >
      <div className="anivom-welcome-modal-card">
        <button
          className="anivom-welcome-close-btn"
          onClick={onClose}
          aria-label="Close Welcome Popup"
        >
          ✕
        </button>

        <div className="anivom-welcome-split">
          <div className="anivom-welcome-visual-col">
            <div className="anivom-welcome-visual-inner">
              <span className="anivom-welcome-brand-tag">ANIVOM COUTURE</span>
              <h2 className="anivom-welcome-visual-title">WEAR IT YOUR WAY</h2>
              <div className="anivom-welcome-gold-line"></div>
              <p className="anivom-welcome-visual-desc">
                High-couture bespoke apparel engineered for individual expression.
              </p>
              <span className="anivom-welcome-tamil-accent">அனிவோம்</span>
            </div>
          </div>

          <div className="anivom-welcome-content-col">
            <div className="anivom-welcome-header-group">
              <span className="anivom-welcome-kicker">WELCOME TO ANIVOM</span>
              <h1 id="anivom-welcome-title" className="anivom-welcome-head">
                YOUR FIRST ANIVOM PIECE AWAITS.
              </h1>
              <p className="anivom-welcome-sub">
                Explore our curated fashion catalog or create custom oversized garments in ANIVOM Studio.
              </p>
            </div>

            <div className="anivom-welcome-offer-box">
              <span className="anivom-offer-badge">FIRST VISIT EXPERIENCE</span>
              <div className="anivom-offer-title">COMPLIMENTARY SHIPPING & FIT ASSISTANCE</div>
              <div className="anivom-offer-desc">
                Every custom garment includes premium editorial packaging and dedicated garment care.
              </div>
            </div>

            {user ? (
              <div className="anivom-welcome-user-info">
                <span>Logged in as <strong>{user.email}</strong></span>
              </div>
            ) : (
              <div className="anivom-welcome-email-group">
                <label className="anivom-welcome-email-label" htmlFor="welcome-email-input">
                  Optional: Email for drops & updates
                </label>
                <input
                  id="welcome-email-input"
                  type="email"
                  className="anivom-welcome-email-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            <div className="anivom-welcome-actions">
              <button
                className="anivom-btn-welcome-primary"
                onClick={handleShopClick}
              >
                SHOP THE COLLECTION &rarr;
              </button>
              <button
                className="anivom-btn-welcome-secondary"
                onClick={handleDesignClick}
              >
                CREATE YOUR DESIGN
              </button>
            </div>

            <p className="anivom-welcome-legal">
              By continuing, you agree to ANIVOM's Terms & Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeModal

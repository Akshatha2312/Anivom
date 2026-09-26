import { useState, useEffect } from 'react'
import './Referrals.css'
import { API_BASE_URL } from './config'

function Referrals({ user, onBackToAccount, onBackToCatalog, onLoginRedirect }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const fetchReferrals = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/referrals/me`, {
        credentials: 'include',
      })
      if (res.ok) {
        const json = await res.json()
        setData(json.data)
      } else {
        const json = await res.json()
        setError(json.message || 'Unable to load referral data.')
      }
    } catch (err) {
      setError('Network error loading referral data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReferrals()
  }, [user])

  const handleCopy = () => {
    if (!data?.referralLink) return
    navigator.clipboard.writeText(data.referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  const handleShare = () => {
    if (!data?.referralLink) return
    if (navigator.share) {
      navigator.share({
        title: 'ANIVOM Referral',
        text: 'Join ANIVOM High Couture & Custom Apparel using my exclusive invitation link:',
        url: data.referralLink,
      }).catch(() => {})
    } else {
      handleCopy()
    }
  }

  if (!user) {
    return (
      <div className="anivom-referrals-root">
        <div className="anivom-referrals-unauth reveal">
          <span className="anivom-referrals-badge">ATELIER ACCESS</span>
          <h2 className="anivom-referrals-title">SIGN IN TO ACCESS REFERRALS</h2>
          <p className="anivom-referrals-subtitle" style={{ margin: '0 auto 24px' }}>
            Please log in with your customer account to view your unique referral code, invite links, and reward history.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="anivom-btn-copy" onClick={onLoginRedirect}>
              Sign In to ANIVOM
            </button>
            <button className="anivom-referrals-back-btn" onClick={onBackToCatalog}>
              Explore Catalog
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="anivom-referrals-root">
        <div className="anivom-referrals-container">
          <div className="anivom-referrals-hero-card reveal">
            <p className="anivom-referrals-subtitle">Loading your referral details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="anivom-referrals-root">
        <div className="anivom-referrals-container">
          <div className="anivom-referrals-hero-card reveal">
            <h3 style={{ color: '#500B13', margin: '0 0 8px' }}>Unable to load Referral Portal</h3>
            <p className="anivom-referrals-subtitle">{error}</p>
            <button className="anivom-btn-copy" onClick={fetchReferrals} style={{ width: 'fit-content', marginTop: '16px' }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const referralCode = data?.referralCode || user?.referralCode || 'ANIVOM'
  const referralLink = data?.referralLink || `${window.location.origin}/register?ref=${referralCode}`
  const stats = data?.stats || { total: 0, successful: 0, pending: 0, rewardStatus: 'No Referrals Yet' }
  const history = data?.history || []

  return (
    <div className="anivom-referrals-root">
      <div className="anivom-referrals-container">
        <header className="anivom-referrals-header reveal">
          <div>
            <span className="anivom-referrals-badge">EXCLUSIVITY &amp; COMMUNITY</span>
            <h1 className="anivom-referrals-title">ANIVOM REFERRAL ATELIER</h1>
            <p className="anivom-referrals-subtitle">
              Invite your inner circle to experience ANIVOM custom streetwear couture. Share your exclusive invitation code or link to track your referrals and earned rewards.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {onBackToAccount && (
              <button className="anivom-referrals-back-btn" onClick={onBackToAccount}>
                &larr; Account
              </button>
            )}
            <button className="anivom-referrals-back-btn" onClick={onBackToCatalog}>
              Catalog
            </button>
          </div>
        </header>

        <section className="anivom-referrals-hero-card reveal">
          <div className="anivom-referrals-hero-top">
            <div className="anivom-code-box">
              <span className="anivom-box-label">Your Referral Code</span>
              <span className="anivom-code-value">{referralCode}</span>
            </div>

            <div className="anivom-link-box">
              <span className="anivom-box-label">Your Invitation Link</span>
              <span className="anivom-link-value">{referralLink}</span>
            </div>
          </div>

          <div className="anivom-hero-actions">
            <button className="anivom-btn-copy" onClick={handleCopy}>
              Copy Invitation Link
            </button>

            {typeof navigator !== 'undefined' && navigator.share && (
              <button className="anivom-btn-share" onClick={handleShare}>
                Share Link
              </button>
            )}

            {copied && (
              <span className="anivom-copy-toast">
                ✓ Copied to Clipboard
              </span>
            )}
          </div>
        </section>

        <div className="anivom-stats-grid">
          <div className="anivom-stat-card reveal" style={{ '--reveal-delay': '0ms' }}>
            <span className="anivom-stat-val">{stats.total}</span>
            <span className="anivom-stat-label">Total Referrals</span>
          </div>

          <div className="anivom-stat-card reveal" style={{ '--reveal-delay': '50ms' }}>
            <span className="anivom-stat-val accent">{stats.successful}</span>
            <span className="anivom-stat-label">Successful Referrals</span>
          </div>

          <div className="anivom-stat-card reveal" style={{ '--reveal-delay': '100ms' }}>
            <span className="anivom-stat-val">{stats.pending}</span>
            <span className="anivom-stat-label">Pending Referrals</span>
          </div>

          <div className="anivom-stat-card reveal" style={{ '--reveal-delay': '150ms' }}>
            <span className="anivom-stat-val" style={{ fontSize: '1.2rem', color: '#7A1F3D' }}>
              {stats.rewardStatus}
            </span>
            <span className="anivom-stat-label">Reward Status</span>
          </div>
        </div>

        <section className="anivom-history-section reveal">
          <h3 className="anivom-history-title">REFERRAL HISTORY</h3>

          {history.length === 0 ? (
            <div className="anivom-history-empty">
              No referrals recorded yet. Share your invitation link to invite friends to ANIVOM.
            </div>
          ) : (
            <table className="anivom-history-table">
              <thead>
                <tr>
                  <th>Referral</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Reward Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id}>
                    <td><strong>{item.label}</strong></td>
                    <td>{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>
                      <span className={`anivom-status-tag ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: item.rewardStatus.includes('Earned') ? '#137333' : '#666666' }}>
                        {item.rewardStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}

export default Referrals

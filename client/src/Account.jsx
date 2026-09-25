import { useState, useEffect } from 'react'
import './Account.css'
import { API_BASE_URL } from './config'

function Account({ user, onBackToCatalog, onNavigateToCreations, onNavigateToOrders, onNavigateToWishlist, onNavigateToReferrals, onLoginRedirect, onLogout }) {
  const [addresses, setAddresses] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [addressErr, setAddressErr] = useState(null)
  const [addressMsg, setAddressMsg] = useState(null)

  const [activeTab, setActiveTab] = useState('addresses')
  const [showForm, setShowForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [fullName, setFullName] = useState(user ? user.name || '' : '')
  const [phone, setPhone] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('India')
  const [label, setLabel] = useState('Home')
  const [isDefault, setIsDefault] = useState(false)

  const fetchAddresses = async () => {
    if (!user) return
    setLoadingAddresses(true)
    setAddressErr(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/addresses`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.data.addresses || [])
      } else {
        const data = await res.json()
        setAddressErr(data.message || 'WE COULDN\'T LOAD YOUR ADDRESSES.')
      }
    } catch (err) {
      setAddressErr('WE COULDN\'T LOAD YOUR ADDRESSES.')
    } finally {
      setLoadingAddresses(false)
    }
  }

  const fetchOrders = async () => {
    if (!user) return
    setLoadingOrders(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.data.orders || [])
      }
    } catch (err) {
      // silent orders fallback
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAddresses()
      fetchOrders()
    }
  }, [user])

  if (!user) {
    return (
      <div className="anivom-account-container">
        <div className="anivom-account-empty-box">
          <h2 className="anivom-account-empty-head">YOUR ACCOUNT IS WAITING.</h2>
          <p className="anivom-account-empty-sub">
            Sign in to manage your profile, saved addresses and order history.
          </p>
          <div className="anivom-account-empty-actions">
            <button className="anivom-btn-account-primary" onClick={onLoginRedirect}>
              Sign In to ANIVOM
            </button>
            <button className="anivom-btn-account-secondary" onClick={onBackToCatalog}>
              Explore Catalog
            </button>
          </div>
        </div>
      </div>
    )
  }

  const resetForm = () => {
    setFullName(user.name || '')
    setPhone('')
    setAddressLine1('')
    setAddressLine2('')
    setCity('')
    setState('')
    setPostalCode('')
    setCountry('India')
    setLabel('Home')
    setIsDefault(false)
    setEditingAddressId(null)
    setShowForm(false)
  }

  const openEditForm = (addr) => {
    setEditingAddressId(addr._id)
    setFullName(addr.fullName || '')
    setPhone(addr.phone || '')
    setAddressLine1(addr.addressLine1 || '')
    setAddressLine2(addr.addressLine2 || '')
    setCity(addr.city || '')
    setState(addr.state || '')
    setPostalCode(addr.postalCode || '')
    setCountry(addr.country || 'India')
    setLabel(addr.label || 'Home')
    setIsDefault(!!addr.isDefault)
    setShowForm(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setAddressMsg(null)
    setAddressErr(null)
    setSubmitting(true)

    const payload = {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      label,
      isDefault,
    }

    try {
      const url = editingAddressId
        ? `${API_BASE_URL}/api/v1/addresses/${editingAddressId}`
        : `${API_BASE_URL}/api/v1/addresses`
      const method = editingAddressId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        setAddressMsg(editingAddressId ? 'Address updated successfully!' : 'Address saved successfully!')
        resetForm()
        await fetchAddresses()
      } else {
        setAddressErr(data.message || 'Failed to save address.')
      }
    } catch (err) {
      setAddressErr('Network error saving address.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSetDefault = async (addressId) => {
    setAddressMsg(null)
    setAddressErr(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${addressId}/default`, {
        method: 'PATCH',
        credentials: 'include',
      })
      if (res.ok) {
        setAddressMsg('Default delivery address updated.')
        await fetchAddresses()
      } else {
        const data = await res.json()
        setAddressErr(data.message || 'Failed to update default address.')
      }
    } catch (err) {
      setAddressErr('Network error setting default address.')
    }
  }

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this saved delivery address?')) {
      return
    }
    setAddressMsg(null)
    setAddressErr(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setAddressMsg('Address deleted successfully.')
        await fetchAddresses()
      } else {
        const data = await res.json()
        setAddressErr(data.message || 'Failed to delete address.')
      }
    } catch (err) {
      setAddressErr('Network error deleting address.')
    }
  }

  return (
    <div className="anivom-account-container">
      <header className="anivom-account-header">
        <div className="anivom-account-title-group">
          <h1 className="anivom-account-title">ACCOUNT</h1>
          <p className="anivom-account-subtitle">Your ANIVOM profile, addresses & orders.</p>
        </div>

        <div className="anivom-account-nav-actions">
          {onNavigateToOrders && (
            <button className="anivom-btn-acc-nav" onClick={() => onNavigateToOrders(null)}>
              My Orders
            </button>
          )}
          {onNavigateToWishlist && (
            <button className="anivom-btn-acc-nav" onClick={onNavigateToWishlist}>
              My Wishlist
            </button>
          )}
          {onNavigateToReferrals && (
            <button className="anivom-btn-acc-nav" onClick={onNavigateToReferrals}>
              Referral Atelier
            </button>
          )}
          <button className="anivom-btn-acc-nav" onClick={onNavigateToCreations}>
            My Creations
          </button>
          <button className="anivom-btn-acc-nav" onClick={onBackToCatalog}>
            Catalog
          </button>
          {onLogout && (
            <button className="anivom-btn-acc-logout" onClick={onLogout}>
              Log Out
            </button>
          )}
        </div>
      </header>

      <div className="anivom-account-layout">
        <aside className="anivom-account-profile-side">
          <div className="anivom-profile-card">
            <div className="anivom-profile-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <h3 className="anivom-profile-name">{user.name}</h3>
            <p className="anivom-profile-email">{user.email}</p>
            <div className="anivom-profile-badge">
              ANIVOM {user.role ? user.role.toUpperCase() : 'CUSTOMER'} MEMBER
            </div>
          </div>

          <div className="anivom-account-tabs-nav">
            <button
              className={`anivom-acc-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              Saved Addresses ({addresses.length})
            </button>
            <button
              className={`anivom-acc-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Order History ({orders.length})
            </button>
          </div>
        </aside>

        <main className="anivom-account-main-content">
          {addressMsg && <div className="anivom-acc-notice success">{addressMsg}</div>}
          {addressErr && (
            <div className="anivom-acc-notice error">
              <span>{addressErr}</span>
              <button className="anivom-acc-retry-btn" onClick={fetchAddresses}>Retry</button>
            </div>
          )}

          {activeTab === 'addresses' && (
            <section className="anivom-acc-section">
              <div className="anivom-acc-section-head">
                <h2>SAVED ADDRESSES</h2>
                {!showForm && (
                  <button className="anivom-btn-add-acc-address" onClick={() => { resetForm(); setShowForm(true); }}>
                    + ADD ADDRESS
                  </button>
                )}
              </div>

              {showForm && (
                <form onSubmit={handleFormSubmit} className="anivom-acc-address-form">
                  <h3 className="anivom-form-subhead">
                    {editingAddressId ? 'EDIT DELIVERY ADDRESS' : 'NEW DELIVERY ADDRESS'}
                  </h3>
                  <div className="anivom-acc-form-grid">
                    <div className="anivom-acc-field">
                      <label className="anivom-acc-label">Full Name *</label>
                      <input
                        type="text"
                        className="anivom-acc-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="anivom-acc-field">
                      <label className="anivom-acc-label">Phone Number *</label>
                      <input
                        type="text"
                        className="anivom-acc-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="anivom-acc-field">
                      <label className="anivom-acc-label">Address Line 1 *</label>
                      <input
                        type="text"
                        className="anivom-acc-input"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        required
                      />
                    </div>
                    <div className="anivom-acc-field">
                      <label className="anivom-acc-label">Address Line 2</label>
                      <input
                        type="text"
                        className="anivom-acc-input"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                      />
                    </div>
                    <div className="anivom-acc-field">
                      <label className="anivom-acc-label">City *</label>
                      <input
                        type="text"
                        className="anivom-acc-input"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="anivom-acc-field">
                      <label className="anivom-acc-label">State *</label>
                      <input
                        type="text"
                        className="anivom-acc-input"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                    </div>
                    <div className="anivom-acc-field">
                      <label className="anivom-acc-label">Postal Code *</label>
                      <input
                        type="text"
                        className="anivom-acc-input"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="anivom-acc-field">
                      <label className="anivom-acc-label">Address Type</label>
                      <select
                        className="anivom-acc-input"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <label className="anivom-acc-checkbox-label">
                      <input
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                      />
                      Make this my default delivery address
                    </label>
                  </div>

                  <div className="anivom-acc-form-actions">
                    <button type="submit" className="anivom-btn-acc-save" disabled={submitting}>
                      {submitting ? 'SAVING...' : editingAddressId ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
                    </button>
                    <button type="button" className="anivom-btn-acc-cancel" onClick={resetForm}>
                      CANCEL
                    </button>
                  </div>
                </form>
              )}

              {loadingAddresses ? (
                <div className="anivom-acc-state-box">
                  <p className="anivom-acc-state-text">LOADING SAVED ADDRESSES...</p>
                </div>
              ) : addresses.length === 0 && !showForm ? (
                <div className="anivom-acc-state-box">
                  <h3 className="anivom-acc-state-head">NO SAVED ADDRESSES YET.</h3>
                  <p className="anivom-acc-state-sub">Add an address to make checkout faster next time.</p>
                  <button className="anivom-btn-account-primary" onClick={() => { resetForm(); setShowForm(true); }}>
                    + ADD ADDRESS
                  </button>
                </div>
              ) : (
                <div className="anivom-acc-address-grid">
                  {addresses.map((addr) => (
                    <div key={addr._id} className={`anivom-acc-addr-card ${addr.isDefault ? 'default' : ''}`}>
                      <div className="anivom-acc-addr-head">
                        <span className="anivom-acc-addr-name">{addr.fullName}</span>
                        <span className="anivom-acc-addr-tag">{addr.label}</span>
                      </div>
                      <div className="anivom-acc-addr-body">
                        {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                        {addr.city}, {addr.state} - {addr.postalCode}<br />
                        {addr.country} | Phone: {addr.phone}
                      </div>

                      <div className="anivom-acc-addr-actions">
                        {addr.isDefault ? (
                          <span className="anivom-acc-default-badge">DEFAULT</span>
                        ) : (
                          <button
                            className="anivom-acc-action-link"
                            onClick={() => handleSetDefault(addr._id)}
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          className="anivom-acc-action-link"
                          onClick={() => openEditForm(addr)}
                        >
                          Edit
                        </button>
                        <button
                          className="anivom-acc-action-link danger"
                          onClick={() => handleDelete(addr._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'orders' && (
            <section className="anivom-acc-section">
              <div className="anivom-acc-section-head">
                <h2>ORDER HISTORY</h2>
              </div>

              {loadingOrders ? (
                <div className="anivom-acc-state-box">
                  <p className="anivom-acc-state-text">LOADING ORDER HISTORY...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="anivom-acc-state-box">
                  <h3 className="anivom-acc-state-head">NO ORDERS PLACED YET</h3>
                  <p className="anivom-acc-state-sub">Browse our streetwear catalog to place your first order.</p>
                  <button className="anivom-btn-account-primary" onClick={onBackToCatalog}>
                    Explore Catalog &rarr;
                  </button>
                </div>
              ) : (
                <div className="anivom-acc-orders-list">
                  {orders.map((ord) => (
                    <div key={ord._id} className="anivom-acc-order-card">
                      <div className="anivom-acc-order-head">
                        <div>
                          <div className="anivom-acc-order-id">Order #{ord._id}</div>
                          <div className="anivom-acc-order-date">
                            Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="anivom-acc-order-total">&#8377;{ord.totalAmount}</div>
                      </div>
                      <div className="anivom-acc-order-status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Status: <strong style={{ color: '#2e7d32' }}>{ord.orderStatus}</strong> | Payment: <strong>{ord.paymentStatus}</strong></span>
                        {onNavigateToOrders && (
                          <button
                            className="anivom-acc-action-link"
                            onClick={() => onNavigateToOrders(ord._id)}
                          >
                            Track & Details &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default Account

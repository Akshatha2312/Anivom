import React, { useState, useEffect } from 'react'
import './InfoPages.css'
import { API_BASE_URL } from './config'

function Contact({ user }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    orderId: '',
    subject: '',
    message: '',
  })

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }))
    }
  }, [user])

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSubmitted(true)
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          orderId: '',
          subject: '',
          message: '',
        })
      } else {
        setError(data.message || 'Unable to submit your message. Please try again.')
      }
    } catch (err) {
      setError('Network error sending your message. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="info-page-container">
      <div className="info-page-inner reveal">
        <span className="info-header-badge">CLIENT CARE</span>
        <h1 className="info-page-title">CONTACT ATELIER SUPPORT</h1>
        <p className="info-page-subtitle">
          Have a question about custom Studio designs, sizing, orders, or delivery? Reach out to our customer care team.
        </p>

        <div className="info-hero-divider" />

        <div className="contact-layout">
          <div className="contact-info-panel reveal">
            <div className="contact-info-block">
              <h4>CUSTOMER SUPPORT EMAIL</h4>
              <p>support@anivom.com</p>
            </div>

            <div className="contact-info-block">
              <h4>ATELIER SERVICE HOURS</h4>
              <p>Monday – Saturday</p>
              <p>10:00 AM – 7:00 PM IST</p>
            </div>

            <div className="contact-info-block">
              <h4>STUDIO LOCATION</h4>
              <p>ANIVOM Custom Apparel Studio</p>
              <p>High Couture &amp; Cultural Apparel</p>
              <p>India</p>
            </div>

            <div className="contact-info-block" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(198,161,91,0.2)' }}>
              <span style={{ fontSize: '0.75rem', color: '#C6A15B', letterSpacing: '0.1em', fontWeight: '700' }}>
                அனிவோம் - Wear It Your Way.
              </span>
            </div>
          </div>

          <div className="contact-form-panel reveal" style={{ '--reveal-delay': '100ms' }}>
            {submitted && (
              <div className="contact-success-banner">
                Thank you for reaching out to ANIVOM Atelier. Your message has been received by ANIVOM Support and our team will get back to you shortly.
              </div>
            )}

            {error && (
              <div style={{ padding: '12px 16px', background: '#500B13', color: '#FDFBF7', borderLeft: '3px solid #C6A15B', fontSize: '0.85rem', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  disabled={loading}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  disabled={loading || !!user}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="orderId">Order ID (Optional)</label>
                <input
                  id="orderId"
                  type="text"
                  name="orderId"
                  disabled={loading}
                  placeholder="e.g. 66f0a1b..."
                  value={formData.orderId}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  disabled={loading}
                  placeholder="e.g. Custom Studio Inquiry / Delivery Status"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  disabled={loading}
                  rows={4}
                  placeholder="How can our support team assist you?"
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <button className="info-banner-btn" type="submit" disabled={loading} style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Submitting Message...' : 'Send Message →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact

import React, { useState } from 'react'
import './InfoPages.css'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderId: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return
    setSubmitted(true)
    setFormData({
      name: '',
      email: '',
      orderId: '',
      subject: '',
      message: '',
    })
    setTimeout(() => {
      setSubmitted(false)
    }, 6000)
  }

  return (
    <div className="info-page-container">
      <div className="info-page-inner">
        <span className="info-header-badge">CLIENT CARE</span>
        <h1 className="info-page-title">CONTACT ATELIER SUPPORT</h1>
        <p className="info-page-subtitle">
          Have a question about custom Studio designs, sizing, orders, or delivery? Reach out to our customer care team.
        </p>

        <div className="info-hero-divider" />

        <div className="contact-layout">
          <div className="contact-info-panel">
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

          <div className="contact-form-panel">
            {submitted && (
              <div className="contact-success-banner">
                Thank you for reaching out to ANIVOM Atelier. Our customer care team has received your message and will respond shortly.
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
                  rows={4}
                  placeholder="How can our support team assist you?"
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <button className="info-banner-btn" type="submit" style={{ width: '100%' }}>
                Send Message &rarr;
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact

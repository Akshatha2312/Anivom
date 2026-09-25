import React from 'react'
import './InfoPages.css'

function Shipping({ onNavigateToOrders, onNavigateToContact }) {
  return (
    <div className="info-page-container">
      <div className="info-page-inner">
        <span className="info-header-badge">CLIENT CARE</span>
        <h1 className="info-page-title">SHIPPING & DELIVERY</h1>
        <p className="info-page-subtitle">
          Transparent guidelines on order processing timelines, customized garment preparation, domestic dispatch, and tracking.
        </p>

        <div className="info-hero-divider" />

        <div className="info-cards-grid">
          <div className="info-card">
            <span className="info-card-num">01 / PAYMENT & PROCESSING</span>
            <h3 className="info-card-title">Order Processing</h3>
            <p className="info-card-body">
              Orders are placed into fulfillment processing immediately following successful payment verification. You will receive an order confirmation status in your account dashboard.
            </p>
          </div>

          <div className="info-card">
            <span className="info-card-num">02 / ESTIMATED TIMELINES</span>
            <h3 className="info-card-title">Delivery Duration</h3>
            <p className="info-card-body">
              Standard domestic delivery generally takes 4 to 8 business days. Estimated delivery windows reflect general logistics timelines rather than guaranteed dates.
            </p>
          </div>

          <div className="info-card">
            <span className="info-card-num">03 / BESPOKE CRAFTSMANSHIP</span>
            <h3 className="info-card-title">Customized Products</h3>
            <p className="info-card-body">
              Garments created in ANIVOM Studio undergo high-definition digital prepress rendering, print curing, and quality inspection, requiring additional handling prior to dispatch.
            </p>
          </div>

          <div className="info-card">
            <span className="info-card-num">04 / SHIPMENT TRACKING</span>
            <h3 className="info-card-title">Tracking Your Order</h3>
            <p className="info-card-body">
              Logistics tracking numbers are updated under your Account &gt; Orders history as soon as logistics partners scan your parcel for transit.
            </p>
          </div>

          <div className="info-card">
            <span className="info-card-num">05 / ADDRESS ACCURACY</span>
            <h3 className="info-card-title">Shipping Address</h3>
            <p className="info-card-body">
              Please verify your full street address, landmark, postal pincode, and mobile phone number during checkout to ensure smooth delivery without carrier delays.
            </p>
          </div>
        </div>

        <div className="info-banner-box">
          <div>
            <h3 className="info-banner-title">Need Help Tracking an Existing Order?</h3>
            <p className="info-banner-desc">
              Inspect your current shipment status or contact customer care if you need delivery assistance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="info-banner-btn" onClick={onNavigateToOrders}>
              My Orders &rarr;
            </button>
            <button className="info-banner-btn" style={{ backgroundColor: 'transparent', color: '#FFFDF8', borderColor: '#FFFDF8' }} onClick={onNavigateToContact}>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shipping

import React from 'react'
import './InfoPages.css'

function Shipping({ onNavigateToOrders, onNavigateToContact }) {
  return (
    <div className="info-page-container">
      <div className="info-page-inner reveal">
        <span className="info-header-badge">CLIENT CARE</span>
        <h1 className="info-page-title">SHIPPING & DELIVERY</h1>
        <p className="info-page-subtitle">
          Transparent guidelines on order processing timelines, customized garment preparation, domestic dispatch, and tracking.
        </p>

        <div className="info-hero-divider" />

        <div className="info-cards-grid">
          {[
            { num: '01 / PAYMENT & PROCESSING', title: 'Order Processing', body: 'Orders are placed into fulfillment processing immediately following successful payment verification. You will receive an order confirmation status in your account dashboard.' },
            { num: '02 / ESTIMATED TIMELINES', title: 'Delivery Duration', body: 'Standard domestic delivery generally takes 4 to 8 business days. Estimated delivery windows reflect general logistics timelines rather than guaranteed dates.' },
            { num: '03 / BESPOKE CRAFTSMANSHIP', title: 'Customized Products', body: 'Garments created in ANIVOM Studio undergo high-definition digital prepress rendering, print curing, and quality inspection, requiring additional handling prior to dispatch.' },
            { num: '04 / SHIPMENT TRACKING', title: 'Tracking Your Order', body: 'Logistics tracking numbers are updated under your Account > Orders history as soon as logistics partners scan your parcel for transit.' },
            { num: '05 / ADDRESS ACCURACY', title: 'Shipping Address', body: 'Please verify your full street address, landmark, postal pincode, and mobile phone number during checkout to ensure smooth delivery without carrier delays.' },
          ].map((item, idx) => (
            <div key={item.num} className="info-card reveal" style={{ '--reveal-delay': `${(idx % 5) * 60}ms` }}>
              <span className="info-card-num">{item.num}</span>
              <h3 className="info-card-title">{item.title}</h3>
              <p className="info-card-body">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="info-banner-box reveal">
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

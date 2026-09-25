import React from 'react'
import './InfoPages.css'

function Returns({ onNavigateToContact }) {
  return (
    <div className="info-page-container">
      <div className="info-page-inner reveal">
        <span className="info-header-badge">CLIENT CARE</span>
        <h1 className="info-page-title">RETURNS & REFUNDS</h1>
        <p className="info-page-subtitle">
          Clear policy details regarding return eligibility for standard catalog pieces and customized ANIVOM Studio creations.
        </p>

        <div className="info-hero-divider" />

        <div className="info-cards-grid">
          {[
            { num: '01 / POLICY OVERVIEW', title: 'Return Eligibility', body: 'We uphold rigorous quality standards across all ANIVOM apparel. Eligibility for returns or exchanges depends on the product category and item condition upon receipt.' },
            { num: '02 / CATALOG ITEMS', title: 'Standard Products', body: 'Unworn, unwashed standard catalog items in original condition with intact brand tags may be eligible for return or exchange within 7 days of delivery upon support review.' },
            { num: '03 / BESPOKE CREATIONS', title: 'Customized Products', body: 'Garments personalized in ANIVOM Studio are printed to order according to individual client specifications and are exempt from standard returns unless delivered defective or damaged.' },
            { num: '04 / DEFECTIVE DELIVERIES', title: 'Damaged or Misprinted Items', body: 'If your garment arrives with a manufacturing defect, print discrepancy, or transit damage, contact customer support within 48 hours with order photos for replacement evaluation.' },
            { num: '05 / REIMBURSEMENT', title: 'Refund Processing', body: 'Approved refunds are credited to the original payment method. Depending on your bank or payment provider, refunds typically post within 5 to 7 business days following inspection.' },
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
            <h3 className="info-banner-title">Questions About a Recent Delivery?</h3>
            <p className="info-banner-desc">
              Contact our customer support atelier team with your order ID and photos if you experience issues with your shipment.
            </p>
          </div>
          <button className="info-banner-btn" onClick={onNavigateToContact}>
            Contact Customer Support &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}

export default Returns

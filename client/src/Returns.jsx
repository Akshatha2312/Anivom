import React from 'react'
import './InfoPages.css'

function Returns({ onNavigateToContact }) {
  return (
    <div className="info-page-container">
      <div className="info-page-inner">
        <span className="info-header-badge">CLIENT CARE</span>
        <h1 className="info-page-title">RETURNS & REFUNDS</h1>
        <p className="info-page-subtitle">
          Clear policy details regarding return eligibility for standard catalog pieces and customized ANIVOM Studio creations.
        </p>

        <div className="info-hero-divider" />

        <div className="info-cards-grid">
          <div className="info-card">
            <span className="info-card-num">01 / POLICY OVERVIEW</span>
            <h3 className="info-card-title">Return Eligibility</h3>
            <p className="info-card-body">
              We uphold rigorous quality standards across all ANIVOM apparel. Eligibility for returns or exchanges depends on the product category and item condition upon receipt.
            </p>
          </div>

          <div className="info-card">
            <span className="info-card-num">02 / CATALOG ITEMS</span>
            <h3 className="info-card-title">Standard Products</h3>
            <p className="info-card-body">
              Unworn, unwashed standard catalog items in original condition with intact brand tags may be eligible for return or exchange within 7 days of delivery upon support review.
            </p>
          </div>

          <div className="info-card">
            <span className="info-card-num">03 / BESPOKE CREATIONS</span>
            <h3 className="info-card-title">Customized Products</h3>
            <p className="info-card-body">
              Garments personalized in ANIVOM Studio are printed to order according to individual client specifications and are exempt from standard returns unless delivered defective or damaged.
            </p>
          </div>

          <div className="info-card">
            <span className="info-card-num">04 / DEFECTIVE DELIVERIES</span>
            <h3 className="info-card-title">Damaged or Misprinted Items</h3>
            <p className="info-card-body">
              If your garment arrives with a manufacturing defect, print discrepancy, or transit damage, contact customer support within 48 hours with order photos for replacement evaluation.
            </p>
          </div>

          <div className="info-card">
            <span className="info-card-num">05 / REIMBURSEMENT</span>
            <h3 className="info-card-title">Refund Processing</h3>
            <p className="info-card-body">
              Approved refunds are credited to the original payment method. Depending on your bank or payment provider, refunds typically post within 5 to 7 business days following inspection.
            </p>
          </div>
        </div>

        <div className="info-banner-box">
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

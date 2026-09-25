import React, { useState } from 'react'
import './InfoPages.css'

const FAQ_DATA = [
  {
    id: 'q1',
    question: 'What is ANIVOM?',
    answer:
      'ANIVOM is a high-couture custom apparel brand that empowers customers to design bespoke oversized and classic fit garments featuring personalized typography, curated graphics, and Tamil cultural artwork.',
  },
  {
    id: 'q2',
    question: 'Can I customize a T-shirt?',
    answer:
      'Yes. Using ANIVOM Studio, you can choose garment styles, select colors and sizes, apply custom graphics, and place bespoke artwork across the front and back of your piece.',
  },
  {
    id: 'q3',
    question: 'Can I add my own text?',
    answer:
      'Yes. Our custom studio features a typography editor that supports custom text in English and Tamil with selectable font styles, sizes, and positioning.',
  },
  {
    id: 'q4',
    question: 'Can I upload my own design/image?',
    answer:
      'Yes. You can upload custom images or vector artwork directly into ANIVOM Studio to render on your customized garment.',
  },
  {
    id: 'q5',
    question: 'Can I preview my customization before ordering?',
    answer:
      'Yes. ANIVOM Studio generates a real-time 2D interactive preview of your garment so you can inspect artwork placement and typography before adding to your bag.',
  },
  {
    id: 'q6',
    question: 'What payment methods are available?',
    answer:
      'We accept major credit cards, debit cards, UPI, net banking, and secure digital wallets via Razorpay checkout.',
  },
  {
    id: 'q7',
    question: 'How can I track my order?',
    answer:
      'Once logged in, click "My Orders" from your account menu to view real-time fulfillment updates and tracking details when your shipment is dispatched.',
  },
  {
    id: 'q8',
    question: 'Can I change my order after placing it?',
    answer:
      'Because bespoke orders enter prepress production quickly, order changes or cancellations must be requested immediately by contacting customer support before printing starts.',
  },
  {
    id: 'q9',
    question: 'How long does delivery take?',
    answer:
      'Standard domestic shipping generally takes 4 to 8 business days across India. Customized garments require additional prepress rendering and print curing prior to dispatch.',
  },
  {
    id: 'q10',
    question: 'What happens if my item arrives damaged?',
    answer:
      'If your parcel or garment arrives damaged or with a printing defect, please contact our support team within 48 hours of delivery with photos for prompt replacement assistance.',
  },
]

function Faq({ onNavigateToContact, onNavigateToCatalog }) {
  const [openId, setOpenId] = useState('q1')

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="info-page-container">
      <div className="info-page-inner reveal">
        <span className="info-header-badge">CLIENT CARE</span>
        <h1 className="info-page-title">FREQUENTLY ASKED QUESTIONS</h1>
        <p className="info-page-subtitle">
          Everything you need to know about ANIVOM, bespoke garment customization, payment methods, delivery timelines, and order support.
        </p>

        <div className="info-hero-divider" />

        <div className="faq-accordion-list">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openId === item.id
            return (
              <div
                key={item.id}
                className={`faq-item reveal ${isOpen ? 'active' : ''}`}
                style={{ '--reveal-delay': `${(idx % 10) * 40}ms` }}
              >
                <button className="faq-question-btn" onClick={() => toggleItem(item.id)}>
                  <span>{item.question}</span>
                  <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && <div className="faq-answer">{item.answer}</div>}
              </div>
            )
          })}
        </div>

        <div className="info-banner-box reveal">
          <div>
            <h3 className="info-banner-title">Still Have Questions?</h3>
            <p className="info-banner-desc">
              Our atelier customer care team is available to assist you with custom design questions or order inquiries.
            </p>
          </div>
          <button className="info-banner-btn" onClick={onNavigateToContact}>
            Contact Support &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}

export default Faq

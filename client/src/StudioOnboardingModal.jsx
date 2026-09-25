import React, { useEffect } from 'react'
import './StudioOnboardingModal.css'

function StudioOnboardingModal({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const steps = [
    {
      num: '01',
      title: 'TEXT',
      icon: '✍︎',
      desc: 'Add your own text to the T-shirt with custom fonts and sizes.',
    },
    {
      num: '02',
      title: 'UPLOAD',
      icon: '⇡',
      desc: 'Upload your own custom artwork, logo, or image.',
    },
    {
      num: '03',
      title: 'ARTWORK',
      icon: '✦',
      desc: 'Choose from predefined curated ANIVOM vector designs.',
    },
    {
      num: '04',
      title: 'ADJUST',
      icon: '⤢',
      desc: 'Move, resize, rotate, and layer your design elements easily.',
    },
    {
      num: '05',
      title: 'FRONT / BACK',
      icon: '⇄',
      desc: 'Switch between the front and back print areas of your garment.',
    },
    {
      num: '06',
      title: 'SAVE & BAG',
      icon: '🛍',
      desc: 'Save your creation and add the customized T-shirt to your bag.',
    },
  ]

  return (
    <div className="anivom-onboarding-overlay" onClick={onClose}>
      <div className="anivom-onboarding-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="anivom-onboarding-close"
          onClick={onClose}
          aria-label="Close onboarding guide"
        >
          &times;
        </button>

        <span className="anivom-onboarding-tag">ANIVOM STUDIO GUIDE</span>
        <h2 className="anivom-onboarding-title">HOW ANIVOM STUDIO WORKS</h2>
        <p className="anivom-onboarding-subtitle">Create it. Position it. Make it yours.</p>

        <div className="anivom-onboarding-grid">
          {steps.map((step) => (
            <div key={step.num} className="anivom-onboarding-step">
              <div className="anivom-onboarding-step-header">
                <span className="anivom-onboarding-step-num">{step.num}</span>
                <span className="anivom-onboarding-step-icon">{step.icon}</span>
                <h3 className="anivom-onboarding-step-title">{step.title}</h3>
              </div>
              <p className="anivom-onboarding-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>

        <button className="anivom-onboarding-btn" onClick={onClose}>
          GOT IT, LET'S CREATE &rarr;
        </button>
      </div>
    </div>
  )
}

export default StudioOnboardingModal

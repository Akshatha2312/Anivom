import React from 'react'
import './BagToast.css'

function BagToast({ message = 'Added to Bag ✓', onClick, onClose }) {
  return (
    <div className="anivom-bag-toast" onClick={onClick} role="button" tabIndex={0}>
      <div className="anivom-bag-toast-content">
        <span className="anivom-bag-toast-check">✓</span>
        <span className="anivom-bag-toast-text">Added to Bag</span>
      </div>
      <span className="anivom-bag-toast-link">VIEW BAG &rarr;</span>
      {onClose && (
        <button
          className="anivom-bag-toast-close"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          aria-label="Close notification"
        >
          &times;
        </button>
      )}
    </div>
  )
}

export default BagToast

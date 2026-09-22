import React from 'react';
import './MyCreations.css';

const MyCreations = ({ customizations, loading, error, onEdit, onDelete, onBackToCatalog }) => {
  if (loading) {
    return (
      <div className="creations-container">
        <div className="creations-header">
          <h2>My Saved Creations</h2>
          <button className="creations-back-btn" onClick={onBackToCatalog}>
            &larr; Back to Catalog
          </button>
        </div>
        <div className="creations-loading">
          <p>Loading your saved customizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="creations-container">
        <div className="creations-header">
          <h2>My Saved Creations</h2>
          <button className="creations-back-btn" onClick={onBackToCatalog}>
            &larr; Back to Catalog
          </button>
        </div>
        <div className="creations-error-box">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="creations-container">
      <div className="creations-header">
        <h2>My Saved Creations ({customizations ? customizations.length : 0})</h2>
        <button className="creations-back-btn" onClick={onBackToCatalog}>
          &larr; Back to Catalog
        </button>
      </div>

      {!customizations || customizations.length === 0 ? (
        <div className="creations-empty">
          <div className="empty-card">
            <h3>No Saved Creations Yet</h3>
            <p>Select a product from our catalog and customize it in ANIVOM Studio to save your designs here.</p>
            <button className="creations-action-btn" onClick={onBackToCatalog}>
              Browse Catalog
            </button>
          </div>
        </div>
      ) : (
        <div className="creations-grid">
          {customizations.map((item) => {
            const productName = item.product && item.product.name ? item.product.name : 'Custom T-Shirt';
            const basePrice = item.product && item.product.basePrice ? `₹${item.product.basePrice}` : '';
            const layerCount = item.layers ? item.layers.length : 0;
            const updatedDate = new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString();

            return (
              <div key={item._id} className="creation-card">
                <div className="creation-preview-box">
                  <div className="creation-garment-mockup">
                    <span className="creation-garment-color-chip" style={{ backgroundColor: item.colour || '#18181b' }}></span>
                    <div className="creation-mockup-inner">
                      <span className="mockup-layers-indicator">{layerCount} Layer{layerCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="creation-card-body">
                  <div className="creation-title-row">
                    <h3 className="creation-product-name">{productName}</h3>
                    {basePrice && <span className="creation-price">{basePrice}</span>}
                  </div>

                  <div className="creation-meta-row">
                    <span className="creation-chip">Size: <strong>{item.size}</strong></span>
                    <span className="creation-chip">Colour: <strong>{item.colour}</strong></span>
                    <span className={`status-chip status-${item.status}`}>
                      {item.status ? item.status.toUpperCase() : 'SAVED'}
                    </span>
                  </div>

                  <div className="creation-date-row">
                    <span className="creation-date">Updated: {updatedDate}</span>
                  </div>

                  <div className="creation-card-actions">
                    <button
                      className="creations-btn creations-btn-primary"
                      onClick={() => onEdit(item)}
                    >
                      Continue Editing &rarr;
                    </button>
                    {item.status !== 'ordered' && (
                      <button
                        className="creations-btn creations-btn-danger"
                        onClick={() => onDelete(item._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCreations;

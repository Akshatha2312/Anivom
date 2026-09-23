import React from 'react';
import './MyCreations.css';

const MyCreations = ({
  user,
  customizations,
  loading,
  error,
  onEdit,
  onDelete,
  onBackToCatalog,
  onLoginRedirect,
  onRetry,
}) => {
  if (!user) {
    return (
      <div className="anivom-creations-container">
        <div className="anivom-creations-empty-box">
          <h2 className="anivom-creations-empty-head">SIGN IN TO VIEW MY CREATIONS</h2>
          <p className="anivom-creations-empty-sub">
            Please log in with your ANIVOM customer account to access your saved bespoke designs.
          </p>
          <div className="anivom-creations-empty-actions">
            <button className="anivom-btn-creations-primary" onClick={onLoginRedirect}>
              Sign In to ANIVOM
            </button>
            <button className="anivom-btn-creations-secondary" onClick={onBackToCatalog}>
              Explore Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="anivom-creations-container">
        <div className="anivom-creations-empty-box">
          <p className="anivom-creations-loading-text">Loading your saved ANIVOM designs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="anivom-creations-container">
        <div className="anivom-creations-empty-box error">
          <h2 className="anivom-creations-empty-head">UNABLE TO LOAD CREATIONS</h2>
          <p className="anivom-creations-empty-sub">{error}</p>
          <button className="anivom-btn-creations-primary" onClick={onRetry}>
            Retry Request
          </button>
        </div>
      </div>
    );
  }

  const items = customizations || [];

  return (
    <div className="anivom-creations-container">
      <div className="anivom-creations-header">
        <div>
          <h1 className="anivom-creations-title">
            MY CREATIONS <span className="anivom-creations-count">({items.length})</span>
          </h1>
          <p className="anivom-creations-subtitle">Your ideas, saved for later.</p>
        </div>
        <button className="anivom-creations-back-btn" onClick={onBackToCatalog}>
          &larr; Back to Catalog
        </button>
      </div>

      {items.length === 0 ? (
        <div className="anivom-creations-empty-box">
          <h2 className="anivom-creations-empty-head">NOTHING SAVED YET.</h2>
          <p className="anivom-creations-empty-sub">
            Your next favourite T-shirt starts here. Choose a garment from our catalog and open it in ANIVOM Studio to start customizing.
          </p>
          <button className="anivom-btn-creations-primary" onClick={onBackToCatalog}>
            Create Your Design &rarr;
          </button>
        </div>
      ) : (
        <div className="anivom-creations-grid">
          {items.map((item) => {
            const product = item.product || {};
            const productName = product.name || 'ANIVOM Custom T-Shirt';
            const basePrice = product.basePrice ? `₹${product.basePrice}` : '';
            const layers = item.layers || [];
            const updatedDate = new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div key={item._id} className="anivom-creation-card">
                <div className="anivom-creation-preview-frame">
                  <div
                    className="anivom-creation-swatch-bg"
                    style={{ backgroundColor: item.colour === 'White' ? '#FFFDF8' : item.colour === 'Navy' ? '#1e3a8a' : '#111111' }}
                  >
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={productName} className="anivom-creation-img" />
                    ) : (
                      <span className="anivom-creation-no-img">ANIVOM</span>
                    )}

                    <span className="anivom-creation-badge-status">
                      {item.status ? item.status.toUpperCase() : 'SAVED'}
                    </span>
                  </div>
                </div>

                <div className="anivom-creation-card-body">
                  <div className="anivom-creation-title-row">
                    <h3 className="anivom-creation-name">{productName}</h3>
                    {basePrice && <span className="anivom-creation-price">{basePrice}</span>}
                  </div>

                  <div className="anivom-creation-meta-row">
                    <span>Size: <strong>{item.size}</strong></span>
                    <span>Colour: <strong>{item.colour}</strong></span>
                  </div>

                  {layers.length > 0 && (
                    <div className="anivom-creation-layers-box">
                      <div className="anivom-creation-layers-title">Design Layers ({layers.length})</div>
                      <div className="anivom-creation-chips">
                        {layers.map((l, idx) => (
                          <span key={l._id || idx} className="anivom-creation-chip">
                            {l.type === 'text' && `Text: "${l.text?.content || 'Text'}"`}
                            {l.type === 'predefined_design' && `Vector: ${l.design?.name || l.design?.designId || 'Design'}`}
                            {l.type === 'uploaded_image' && 'Uploaded Artwork'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="anivom-creation-date">Last Updated: {updatedDate}</div>

                  <div className="anivom-creation-actions">
                    <button
                      className="anivom-btn-edit-creation"
                      onClick={() => onEdit(item)}
                    >
                      Continue Editing &rarr;
                    </button>
                    {item.status !== 'ordered' && (
                      <button
                        className="anivom-btn-delete-creation"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this saved customization?')) {
                            onDelete(item._id);
                          }
                        }}
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

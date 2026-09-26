import React, { useState } from 'react';
import { API_BASE_URL } from './config';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const AVAILABLE_COLOURS = [
  'Black',
  'White',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Orange',
  'Pink',
  'Purple',
  'Maroon',
  'Navy',
  'Grey',
  'Brown',
  'Beige',
  'Cream',
  'Teal',
  'Mustard',
  'Olive',
  'Sky Blue',
  'Wine',
];

const ProductFormModal = ({ product, onClose, onSaved }) => {
  const isEditing = Boolean(product && product._id);

  const [name, setName] = useState(product ? product.name || '' : '');
  const [description, setDescription] = useState(product ? product.description || '' : '');
  const [category, setCategory] = useState(product ? product.category || 'Oversized' : 'Oversized');
  const [dbCategories, setDbCategories] = useState([]);
  const [dbSizes, setDbSizes] = useState([]);
  const [dbColours, setDbColours] = useState([]);

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/categories`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.categories) {
          setDbCategories(data.data.categories.map((c) => c.name));
        }
      })
      .catch(() => { });

    fetch(`${API_BASE_URL}/api/v1/sizes`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.sizes) {
          setDbSizes(data.data.sizes.map((s) => s.name));
        }
      })
      .catch(() => { });

    fetch(`${API_BASE_URL}/api/v1/colours`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.colours) {
          setDbColours(data.data.colours.map((c) => c.name));
        }
      })
      .catch(() => { });
  }, []);

  const defaultCategories = ['Oversized', 'Minimal', 'Graphic', 'Regular Fit', 'Custom'];
  const categoriesList = Array.from(
    new Set([
      ...(dbCategories.length > 0 ? dbCategories : defaultCategories),
      ...(product && product.category ? [product.category] : []),
    ])
  );

  const sizesList = Array.from(
    new Set([
      ...(dbSizes.length > 0 ? dbSizes : AVAILABLE_SIZES),
      ...(product && product.variants ? product.variants.map((v) => v.size) : []),
    ])
  );

  const coloursList = Array.from(
    new Set([
      ...(dbColours.length > 0 ? dbColours : AVAILABLE_COLOURS),
      ...(product && product.variants ? product.variants.map((v) => v.colour) : []),
    ])
  );
  const [basePrice, setBasePrice] = useState(product ? product.basePrice || 1499 : 1499);
  const [imagesText, setImagesText] = useState(product && product.images ? product.images.join('\n') : '');
  const [isActive, setIsActive] = useState(product ? product.isActive !== false : true);

  const [variants, setVariants] = useState(
    product && product.variants && product.variants.length > 0
      ? product.variants
      : [
        { size: 'M', colour: 'Black', stock: 20 },
        { size: 'L', colour: 'Black', stock: 15 },
      ]
  );

  const [newSize, setNewSize] = useState('M');
  const [newColour, setNewColour] = useState('Black');
  const [newStock, setNewStock] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddVariant = () => {
    const existingIndex = variants.findIndex((v) => v.size === newSize && v.colour === newColour);
    if (existingIndex !== -1) {
      const updated = [...variants];
      updated[existingIndex].stock = Number(newStock);
      setVariants(updated);
    } else {
      setVariants([...variants, { size: newSize, colour: newColour, stock: Number(newStock) }]);
    }
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantStockChange = (index, value) => {
    const updated = [...variants];
    updated[index].stock = Math.max(0, parseInt(value, 10) || 0);
    setVariants(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const imagesList = imagesText
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url !== '');

    if (variants.length === 0) {
      setError('Please add at least one product variant (Size, Colour, Stock).');
      setLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      basePrice: Number(basePrice),
      images: imagesList,
      variants,
      isActive,
    };

    try {
      const url = isEditing
        ? `${API_BASE_URL}/api/v1/products/admin/${product._id}`
        : `${API_BASE_URL}/api/v1/products/admin`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to save product.');
      }

      onSaved();
    } catch (err) {
      setError(err.message || 'Error communicating with product API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{isEditing ? 'EDIT ATELIER PIECE' : 'CREATE NEW ATELIER PIECE'}</h2>
          <button className="admin-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form-stack">
          <div className="admin-form-row">
            <div className="admin-input-group flex-2">
              <label>Garment Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ANIVOM Heavyweight Oversized Tee"
              />
            </div>
            <div className="admin-input-group flex-1">
              <label>Base Price (&#8377;)</label>
              <input
                type="number"
                required
                min="0"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-input-group flex-1">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-input-group flex-1">
              <label>Status</label>
              <select
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
              >
                <option value="active">Active (Visible in Store)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="admin-input-group">
            <label>Description</label>
            <textarea
              rows="3"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the fabric, GSM, cut, embroidery, and details..."
            />
          </div>

          <div className="admin-input-group">
            <label>Product Images (One URL per line)</label>
            <textarea
              rows="3"
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>

          <div className="admin-variants-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>PRODUCT-SPECIFIC VARIANTS & STOCK MATRIX</h3>
              <span className="admin-tag-pill" style={{ textTransform: 'uppercase', color: '#C65D3B' }}>
                {name || 'Product'} Specific
              </span>
            </div>

            <div style={{ background: '#FFFDF8', border: '1px solid rgba(17, 17, 17, 0.08)', padding: '10px 14px', marginBottom: '16px', fontSize: '0.78rem', color: '#555555' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>Configured Colours ({Array.from(new Set(variants.map(v => v.colour))).length}):</strong>{' '}
                {Array.from(new Set(variants.map(v => v.colour))).join(', ') || 'None'}
              </div>
              <div>
                <strong>Configured Sizes ({Array.from(new Set(variants.map(v => v.size))).length}):</strong>{' '}
                {Array.from(new Set(variants.map(v => v.size))).join(', ') || 'None'}
              </div>
            </div>

            <div className="add-variant-row">
              <div className="admin-input-group flex-1">
                <label>Size</label>
                <select value={newSize} onChange={(e) => setNewSize(e.target.value)}>
                  {sizesList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-input-group flex-1">
                <label>Colour</label>
                <select value={newColour} onChange={(e) => setNewColour(e.target.value)}>
                  {coloursList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-input-group flex-1">
                <label>Stock</label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="admin-btn-secondary"
                onClick={handleAddVariant}
                style={{ alignSelf: 'flex-end' }}
              >
                + Add Variant
              </button>
            </div>

            <div className="variants-list-table">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>SIZE</th>
                    <th>COLOUR</th>
                    <th>STOCK UNITS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="admin-empty-text">
                        No variants added yet. Add sizes & colours above.
                      </td>
                    </tr>
                  ) : (
                    variants.map((v, index) => (
                      <tr key={`${v.size}_${v.colour}_${index}`}>
                        <td><strong>{v.size}</strong></td>
                        <td>{v.colour}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="inline-stock-input"
                            value={v.stock}
                            onChange={(e) => handleVariantStockChange(index, e.target.value)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-danger-text-btn"
                            onClick={() => handleRemoveVariant(index)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-modal-actions">
            <button type="button" className="admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="admin-submit-btn">
              {loading ? 'SAVING...' : isEditing ? 'UPDATE PIECE' : 'CREATE PIECE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;

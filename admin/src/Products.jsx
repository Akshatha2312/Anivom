import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import ProductFormModal from './ProductFormModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/products/admin`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load admin products.');
      }
      setProducts(data.data?.products || []);
    } catch (err) {
      setError(err.message || 'Error fetching products list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleStatus = async (product) => {
    const nextStatus = !product.isActive;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/products/admin/${product._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update product status.');
      }
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Error updating product status.');
    }
  };

  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/categories/admin`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.categories) {
          setDbCategories(data.data.categories.map((c) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  const predefinedCategories = ['All', 'Oversized', 'Minimal', 'Graphic', 'Regular Fit', 'Custom'];
  const baseCategorySet = dbCategories.length > 0 ? ['All', ...dbCategories] : predefinedCategories;
  const categories = [
    ...baseCategorySet,
    ...Array.from(new Set(products.map((p) => p.category))).filter(
      (cat) => cat && !baseCategorySet.includes(cat)
    ),
  ];

  const filteredProducts = products.filter((prod) => {
    const prodCat = (prod.category || '').trim().toLowerCase();
    const selCat = selectedCategory.trim().toLowerCase();
    const matchesCategory = selCat === 'all' || prodCat === selCat;

    const searchTerm = search.trim().toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      prod.name.toLowerCase().includes(searchTerm) ||
      (prod.category && prod.category.toLowerCase().includes(searchTerm));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">PRODUCT CATALOG MANAGEMENT</h1>
          <p className="admin-page-subtitle">Manage ANIVOM luxury garments, variants, pricing, and stock levels</p>
        </div>
        <button
          className="admin-submit-btn"
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
        >
          + CREATE NEW PRODUCT
        </button>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-filter-group">
          <label>Category Filter:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-state-container">
          <div className="admin-spinner"></div>
          <p>Loading Product Catalog...</p>
        </div>
      ) : error ? (
        <div className="admin-state-container">
          <p className="admin-error-text">{error}</p>
          <button className="admin-btn-secondary" onClick={fetchProducts}>
            Retry Loading
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-empty-box">
          <p>No products match your search or filter criteria.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>GARMENT</th>
                <th>CATEGORY</th>
                <th>BASE PRICE</th>
                <th>VARIANTS</th>
                <th>TOTAL STOCK</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => {
                const totalStock = prod.variants
                  ? prod.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
                  : 0;
                const thumbnail = prod.images && prod.images.length > 0 ? prod.images[0] : null;

                return (
                  <tr key={prod._id}>
                    <td>
                      <div className="product-table-cell">
                        {thumbnail ? (
                          <img src={thumbnail} alt={prod.name} className="product-thumb" />
                        ) : (
                          <div className="product-thumb-placeholder">NO IMG</div>
                        )}
                        <div className="product-cell-info">
                          <span className="product-cell-name">{prod.name}</span>
                          <span className="product-cell-id mono-text">ID: {prod._id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="admin-tag-pill">{prod.category}</span></td>
                    <td><strong>&#8377;{prod.basePrice}</strong></td>
                    <td>{prod.variants ? prod.variants.length : 0} variants</td>
                    <td>
                      <span className={totalStock <= 10 ? 'stock-low-tag' : 'stock-ok-tag'}>
                        {totalStock} units
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${prod.isActive ? 'active' : 'inactive'}`}>
                        {prod.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          className="admin-btn-secondary sm"
                          onClick={() => {
                            setEditingProduct(prod);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className={`admin-status-toggle-btn ${prod.isActive ? 'deactivate' : 'activate'}`}
                          onClick={() => handleToggleStatus(prod)}
                        >
                          {prod.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};

export default Products;

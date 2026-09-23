import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryActive, setCategoryActive] = useState(true);

  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories/admin`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.data?.categories) {
        setCategories(data.data.categories);
      } else {
        setError(data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Error connecting to categories endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryActive(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name || '');
    setCategoryActive(cat.isActive !== false);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!categoryName.trim()) {
      setFormError('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingCategory
        ? `${API_BASE_URL}/api/v1/categories/admin/${editingCategory._id}`
        : `${API_BASE_URL}/api/v1/categories/admin`;

      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: categoryName.trim(),
          isActive: categoryActive,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        setModalOpen(false);
        fetchCategories();
      } else {
        setFormError(data.message || 'Failed to save category');
      }
    } catch (err) {
      setFormError('Network error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories/admin/${cat._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Category status updated to ${!cat.isActive ? 'Active' : 'Inactive'}`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchCategories();
      } else {
        setError(data.message || 'Failed to update category status');
      }
    } catch (err) {
      setError('Failed to update category status');
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories/admin/${cat._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Category deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchCategories();
      } else {
        setError(data.message || 'Failed to delete category');
        setTimeout(() => setError(null), 4000);
      }
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">CATEGORY MANAGEMENT</h1>
          <p className="admin-page-subtitle">Manage garment collections and customer catalog categories</p>
        </div>
        <button className="admin-submit-btn" onClick={openCreateModal}>
          + CREATE NEW CATEGORY
        </button>
      </div>

      {successMessage && <div className="admin-success-banner">{successMessage}</div>}
      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-app-loading" style={{ height: '300px' }}>
          <div className="admin-spinner"></div>
          <span>Loading Category Master List...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="admin-empty-box">
          <p>No categories found matching your search.</p>
          <button className="secondary-action-btn" onClick={openCreateModal}>Create Category</button>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>CATEGORY NAME</th>
                <th>STATUS</th>
                <th>CREATED AT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    <strong style={{ color: '#FFFDF8', fontSize: '1rem' }}>{cat.name}</strong>
                  </td>
                  <td>
                    <span className={`status-pill ${cat.isActive ? 'active' : 'inactive'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn edit" onClick={() => openEditModal(cat)}>Edit</button>
                      <button
                        className={`icon-btn toggle ${cat.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleStatus(cat)}
                      >
                        {cat.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(cat)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container design-modal">
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Create Category'}</h2>
              <button className="close-modal-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {formError && <div className="admin-error-banner">{formError}</div>}

              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Oversized, Streetwear, Luxe"
                />
              </div>

              <div className="form-group checkbox-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={categoryActive}
                    onChange={(e) => setCategoryActive(e.target.checked)}
                  />
                  Active & Visible in Customer Filters
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-action-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-action-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;

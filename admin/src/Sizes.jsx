import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

function Sizes() {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState(null);
  const [sizeName, setSizeName] = useState('');
  const [sizeActive, setSizeActive] = useState(true);

  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSizes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/sizes/admin`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.data?.sizes) {
        setSizes(data.data.sizes);
      } else {
        setError(data.message || 'Failed to fetch sizes');
      }
    } catch (err) {
      setError('Error connecting to sizes endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  const openCreateModal = () => {
    setEditingSize(null);
    setSizeName('');
    setSizeActive(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSize(s);
    setSizeName(s.name || '');
    setSizeActive(s.isActive !== false);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!sizeName.trim()) {
      setFormError('Size name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingSize
        ? `${API_BASE_URL}/api/v1/sizes/admin/${editingSize._id}`
        : `${API_BASE_URL}/api/v1/sizes/admin`;

      const method = editingSize ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: sizeName.trim(),
          isActive: sizeActive,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`Size ${editingSize ? 'updated' : 'created'} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        setModalOpen(false);
        fetchSizes();
      } else {
        setFormError(data.message || 'Failed to save size');
      }
    } catch (err) {
      setFormError('Network error saving size');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (s) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/sizes/admin/${s._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Size status updated to ${!s.isActive ? 'Active' : 'Inactive'}`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchSizes();
      } else {
        setError(data.message || 'Failed to update size status');
      }
    } catch (err) {
      setError('Failed to update size status');
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Are you sure you want to delete size "${s.name}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/sizes/admin/${s._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Size deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchSizes();
      } else {
        setError(data.message || 'Failed to delete size');
        setTimeout(() => setError(null), 4000);
      }
    } catch (err) {
      setError('Failed to delete size');
    }
  };

  const filteredSizes = sizes.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">SIZE OPTIONS MANAGEMENT</h1>
          <p className="admin-page-subtitle">Manage sizing choices available across product variants</p>
        </div>
        <button className="admin-submit-btn" onClick={openCreateModal}>
          + CREATE NEW SIZE
        </button>
      </div>

      {successMessage && <div className="admin-success-banner">{successMessage}</div>}
      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <input
            type="text"
            placeholder="Search sizes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-app-loading" style={{ height: '300px' }}>
          <div className="admin-spinner"></div>
          <span>Loading Size Options...</span>
        </div>
      ) : filteredSizes.length === 0 ? (
        <div className="admin-empty-box">
          <p>No sizes found matching your search.</p>
          <button className="secondary-action-btn" onClick={openCreateModal}>Create Size</button>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>SIZE NAME</th>
                <th>STATUS</th>
                <th>CREATED AT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSizes.map((s) => (
                <tr key={s._id}>
                  <td>
                    <strong style={{ color: '#FFFDF8', fontSize: '1rem' }}>{s.name}</strong>
                  </td>
                  <td>
                    <span className={`status-pill ${s.isActive ? 'active' : 'inactive'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn edit" onClick={() => openEditModal(s)}>Edit</button>
                      <button
                        className={`icon-btn toggle ${s.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleStatus(s)}
                      >
                        {s.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(s)}>Delete</button>
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
              <h2>{editingSize ? 'Edit Size Option' : 'Create Size Option'}</h2>
              <button className="close-modal-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {formError && <div className="admin-error-banner">{formError}</div>}

              <div className="form-group">
                <label>Size Name *</label>
                <input
                  type="text"
                  required
                  value={sizeName}
                  onChange={(e) => setSizeName(e.target.value)}
                  placeholder="e.g. XS, S, M, L, XL, 4XL"
                />
              </div>

              <div className="form-group checkbox-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sizeActive}
                    onChange={(e) => setSizeActive(e.target.checked)}
                  />
                  Active & Selectable in Product Forms
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-action-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-action-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editingSize ? 'Update Size' : 'Create Size'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sizes;

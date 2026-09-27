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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredSizes.length / itemsPerPage) || 1;
  const paginatedSizes = filteredSizes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

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
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-state-container">
          <div className="admin-spinner"></div>
          <p>Loading Size Options...</p>
        </div>
      ) : filteredSizes.length === 0 ? (
        <div className="admin-empty-box">
          <p>No sizes found matching your search.</p>
          <button className="admin-btn-secondary" onClick={openCreateModal}>Create Size</button>
        </div>
      ) : (
        <>
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
                {paginatedSizes.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>
                      <span className={`status-pill ${s.isActive ? 'active' : 'inactive'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons-group">
                        <button className="admin-btn-secondary sm" onClick={() => openEditModal(s)}>Edit</button>
                        <button
                          className={`admin-status-toggle-btn ${s.isActive ? 'deactivate' : 'activate'}`}
                          onClick={() => handleToggleStatus(s)}
                        >
                          {s.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="admin-status-toggle-btn deactivate" onClick={() => handleDelete(s)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination-bar">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="admin-btn-secondary sm"
            >
              &larr; Previous Page
            </button>
            <span className="pagination-info">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredSizes.length} total sizes)
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="admin-btn-secondary sm"
            >
              Next Page &rarr;
            </button>
          </div>
        </>
      )}

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="admin-modal-header">
              <h2>{editingSize ? 'EDIT SIZE OPTION' : 'CREATE SIZE OPTION'}</h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form-stack">
              {formError && <div className="admin-error-banner">{formError}</div>}

              <div className="admin-input-group">
                <label>Size Name *</label>
                <input
                  type="text"
                  required
                  value={sizeName}
                  onChange={(e) => setSizeName(e.target.value)}
                  placeholder="e.g. XS, S, M, L, XL, 4XL"
                />
              </div>

              <div className="admin-input-group checkbox-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={sizeActive}
                    onChange={(e) => setSizeActive(e.target.checked)}
                  />
                  Active & Selectable in Product Forms
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-submit-btn" disabled={submitting}>
                  {submitting ? 'SAVING...' : editingSize ? 'UPDATE SIZE' : 'CREATE SIZE'}
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

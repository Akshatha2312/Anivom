import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

function Colours() {
  const [colours, setColours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingColour, setEditingColour] = useState(null);
  const [colourName, setColourName] = useState('');
  const [colourActive, setColourActive] = useState(true);

  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchColours = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/colours/admin`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.data?.colours) {
        setColours(data.data.colours);
      } else {
        setError(data.message || 'Failed to fetch colours');
      }
    } catch (err) {
      setError('Error connecting to colours endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColours();
  }, []);

  const openCreateModal = () => {
    setEditingColour(null);
    setColourName('');
    setColourActive(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingColour(c);
    setColourName(c.name || '');
    setColourActive(c.isActive !== false);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!colourName.trim()) {
      setFormError('Colour name is required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingColour
        ? `${API_BASE_URL}/api/v1/colours/admin/${editingColour._id}`
        : `${API_BASE_URL}/api/v1/colours/admin`;

      const method = editingColour ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: colourName.trim(),
          isActive: colourActive,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`Colour ${editingColour ? 'updated' : 'created'} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        setModalOpen(false);
        fetchColours();
      } else {
        setFormError(data.message || 'Failed to save colour');
      }
    } catch (err) {
      setFormError('Network error saving colour');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (c) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/colours/admin/${c._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Colour status updated to ${!c.isActive ? 'Active' : 'Inactive'}`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchColours();
      } else {
        setError(data.message || 'Failed to update colour status');
      }
    } catch (err) {
      setError('Failed to update colour status');
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Are you sure you want to delete colour "${c.name}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/colours/admin/${c._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Colour deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchColours();
      } else {
        setError(data.message || 'Failed to delete colour');
        setTimeout(() => setError(null), 4000);
      }
    } catch (err) {
      setError('Failed to delete colour');
    }
  };

  const filteredColours = colours.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredColours.length / itemsPerPage) || 1;
  const paginatedColours = filteredColours.slice(
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
          <h1 className="admin-page-title">COLOUR OPTIONS MANAGEMENT</h1>
          <p className="admin-page-subtitle">Manage garment colorways available for product variants</p>
        </div>
        <button className="admin-submit-btn" onClick={openCreateModal}>
          + CREATE NEW COLOUR
        </button>
      </div>

      {successMessage && <div className="admin-success-banner">{successMessage}</div>}
      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <input
            type="text"
            placeholder="Search colours..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-app-loading" style={{ height: '300px' }}>
          <div className="admin-spinner"></div>
          <span>Loading Colour Options...</span>
        </div>
      ) : filteredColours.length === 0 ? (
        <div className="admin-empty-box">
          <p>No colours found matching your search.</p>
          <button className="secondary-action-btn" onClick={openCreateModal}>Create Colour</button>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>COLOUR NAME</th>
                  <th>STATUS</th>
                  <th>CREATED AT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedColours.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <strong style={{ color: '#111111', fontSize: '1rem' }}>{c.name}</strong>
                    </td>
                    <td>
                      <span className={`status-pill ${c.isActive ? 'active' : 'inactive'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="icon-btn edit" onClick={() => openEditModal(c)}>Edit</button>
                        <button
                          className={`icon-btn toggle ${c.isActive ? 'deactivate' : 'activate'}`}
                          onClick={() => handleToggleStatus(c)}
                        >
                          {c.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="icon-btn delete" onClick={() => handleDelete(c)}>Delete</button>
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
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredColours.length} total colours)
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
        <div className="modal-backdrop">
          <div className="modal-container design-modal">
            <div className="modal-header">
              <h2>{editingColour ? 'Edit Colour Option' : 'Create Colour Option'}</h2>
              <button className="close-modal-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {formError && <div className="admin-error-banner">{formError}</div>}

              <div className="form-group">
                <label>Colour Name *</label>
                <input
                  type="text"
                  required
                  value={colourName}
                  onChange={(e) => setColourName(e.target.value)}
                  placeholder="e.g. Lavender, Charcoal, Sage"
                />
              </div>

              <div className="form-group checkbox-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={colourActive}
                    onChange={(e) => setColourActive(e.target.checked)}
                  />
                  Active & Selectable in Product Forms
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-action-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-action-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editingColour ? 'Update Colour' : 'Create Colour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Colours;

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

function Designs() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'ANIVOM Originals',
    type: 'svg', // 'svg' or 'image'
    svg: '',
    url: '',
    isActive: true,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = ['All', 'ANIVOM Originals', 'Minimal', 'Street', 'Typography', 'Tamil', 'Abstract', 'Geometric', 'General'];

  const fetchDesigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/designs/admin`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.data?.designs) {
        setDesigns(data.data.designs);
      } else {
        setError(data.message || 'Failed to fetch designs');
      }
    } catch (err) {
      setError('Error connecting to designs endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const openCreateModal = () => {
    setEditingDesign(null);
    setFormData({
      name: '',
      category: 'ANIVOM Originals',
      type: 'svg',
      svg: '',
      url: '',
      isActive: true,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError(null);

    const bodyData = new FormData();
    bodyData.append('image', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/uploads/image`, {
        method: 'POST',
        credentials: 'include',
        body: bodyData,
      });
      const data = await res.json();
      if (res.ok && data.data?.url) {
        setFormData((prev) => ({
          ...prev,
          url: data.data.url,
          publicId: data.data.publicId || '',
        }));
      } else {
        setFormError(data.message || 'Failed to upload image to Cloudinary');
      }
    } catch (err) {
      setFormError('Network error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Design name is required');
      return;
    }

    if (formData.type === 'svg' && !formData.svg.trim()) {
      setFormError('SVG code markup is required for SVG design');
      return;
    }

    if (formData.type === 'image' && !formData.url.trim()) {
      setFormError('Please upload an image file or provide an image URL');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingDesign
        ? `${API_BASE_URL}/api/v1/designs/admin/${editingDesign._id}`
        : `${API_BASE_URL}/api/v1/designs/admin`;

      const method = editingDesign ? 'PATCH' : 'POST';

      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        svg: formData.type === 'svg' ? formData.svg.trim() : '',
        url: formData.type === 'image' ? formData.url.trim() : '',
        publicId: formData.publicId || '',
        isActive: formData.isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`Design ${editingDesign ? 'updated' : 'created'} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        setModalOpen(false);
        fetchDesigns();
      } else {
        setFormError(data.message || 'Failed to save design');
      }
    } catch (err) {
      setFormError('Network error saving design');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (design) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/designs/admin/${design._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !design.isActive }),
      });
      if (res.ok) {
        setSuccessMessage(`Design status updated to ${!design.isActive ? 'Active' : 'Inactive'}`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchDesigns();
      }
    } catch (err) {
      setError('Failed to update design status');
    }
  };

  const handleDelete = async (designId) => {
    if (!window.confirm('Are you sure you want to delete this custom design?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/designs/admin/${designId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setSuccessMessage('Design deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchDesigns();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete design');
      }
    } catch (err) {
      setError('Failed to delete design');
    }
  };

  const filteredDesigns = designs.filter((d) => {
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredDesigns.length / itemsPerPage) || 1;
  const paginatedDesigns = filteredDesigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="designs-management-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Custom Design Library</h1>
          <p className="admin-page-subtitle">Manage vector motifs, brand logos, and artwork for customer Atelier Studio customization.</p>
        </div>
        <button className="primary-action-btn" onClick={openCreateModal}>
          + Add New Design
        </button>
      </div>

      {successMessage && <div className="admin-banner success">{successMessage}</div>}
      {error && <div className="admin-banner error">{error}</div>}

      <div className="admin-filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search designs..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-app-loading" style={{ height: '300px' }}>
          <div className="admin-spinner"></div>
          <span>Loading Design Library...</span>
        </div>
      ) : filteredDesigns.length === 0 ? (
        <div className="empty-state-card">
          <p>No custom designs found in library matching your filters.</p>
          <button className="secondary-action-btn" onClick={openCreateModal}>Create First Design</button>
        </div>
      ) : (
        <>
          <div className="designs-grid">
            {paginatedDesigns.map((design) => (
              <div key={design._id} className={`design-card ${!design.isActive ? 'inactive' : ''}`}>
                <div className="design-preview-box">
                  {design.svg ? (
                    <div className="svg-render-container" dangerouslySetInnerHTML={{ __html: design.svg }} />
                  ) : design.url ? (
                    <img src={design.url} alt={design.name} className="design-img-preview" />
                  ) : (
                    <div className="no-preview">No Preview</div>
                  )}
                  <span className={`status-pill ${design.isActive ? 'active' : 'inactive'}`}>
                    {design.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="design-card-body">
                  <span className="design-category-tag">{design.category}</span>
                  <h3 className="design-title">{design.name}</h3>
                  <div className="design-actions">
                    <button
                      className={`icon-btn toggle ${design.isActive ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleStatus(design)}
                    >
                      {design.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDelete(design._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
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
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredDesigns.length} total designs)
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
              <h2>{editingDesign ? 'Edit Studio Design' : 'Create Studio Design'}</h2>
              <button className="close-modal-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {formError && <div className="admin-banner error">{formError}</div>}

              <div className="form-group">
                <label>Design Title / Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. ANIVOM Crest Logo"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.filter(c => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Design Format Type</label>
                <div className="radio-group" style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="type"
                      value="svg"
                      checked={formData.type === 'svg'}
                      onChange={() => setFormData({ ...formData, type: 'svg' })}
                    />
                    SVG Vector Code
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="type"
                      value="image"
                      checked={formData.type === 'image'}
                      onChange={() => setFormData({ ...formData, type: 'image' })}
                    />
                    Image Upload (PNG/JPG/WEBP)
                  </label>
                </div>
              </div>

              {formData.type === 'svg' ? (
                <div className="form-group">
                  <label>SVG Markup Code *</label>
                  <textarea
                    rows={6}
                    value={formData.svg}
                    onChange={(e) => setFormData({ ...formData, svg: e.target.value })}
                    placeholder='<svg viewBox="0 0 100 100">...</svg>'
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                  <small className="help-text">Paste valid XML/SVG code snippet to render as scalable vector artwork.</small>
                </div>
              ) : (
                <div className="form-group">
                  <label>Upload Image / Graphic *</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  {uploadingImage && <span>Uploading to Cloudinary...</span>}
                  {formData.url && (
                    <div className="image-preview-preview" style={{ marginTop: '0.5rem' }}>
                      <img src={formData.url} alt="Uploaded preview" style={{ height: '60px', borderRadius: '4px' }} />
                    </div>
                  )}
                </div>
              )}

              <div className="form-group checkbox-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active & Available in Customer Studio
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-action-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-action-btn" disabled={submitting || uploadingImage}>
                  {submitting ? 'Saving...' : editingDesign ? 'Update Design' : 'Create Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Designs;

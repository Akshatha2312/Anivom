import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/banners/admin`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.data?.banners) {
        setBanners(data.data.banners);
      } else {
        setError(data.message || 'Failed to fetch banners');
      }
    } catch (err) {
      setError('Error connecting to banners endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16);
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImage('');
    setImagePublicId('');
    setButtonText('');
    setButtonLink('');
    setSortOrder('0');
    setIsActive(true);
    setStartDate('');
    setEndDate('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBanner(b);
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setImage(b.image || '');
    setImagePublicId(b.imagePublicId || '');
    setButtonText(b.buttonText || '');
    setButtonLink(b.buttonLink || '');
    setSortOrder(b.sortOrder !== undefined ? b.sortOrder.toString() : '0');
    setIsActive(b.isActive !== false);
    setStartDate(formatDateForInput(b.startDate));
    setEndDate(formatDateForInput(b.endDate));
    setFormError(null);
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/uploads/image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.data?.url) {
        setImage(data.data.url);
        if (data.data.publicId) {
          setImagePublicId(data.data.publicId);
        }
      } else {
        setFormError(data.message || 'Image upload failed');
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

    if (!title.trim()) {
      setFormError('Banner title is required');
      return;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setFormError('End date cannot be before start date');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingBanner
        ? `${API_BASE_URL}/api/v1/banners/admin/${editingBanner._id}`
        : `${API_BASE_URL}/api/v1/banners/admin`;

      const method = editingBanner ? 'PATCH' : 'POST';

      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        image: image.trim(),
        imagePublicId: imagePublicId.trim(),
        buttonText: buttonText.trim(),
        buttonLink: buttonLink.trim(),
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`Banner ${editingBanner ? 'updated' : 'created'} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        setModalOpen(false);
        fetchBanners();
      } else {
        setFormError(data.message || 'Failed to save banner');
      }
    } catch (err) {
      setFormError('Network error saving banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (b) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/banners/admin/${b._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Banner status updated to ${!b.isActive ? 'Active' : 'Inactive'}`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchBanners();
      } else {
        setError(data.message || 'Failed to update banner status');
      }
    } catch (err) {
      setError('Failed to update banner status');
    }
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`Are you sure you want to delete banner "${b.title}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/banners/admin/${b._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Banner deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchBanners();
      } else {
        setError(data.message || 'Failed to delete banner');
        setTimeout(() => setError(null), 4000);
      }
    } catch (err) {
      setError('Failed to delete banner');
    }
  };

  const filteredBanners = banners.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">HOMEPAGE BANNERS & CONTENT</h1>
          <p className="admin-page-subtitle">Manage hero promotions, couture collection banners, and homepage callouts</p>
        </div>
        <button className="admin-submit-btn" onClick={openCreateModal}>
          + CREATE NEW BANNER
        </button>
      </div>

      {successMessage && <div className="admin-success-banner">{successMessage}</div>}
      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <input
            type="text"
            placeholder="Search banners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-app-loading" style={{ height: '300px' }}>
          <div className="admin-spinner"></div>
          <span>Loading Banners...</span>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="admin-empty-box">
          <p>No banners found matching your search.</p>
          <button className="secondary-action-btn" onClick={openCreateModal}>Create Banner</button>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>PREVIEW</th>
                <th>TITLE / SUBTITLE</th>
                <th>LINK & BUTTON</th>
                <th>SORT ORDER</th>
                <th>VALIDITY</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanners.map((b) => (
                <tr key={b._id}>
                  <td>
                    {b.image ? (
                      <img
                        src={b.image}
                        alt={b.title}
                        style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#888' }}>No Image</span>
                    )}
                  </td>
                  <td>
                    <strong style={{ color: '#FFFDF8', fontSize: '0.95rem', display: 'block' }}>{b.title}</strong>
                    {b.subtitle && <span style={{ fontSize: '0.8rem', color: '#AAA' }}>{b.subtitle}</span>}
                  </td>
                  <td>
                    {b.buttonText && <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{b.buttonText}</div>}
                    {b.buttonLink && <div style={{ fontSize: '0.75rem', color: '#888' }}>{b.buttonLink}</div>}
                  </td>
                  <td>
                    <span style={{ fontWeight: 'bold', color: '#E5C158' }}>{b.sortOrder}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>
                      {b.startDate ? new Date(b.startDate).toLocaleDateString() : 'Immediate'}
                      {' - '}
                      {b.endDate ? new Date(b.endDate).toLocaleDateString() : 'No expiry'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${b.isActive ? 'active' : 'inactive'}`}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn edit" onClick={() => openEditModal(b)}>Edit</button>
                      <button
                        className={`icon-btn toggle ${b.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleStatus(b)}
                      >
                        {b.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(b)}>Delete</button>
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
          <div className="modal-container design-modal" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>{editingBanner ? 'Edit Banner' : 'Create Banner'}</h2>
              <button className="close-modal-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {formError && <div className="admin-error-banner">{formError}</div>}

              <div className="form-group">
                <label>Banner Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AUTUMN / WINTER COUTURE"
                />
              </div>

              <div className="form-group">
                <label>Subtitle / Description</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. High fashion ready-to-wear meets custom apparel"
                />
              </div>

              <div className="form-group">
                <label>Banner Image (Cloudinary)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    style={{ flex: 1 }}
                  />
                  {uploadingImage && <span style={{ fontSize: '0.85rem', color: '#E5C158' }}>Uploading...</span>}
                </div>
                {image && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={image} alt="Preview" style={{ height: '60px', borderRadius: '4px', border: '1px solid #444' }} />
                    <button type="button" className="icon-btn delete" onClick={() => { setImage(''); setImagePublicId(''); }}>
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. Shop T-Shirts"
                  />
                </div>

                <div className="form-group">
                  <label>Button Link</label>
                  <input
                    type="text"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="e.g. /catalog or /studio"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Sort Order (Ascending)</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="form-group checkbox-group" style={{ marginTop: '1.8rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Active on Homepage
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-action-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-action-btn" disabled={submitting || uploadingImage}>
                  {submitting ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Banners;

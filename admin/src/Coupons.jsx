import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('0');
  const [maximumDiscountAmount, setMaximumDiscountAmount] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/coupons/admin`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.data?.coupons) {
        setCoupons(data.data.coupons);
      } else {
        setError(data.message || 'Failed to fetch coupons');
      }
    } catch (err) {
      setError('Error connecting to coupons endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16);
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinimumOrderAmount('0');
    setMaximumDiscountAmount('0');
    setStartDate('');
    setEndDate('');
    setUsageLimit('0');
    setIsActive(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCoupon(c);
    setCode(c.code || '');
    setDiscountType(c.discountType || 'percentage');
    setDiscountValue(c.discountValue ? c.discountValue.toString() : '');
    setMinimumOrderAmount(c.minimumOrderAmount !== undefined ? c.minimumOrderAmount.toString() : '0');
    setMaximumDiscountAmount(c.maximumDiscountAmount !== undefined ? c.maximumDiscountAmount.toString() : '0');
    setStartDate(formatDateForInput(c.startDate));
    setEndDate(formatDateForInput(c.endDate));
    setUsageLimit(c.usageLimit !== undefined ? c.usageLimit.toString() : '0');
    setIsActive(c.isActive !== false);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim()) {
      setFormError('Coupon code is required');
      return;
    }

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      setFormError('Discount value must be greater than 0');
      return;
    }

    if (discountType === 'percentage' && val > 100) {
      setFormError('Percentage discount cannot exceed 100%');
      return;
    }

    const minOrder = parseFloat(minimumOrderAmount) || 0;
    if (minOrder < 0) {
      setFormError('Minimum order amount cannot be negative');
      return;
    }

    const maxDisc = parseFloat(maximumDiscountAmount) || 0;
    if (maxDisc < 0) {
      setFormError('Maximum discount amount cannot be negative');
      return;
    }

    const uLimit = parseInt(usageLimit, 10) || 0;
    if (uLimit < 0) {
      setFormError('Usage limit cannot be negative');
      return;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setFormError('End date cannot be before start date');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingCoupon
        ? `${API_BASE_URL}/api/v1/coupons/admin/${editingCoupon._id}`
        : `${API_BASE_URL}/api/v1/coupons/admin`;

      const method = editingCoupon ? 'PATCH' : 'POST';

      const payload = {
        code: code.trim(),
        discountType,
        discountValue: val,
        minimumOrderAmount: minOrder,
        maximumDiscountAmount: maxDisc,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        usageLimit: uLimit,
        isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`Coupon ${editingCoupon ? 'updated' : 'created'} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        setModalOpen(false);
        fetchCoupons();
      } else {
        setFormError(data.message || 'Failed to save coupon');
      }
    } catch (err) {
      setFormError('Network error saving coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (c) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/coupons/admin/${c._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Coupon status updated to ${!c.isActive ? 'Active' : 'Inactive'}`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchCoupons();
      } else {
        setError(data.message || 'Failed to update coupon status');
      }
    } catch (err) {
      setError('Failed to update coupon status');
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${c.code}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/coupons/admin/${c._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Coupon deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchCoupons();
      } else {
        setError(data.message || 'Failed to delete coupon');
        setTimeout(() => setError(null), 4000);
      }
    } catch (err) {
      setError('Failed to delete coupon');
    }
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage) || 1;
  const paginatedCoupons = filteredCoupons.slice(
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
          <h1 className="admin-page-title">COUPONS MANAGEMENT</h1>
          <p className="admin-page-subtitle">Create and manage promotional discount codes for customer checkout</p>
        </div>
        <button className="admin-submit-btn" onClick={openCreateModal}>
          + CREATE NEW COUPON
        </button>
      </div>

      {successMessage && <div className="admin-success-banner">{successMessage}</div>}
      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <input
            type="text"
            placeholder="Search coupon codes..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-app-loading" style={{ height: '300px' }}>
          <div className="admin-spinner"></div>
          <span>Loading Coupons...</span>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="admin-empty-box">
          <p>No coupons found matching your search.</p>
          <button className="secondary-action-btn" onClick={openCreateModal}>Create Coupon</button>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>DISCOUNT</th>
                  <th>MIN ORDER</th>
                  <th>MAX DISCOUNT</th>
                  <th>USAGE</th>
                  <th>VALIDITY</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCoupons.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <strong style={{ color: '#111111', fontSize: '1rem', letterSpacing: '0.05em' }}>{c.code}</strong>
                    </td>
                    <td>
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </td>
                    <td>₹{c.minimumOrderAmount || 0}</td>
                    <td>{c.discountType === 'percentage' && c.maximumDiscountAmount ? `₹${c.maximumDiscountAmount}` : '—'}</td>
                    <td>
                      {c.usedCount} / {c.usageLimit > 0 ? c.usageLimit : '∞'}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {c.startDate ? new Date(c.startDate).toLocaleDateString() : 'Immediate'}
                        {' - '}
                        {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'No expiry'}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${c.isActive ? 'active' : 'inactive'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
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
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredCoupons.length} total coupons)
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
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="admin-modal-header">
              <h2>{editingCoupon ? 'EDIT COUPON' : 'CREATE NEW COUPON'}</h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form-stack">
              {formError && <div className="admin-error-banner">{formError}</div>}

              <div className="admin-input-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10, FESTIVE25"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-input-group flex-1">
                  <label>Discount Type *</label>
                  <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className="admin-input-group flex-1">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? 'e.g. 15' : 'e.g. 200'}
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-input-group flex-1">
                  <label>Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minimumOrderAmount}
                    onChange={(e) => setMinimumOrderAmount(e.target.value)}
                    placeholder="0 for no minimum"
                  />
                </div>

                {discountType === 'percentage' && (
                  <div className="admin-input-group flex-1">
                    <label>Maximum Discount Cap (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={maximumDiscountAmount}
                      onChange={(e) => setMaximumDiscountAmount(e.target.value)}
                      placeholder="0 for uncapped"
                    />
                  </div>
                )}
              </div>

              <div className="admin-form-row">
                <div className="admin-input-group flex-1">
                  <label>Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="admin-input-group flex-1">
                  <label>End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label>Usage Limit (Total Max Uses)</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="0 for unlimited usage"
                />
              </div>

              <div className="admin-input-group checkbox-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  Active & Redeemable at Checkout
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-submit-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Coupons;

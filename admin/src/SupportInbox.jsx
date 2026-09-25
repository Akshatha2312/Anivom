import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

const SupportInbox = () => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalMessages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 15);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`${API_BASE_URL}/api/v1/contact/admin?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch support inbox messages.');
      }
      setMessages(data.data?.messages || []);
      setUnreadCount(data.unreadCount || 0);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Error loading support messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentPage, statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/contact/admin/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update message status.');
      }
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(data.data.message);
      }
      fetchMessages();
    } catch (err) {
      alert(err.message || 'Error updating status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/contact/admin/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete message.');
      }
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
      setDeleteConfirmId(null);
      fetchMessages();
    } catch (err) {
      alert(err.message || 'Error deleting message.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'unread') {
      return <span style={{ background: '#500B13', color: '#FDFBF7', padding: '3px 8px', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em', borderRadius: '2px', border: '1px solid #C6A15B' }}>UNREAD</span>;
    }
    if (status === 'read') {
      return <span style={{ background: '#EFECE6', color: '#2B2B2B', padding: '3px 8px', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.05em', borderRadius: '2px' }}>READ</span>;
    }
    if (status === 'resolved') {
      return <span style={{ background: '#15803D', color: '#FFFFFF', padding: '3px 8px', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.05em', borderRadius: '2px' }}>RESOLVED</span>;
    }
    return status;
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">SUPPORT INBOX</h1>
          <p className="admin-page-subtitle">Review customer inquiries, order assistance requests, and manage client communications</p>
        </div>
        <button className="admin-btn-secondary" onClick={fetchMessages}>
          Refresh Inbox ↻
        </button>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-filter-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label>Filter Status:</label>
          <button
            className={`admin-btn-secondary sm ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
            style={{ fontWeight: statusFilter === '' ? '700' : 'normal', borderBottom: statusFilter === '' ? '2px solid #500B13' : '1px solid #D8D2C6' }}
          >
            ALL ({pagination.totalMessages || messages.length})
          </button>
          <button
            className={`admin-btn-secondary sm ${statusFilter === 'unread' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('unread'); setCurrentPage(1); }}
            style={{ fontWeight: statusFilter === 'unread' ? '700' : 'normal', color: unreadCount > 0 ? '#500B13' : 'inherit', borderBottom: statusFilter === 'unread' ? '2px solid #500B13' : '1px solid #D8D2C6' }}
          >
            UNREAD ({unreadCount})
          </button>
          <button
            className={`admin-btn-secondary sm ${statusFilter === 'read' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('read'); setCurrentPage(1); }}
            style={{ fontWeight: statusFilter === 'read' ? '700' : 'normal', borderBottom: statusFilter === 'read' ? '2px solid #500B13' : '1px solid #D8D2C6' }}
          >
            READ
          </button>
          <button
            className={`admin-btn-secondary sm ${statusFilter === 'resolved' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('resolved'); setCurrentPage(1); }}
            style={{ fontWeight: statusFilter === 'resolved' ? '700' : 'normal', borderBottom: statusFilter === 'resolved' ? '2px solid #500B13' : '1px solid #D8D2C6' }}
          >
            RESOLVED
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-state-container">
          <div className="admin-spinner"></div>
          <p>Loading Support Messages...</p>
        </div>
      ) : error ? (
        <div className="admin-state-container">
          <p className="admin-error-text">{error}</p>
          <button className="admin-btn-secondary" onClick={fetchMessages}>
            Retry Loading
          </button>
        </div>
      ) : messages.length === 0 ? (
        <div className="admin-empty-box">
          <p>No support messages found matching your filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>STATUS</th>
                  <th>CUSTOMER</th>
                  <th>EMAIL</th>
                  <th>SUBJECT</th>
                  <th>ORDER ID</th>
                  <th>DATE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg._id}
                    style={{
                      backgroundColor: msg.status === 'unread' ? 'rgba(80, 11, 19, 0.04)' : 'transparent',
                      fontWeight: msg.status === 'unread' ? '600' : 'normal',
                    }}
                  >
                    <td>{getStatusBadge(msg.status)}</td>
                    <td>{msg.name}</td>
                    <td>{msg.email}</td>
                    <td style={{ maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {msg.subject || 'General Support Inquiry'}
                    </td>
                    <td>{msg.orderId ? <code>{msg.orderId}</code> : '—'}</td>
                    <td>{formatDate(msg.createdAt)}</td>
                    <td>
                      <button
                        className="admin-btn-secondary sm"
                        onClick={() => {
                          setSelectedMessage(msg);
                          if (msg.status === 'unread') {
                            handleUpdateStatus(msg._id, 'read');
                          }
                        }}
                      >
                        Inspect &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="admin-btn-secondary sm"
              >
                &larr; Prev
              </button>
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="admin-btn-secondary sm"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}

      {selectedMessage && (
        <div className="admin-modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="admin-modal-header">
              <div>
                <span style={{ fontSize: '0.7rem', color: '#C6A15B', fontWeight: '700', letterSpacing: '0.1em' }}>
                  CUSTOMER INQUIRY DETAILS
                </span>
                <h2 style={{ fontSize: '1.25rem', fontFamily: 'serif', margin: '4px 0 0 0', color: '#111' }}>
                  {selectedMessage.subject || 'General Support Inquiry'}
                </h2>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedMessage(null)}>
                ✕
              </button>
            </div>

            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#F9F7F2', padding: '12px 16px', border: '1px solid #EFECE6' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#777', textTransform: 'uppercase' }}>Customer Name</span>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#111' }}>{selectedMessage.name}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#777', textTransform: 'uppercase' }}>Email Address</span>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#111' }}>{selectedMessage.email}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#777', textTransform: 'uppercase' }}>Order Reference</span>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#111' }}>
                    {selectedMessage.orderId ? <code>{selectedMessage.orderId}</code> : 'None'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#777', textTransform: 'uppercase' }}>Submitted At</span>
                  <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#111' }}>{formatDate(selectedMessage.createdAt)}</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#777', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Current Message Status
                </span>
                <div>{getStatusBadge(selectedMessage.status)}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#777', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Customer Message Content
                </span>
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D8D2C6',
                    padding: '14px 16px',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    color: '#222',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '220px',
                    overflowY: 'auto',
                  }}
                >
                  {selectedMessage.message}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #EFECE6' }}>
                {selectedMessage.status !== 'read' && (
                  <button
                    disabled={updating}
                    className="admin-btn-secondary sm"
                    onClick={() => handleUpdateStatus(selectedMessage._id, 'read')}
                  >
                    Mark as Read
                  </button>
                )}

                {selectedMessage.status !== 'resolved' && (
                  <button
                    disabled={updating}
                    className="admin-btn-primary sm"
                    style={{ background: '#15803D', borderColor: '#15803D' }}
                    onClick={() => handleUpdateStatus(selectedMessage._id, 'resolved')}
                  >
                    Mark as Resolved ✓
                  </button>
                )}

                {selectedMessage.status === 'resolved' && (
                  <button
                    disabled={updating}
                    className="admin-btn-secondary sm"
                    onClick={() => handleUpdateStatus(selectedMessage._id, 'unread')}
                  >
                    Reopen as Unread
                  </button>
                )}

                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject || 'ANIVOM Support Inquiry'}`)}`}
                  className="admin-btn-secondary sm"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  Reply via Email ✉
                </a>

                {deleteConfirmId === selectedMessage._id ? (
                  <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '0.75rem', color: '#500B13', fontWeight: '700' }}>Confirm delete?</span>
                    <button
                      disabled={updating}
                      className="admin-btn-primary sm"
                      style={{ background: '#500B13', borderColor: '#500B13' }}
                      onClick={() => handleDeleteMessage(selectedMessage._id)}
                    >
                      Yes, Delete
                    </button>
                    <button
                      className="admin-btn-secondary sm"
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={updating}
                    className="admin-btn-secondary sm"
                    style={{ marginLeft: 'auto', color: '#500B13', borderColor: '#500B13' }}
                    onClick={() => setDeleteConfirmId(selectedMessage._id)}
                  >
                    Delete Message 🗑
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportInbox;

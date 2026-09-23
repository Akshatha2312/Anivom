import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 10);
      if (search.trim()) params.append('search', search.trim());
      if (roleFilter) params.append('role', roleFilter);

      const res = await fetch(`${API_BASE_URL}/api/v1/auth/users/admin?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load user directory.');
      }
      setUsers(data.data?.users || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Error fetching users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">CUSTOMER & USER DIRECTORY</h1>
          <p className="admin-page-subtitle">View registered ANIVOM accounts, role assignments, and registration timestamps</p>
        </div>
        <button className="admin-btn-secondary" onClick={fetchUsers}>
          Refresh Directory ↻
        </button>
      </div>

      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-box">
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="admin-btn-secondary sm">
            Search
          </button>
        </form>

        <div className="admin-filter-group">
          <label>Account Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Account Roles</option>
            <option value="customer">Customer Accounts</option>
            <option value="admin">Admin Accounts</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-state-container">
          <div className="admin-spinner"></div>
          <p>Loading User Directory...</p>
        </div>
      ) : error ? (
        <div className="admin-state-container">
          <p className="admin-error-text">{error}</p>
          <button className="admin-btn-secondary" onClick={fetchUsers}>
            Retry Loading
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-empty-box">
          <p>No user accounts match your search or filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ACCOUNT ID</th>
                  <th>FULL NAME</th>
                  <th>EMAIL ADDRESS</th>
                  <th>ACCOUNT ROLE</th>
                  <th>JOIN DATE</th>
                </tr>
              </thead>
              <tbody>
                {users.map((usr) => (
                  <tr key={usr._id}>
                    <td className="mono-text">#{usr._id.slice(-8).toUpperCase()}</td>
                    <td><strong>{usr.name}</strong></td>
                    <td className="mono-text">{usr.email}</td>
                    <td>
                      <span className={`role-badge ${usr.role}`}>
                        {usr.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(usr.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="admin-pagination-bar">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="admin-btn-secondary sm"
              >
                &larr; Previous Page
              </button>
              <span className="pagination-info">
                Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.totalUsers} accounts)
              </span>
              <button
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className="admin-btn-secondary sm"
              >
                Next Page &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Customers;

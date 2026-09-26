import React, { useState } from 'react';
import { API_BASE_URL } from './config';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      const meRes = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        credentials: 'include',
      });
      const meData = await meRes.json();

      if (!meRes.ok || !meData.data?.user) {
        throw new Error('Failed to verify user profile.');
      }

      const user = meData.data.user;

      if (user.role !== 'admin') {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
        throw new Error('Access denied. Admin privileges required.');
      }

      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <span className="admin-brand-tag">ANIVOM ATELIER</span>
          <h1 className="admin-login-title">MANAGEMENT STUDIO</h1>
          <p className="admin-login-subtitle">Sign in to access admin workspace</p>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-input-group">
            <label>Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@anivom.com"
            />
          </div>

          <div className="admin-input-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="admin-submit-btn">
            {loading ? 'AUTHENTICATING...' : 'ENTER WORKSPACE'}
          </button>
        </form>

        <div className="admin-test-credentials-box">
          <div className="admin-test-credentials-title">ADMIN TEST CREDENTIALS</div>
          <div className="admin-test-credentials-row">
            <span className="admin-test-credentials-label">Email:</span>
            <code className="admin-test-credentials-value">admin@anivom.com</code>
          </div>
          <div className="admin-test-credentials-row">
            <span className="admin-test-credentials-label">Password:</span>
            <code className="admin-test-credentials-value">admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

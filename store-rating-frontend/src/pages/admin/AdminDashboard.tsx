import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import type { DashboardStats } from '../../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/dashboard').then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header"><h1>Admin Dashboard</h1></div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-value">{stats?.totalUsers ?? 0}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats?.totalStores ?? 0}</div>
                <div className="stat-label">Total Stores</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats?.totalRatings ?? 0}</div>
                <div className="stat-label">Total Ratings</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <Link to="/admin/users" style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', borderLeft: '4px solid #0f3460', transition: 'box-shadow 0.2s' }}>
                  <h3 style={{ marginBottom: 8 }}>👥 Manage Users</h3>
                  <p style={{ color: '#888', fontSize: '0.9rem' }}>View, add, and filter all users</p>
                </div>
              </Link>
              <Link to="/admin/stores" style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', borderLeft: '4px solid #43a047', transition: 'box-shadow 0.2s' }}>
                  <h3 style={{ marginBottom: 8 }}>🏪 Manage Stores</h3>
                  <p style={{ color: '#888', fontSize: '0.9rem' }}>View, add, and filter all stores</p>
                </div>
              </Link>
              <Link to="/update-password" style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b', transition: 'box-shadow 0.2s' }}>
                  <h3 style={{ marginBottom: 8 }}>🔑 Update Password</h3>
                  <p style={{ color: '#888', fontSize: '0.9rem' }}>Change your account password</p>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating';
import api from '../../api/axios';
import type { StoreOwnerDashboard } from '../../types';
import toast from 'react-hot-toast';

export default function OwnerDashboardPage() {
  const [data, setData] = useState<StoreOwnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'rating'>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  useEffect(() => {
    api.get('/stores/owner-dashboard')
      .then((r) => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (col: 'name' | 'email' | 'rating') => {
    setSortOrder((o) => (sortBy === col ? (o === 'ASC' ? 'DESC' : 'ASC') : 'ASC'));
    setSortBy(col);
  };
  const sortIcon = (col: string) => sortBy === col ? (sortOrder === 'ASC' ? ' ▲' : ' ▼') : ' ↕';

  const sortedRaters = data?.raters.slice().sort((a, b) => {
    const dir = sortOrder === 'ASC' ? 1 : -1;
    if (sortBy === 'rating') return (a.rating - b.rating) * dir;
    return a[sortBy] > b[sortBy] ? dir : -dir;
  }) ?? [];

  if (loading) return <><Navbar /><div className="loading">Loading...</div></>;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1>Store Dashboard</h1>
          <Link to="/update-password" className="btn btn-secondary btn-sm">Update Password</Link>
        </div>

        {!data ? (
          <div className="card empty">No store assigned to your account yet.</div>
        ) : (
          <>
            <div className="card" style={{ marginBottom: 24 }}>
              <h2 style={{ marginBottom: 16 }}>{data.store.name}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div>
                  <div style={{ color: '#888', fontSize: '0.85rem' }}>Email</div>
                  <div>{data.store.email}</div>
                </div>
                <div>
                  <div style={{ color: '#888', fontSize: '0.85rem' }}>Address</div>
                  <div>{data.store.address}</div>
                </div>
                <div>
                  <div style={{ color: '#888', fontSize: '0.85rem' }}>Total Ratings</div>
                  <div style={{ fontWeight: 700, fontSize: '1.4rem', color: '#0f3460' }}>{data.totalRatings}</div>
                </div>
                <div>
                  <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: 4 }}>Average Rating</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StarRating value={Math.round(data.averageRating)} readonly />
                    <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '1.1rem' }}>{data.averageRating.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Users who rated your store</h3>
              {sortedRaters.length === 0 ? (
                <div className="empty">No ratings yet</div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('name')}>Name<span className="sort-icon">{sortIcon('name')}</span></th>
                        <th onClick={() => handleSort('email')}>Email<span className="sort-icon">{sortIcon('email')}</span></th>
                        <th onClick={() => handleSort('rating')}>Rating<span className="sort-icon">{sortIcon('rating')}</span></th>
                        <th>Rated At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRaters.map((r) => (
                        <tr key={r.userId}>
                          <td>{r.name}</td>
                          <td>{r.email}</td>
                          <td><StarRating value={r.rating} readonly /></td>
                          <td style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(r.ratedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

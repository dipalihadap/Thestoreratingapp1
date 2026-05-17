import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating';
import api from '../../api/axios';
import type { User } from '../../types';

const ROLE_LABELS: Record<string, string> = { admin: 'Admin', normal_user: 'Normal User', store_owner: 'Store Owner' };

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User & { ownedStore?: any; ratings?: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}`).then((r) => setUser(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <><Navbar /><div className="loading">Loading...</div></>;
  if (!user) return <><Navbar /><div className="loading">User not found</div></>;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1>User Details</h1>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>← Back</button>
        </div>
        <div className="card" style={{ maxWidth: 600 }}>
          <table style={{ width: '100%' }}>
            <tbody>
              {[
                ['Name', user.name],
                ['Email', user.email],
                ['Address', user.address],
                ['Role', <span className={`badge badge-${user.role}`}>{ROLE_LABELS[user.role]}</span>],
              ].map(([label, value]) => (
                <tr key={label as string}>
                  <td style={{ padding: '10px 0', fontWeight: 600, color: '#555', width: 130 }}>{label}</td>
                  <td style={{ padding: '10px 0' }}>{value as any}</td>
                </tr>
              ))}
              {user.role === 'store_owner' && user.ownedStore && (
                <tr>
                  <td style={{ padding: '10px 0', fontWeight: 600, color: '#555' }}>Store</td>
                  <td style={{ padding: '10px 0' }}>{user.ownedStore.name}</td>
                </tr>
              )}
              {user.role === 'store_owner' && user.ratings && user.ratings.length > 0 && (
                <tr>
                  <td style={{ padding: '10px 0', fontWeight: 600, color: '#555' }}>Rating Given</td>
                  <td style={{ padding: '10px 0' }}>
                    <StarRating value={user.ratings[0].value} readonly />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

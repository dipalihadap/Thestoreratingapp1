import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating';
import api from '../../api/axios';
import type { Store } from '../../types';
import toast from 'react-hot-toast';

export default function UserStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [ratingModal, setRatingModal] = useState<{ store: Store; isEdit: boolean } | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search.name) params.name = search.name;
      if (search.address) params.address = search.address;
      const res = await api.get('/stores', { params });
      setStores(res.data);
    } catch { toast.error('Failed to load stores'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStores(); }, []);

  const openRatingModal = (store: Store) => {
    setRatingModal({ store, isEdit: store.userRating != null });
    setRatingValue(store.userRating ?? 0);
  };

  const handleSubmitRating = async () => {
    if (ratingValue === 0) { toast.error('Please select a rating'); return; }
    setSaving(true);
    try {
      if (ratingModal!.isEdit) {
        await api.patch(`/ratings/${ratingModal!.store.id}`, { value: ratingValue });
        toast.success('Rating updated!');
      } else {
        await api.post('/ratings', { storeId: ratingModal!.store.id, value: ratingValue });
        toast.success('Rating submitted!');
      }
      setRatingModal(null);
      fetchStores();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to submit rating');
    } finally { setSaving(false); }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1>All Stores</h1>
          <Link to="/update-password" className="btn btn-secondary btn-sm">Update Password</Link>
        </div>

        <div className="filters">
          <input
            placeholder="Search by name..."
            value={search.name}
            onChange={(e) => setSearch((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            placeholder="Search by address..."
            value={search.address}
            onChange={(e) => setSearch((s) => ({ ...s, address: e.target.value }))}
          />
          <button className="btn btn-primary btn-sm" onClick={fetchStores}>Search</button>
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch({ name: '', address: '' }); fetchStores(); }}>Reset</button>
        </div>

        {loading ? (
          <div className="loading">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="empty">No stores found</div>
        ) : (
          <div className="stores-grid">
            {stores.map((store) => (
              <div key={store.id} className="store-card">
                <h3>{store.name}</h3>
                <div className="store-address">📍 {store.address}</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <StarRating value={Math.round(store.averageRating ?? 0)} readonly />
                    <span className="avg-rating">{(store.averageRating ?? 0).toFixed(1)}</span>
                    <span style={{ color: '#aaa', fontSize: '0.8rem' }}>avg</span>
                  </div>
                  {store.userRating != null && (
                    <div style={{ fontSize: '0.82rem', color: '#666' }}>
                      Your rating: <strong style={{ color: '#f59e0b' }}>{'★'.repeat(store.userRating)}</strong> ({store.userRating}/5)
                    </div>
                  )}
                </div>
                <button
                  className={`btn btn-sm ${store.userRating != null ? 'btn-secondary' : 'btn-success'}`}
                  onClick={() => openRatingModal(store)}
                >
                  {store.userRating != null ? 'Modify Rating' : 'Rate Store'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {ratingModal && (
        <div className="modal-overlay" onClick={() => setRatingModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{ratingModal.isEdit ? 'Modify Your Rating' : 'Rate This Store'}</h3>
            <p style={{ color: '#888', marginBottom: 20, fontSize: '0.9rem' }}>{ratingModal.store.name}</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ transform: 'scale(1.6)', transformOrigin: 'center' }}>
                <StarRating value={ratingValue} onChange={setRatingValue} />
              </div>
            </div>
            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: 20 }}>
              {ratingValue > 0 ? `You selected ${ratingValue} star${ratingValue > 1 ? 's' : ''}` : 'Click a star to rate'}
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setRatingModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmitRating} disabled={saving || ratingValue === 0}>
                {saving ? 'Saving...' : ratingModal.isEdit ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

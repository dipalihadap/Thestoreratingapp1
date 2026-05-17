import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating';
import api from '../../api/axios';
import type { Store } from '../../types';
import toast from 'react-hot-toast';

interface Filters { name: string; email: string; address: string; sortBy: string; sortOrder: string; }
const defaultFilters: Filters = { name: '', email: '', address: '', sortBy: 'createdAt', sortOrder: 'DESC' };
interface CreateForm { name: string; email: string; address: string; }
const emptyForm: CreateForm = { name: '', email: '', address: '' };

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await api.get('/stores', { params });
      setStores(res.data);
    } catch { toast.error('Failed to load stores'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStores(); }, [filters.sortBy, filters.sortOrder]);

  const handleSort = (col: string) => {
    setFilters((f) => ({ ...f, sortBy: col, sortOrder: f.sortBy === col && f.sortOrder === 'ASC' ? 'DESC' : 'ASC' }));
  };
  const sortIcon = (col: string) => filters.sortBy === col ? (filters.sortOrder === 'ASC' ? ' ▲' : ' ▼') : ' ↕';

  const validateForm = () => {
    if (form.name.length < 20 || form.name.length > 60) return 'Store name must be 20–60 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email';
    if (form.address.length > 400) return 'Address max 400 characters';
    return '';
  };

  const handleCreate = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setSaving(true);
    try {
      await api.post('/stores', form);
      toast.success('Store created!');
      setShowModal(false);
      setForm(emptyForm);
      fetchStores();
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1>Stores</h1>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(''); setForm(emptyForm); }}>
            + Add Store
          </button>
        </div>

        <div className="filters">
          <input placeholder="Search name..." value={filters.name} onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))} />
          <input placeholder="Search email..." value={filters.email} onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))} />
          <input placeholder="Search address..." value={filters.address} onChange={(e) => setFilters((f) => ({ ...f, address: e.target.value }))} />
          <button className="btn btn-primary btn-sm" onClick={fetchStores}>Search</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters(defaultFilters)}>Reset</button>
        </div>

        <div className="card">
          {loading ? <div className="loading">Loading...</div> : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')}>Name<span className="sort-icon">{sortIcon('name')}</span></th>
                    <th onClick={() => handleSort('email')}>Email<span className="sort-icon">{sortIcon('email')}</span></th>
                    <th onClick={() => handleSort('address')}>Address<span className="sort-icon">{sortIcon('address')}</span></th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr><td colSpan={4} className="empty">No stores found</td></tr>
                  ) : stores.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.address}</td>
                      <td>
                        <StarRating value={Math.round(s.averageRating ?? 0)} readonly />
                        <small style={{ color: '#888' }}> ({(s.averageRating ?? 0).toFixed(1)})</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Store</h3>
            {formError && <div className="alert-error">{formError}</div>}
            <div className="form-group"><label>Store Name (20–60 chars)</label><input type="text" value={form.name} onChange={set('name')} /></div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={set('email')} /></div>
            <div className="form-group"><label>Address (max 400 chars)</label><input type="text" value={form.address} onChange={set('address')} /></div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

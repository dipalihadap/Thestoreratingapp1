import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import type { User } from '../../types';
import toast from 'react-hot-toast';

const ROLES = ['', 'admin', 'normal_user', 'store_owner'];
const ROLE_LABELS: Record<string, string> = { admin: 'Admin', normal_user: 'Normal User', store_owner: 'Store Owner' };

interface Filters { name: string; email: string; address: string; role: string; sortBy: string; sortOrder: string; }

const defaultFilters: Filters = { name: '', email: '', address: '', role: '', sortBy: 'createdAt', sortOrder: 'DESC' };

interface CreateForm { name: string; email: string; address: string; password: string; role: string; }
const emptyForm: CreateForm = { name: '', email: '', address: '', password: '', role: 'normal_user' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await api.get('/users', { params });
      setUsers(res.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [filters.sortBy, filters.sortOrder]);

  const handleSearch = () => fetchUsers();

  const handleSort = (col: string) => {
    setFilters((f) => ({ ...f, sortBy: col, sortOrder: f.sortBy === col && f.sortOrder === 'ASC' ? 'DESC' : 'ASC' }));
  };

  const sortIcon = (col: string) =>
    filters.sortBy === col ? (filters.sortOrder === 'ASC' ? ' ▲' : ' ▼') : ' ↕';

  const validateForm = () => {
    if (form.name.length < 20 || form.name.length > 60) return 'Name must be 20–60 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email';
    if (form.address.length > 400) return 'Address max 400 chars';
    if (form.password.length < 8 || form.password.length > 16) return 'Password must be 8–16 characters';
    if (!/[A-Z]/.test(form.password)) return 'Password needs an uppercase letter';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) return 'Password needs a special character';
    return '';
  };

  const handleCreate = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setSaving(true);
    try {
      await api.post('/users', form);
      toast.success('User created!');
      setShowModal(false);
      setForm(emptyForm);
      fetchUsers();
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Failed to create user');
    } finally { setSaving(false); }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1>Users</h1>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(''); setForm(emptyForm); }}>
            + Add User
          </button>
        </div>

        <div className="filters">
          <input placeholder="Search name..." value={filters.name} onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))} />
          <input placeholder="Search email..." value={filters.email} onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))} />
          <input placeholder="Search address..." value={filters.address} onChange={(e) => setFilters((f) => ({ ...f, address: e.target.value }))} />
          <select value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}>
            <option value="">All Roles</option>
            {ROLES.filter(Boolean).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={handleSearch}>Search</button>
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilters(defaultFilters); }}>Reset</button>
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
                    <th onClick={() => handleSort('role')}>Role<span className="sort-icon">{sortIcon('role')}</span></th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="empty">No users found</td></tr>
                  ) : users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.address}</td>
                      <td><span className={`badge badge-${u.role}`}>{ROLE_LABELS[u.role]}</span></td>
                      <td><button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/users/${u.id}`)}>View</button></td>
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
            <h3>Add New User</h3>
            {formError && <div className="alert-error">{formError}</div>}
            <div className="form-group"><label>Full Name (20–60 chars)</label><input type="text" value={form.name} onChange={set('name')} /></div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={set('email')} /></div>
            <div className="form-group"><label>Address (max 400 chars)</label><input type="text" value={form.address} onChange={set('address')} /></div>
            <div className="form-group"><label>Password (8–16, uppercase + special)</label><input type="password" value={form.password} onChange={set('password')} /></div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={set('role')}>
                <option value="normal_user">Normal User</option>
                <option value="admin">Admin</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
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

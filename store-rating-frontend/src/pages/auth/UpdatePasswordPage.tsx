import { useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function UpdatePasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateNew = (p: string) => {
    if (p.length < 8 || p.length > 16) return 'Password must be 8–16 characters';
    if (!/[A-Z]/.test(p)) return 'Must contain at least one uppercase letter';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p)) return 'Must contain at least one special character';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateNew(form.newPassword);
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await api.patch('/auth/update-password', form);
      toast.success('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header"><h1>Update Password</h1></div>
        <div className="card" style={{ maxWidth: 440 }}>
          {error && <div className="alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                placeholder="8–16 chars, 1 uppercase, 1 special"
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

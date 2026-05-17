import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

interface FormErrors {
  name?: string;
  email?: string;
  address?: string;
  password?: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (form.name.length < 20) e.name = 'Name must be at least 20 characters';
    if (form.name.length > 60) e.name = 'Name must not exceed 60 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.address.length > 400) e.address = 'Address must not exceed 400 characters';
    if (form.password.length < 8 || form.password.length > 16)
      e.password = 'Password must be 8–16 characters';
    else if (!/[A-Z]/.test(form.password))
      e.password = 'Password must contain at least one uppercase letter';
    else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password))
      e.password = 'Password must contain at least one special character';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create account</h2>
        <p>Join StoreRater today</p>
        {apiError && <div className="alert-error">{apiError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={form.name} onChange={set('name')} placeholder="Min 20, Max 60 characters" />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" value={form.address} onChange={set('address')} placeholder="Max 400 characters" />
            {errors.address && <div className="form-error">{errors.address}</div>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="8–16 chars, 1 uppercase, 1 special" />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-center mt-16" style={{ fontSize: '0.9rem', color: '#666' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

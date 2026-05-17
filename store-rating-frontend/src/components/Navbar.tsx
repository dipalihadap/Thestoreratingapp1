import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel: Record<string, string> = {
    admin: 'Admin',
    normal_user: 'User',
    store_owner: 'Store Owner',
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">⭐ StoreRater</span>
      {user && (
        <div className="navbar-user">
          <span>{user.name}</span>
          <span className="navbar-role">{roleLabel[user.role] || user.role}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}

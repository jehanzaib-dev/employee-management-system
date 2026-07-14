import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate('/login', { replace: true });
    }

    return (
        <div className="app-shell">
            <div className="app-main">
                <div className="topbar">
                    <nav className="nav">
                        <strong>Employee Management System</strong>
                        <NavLink to="/" end className="nav-link">
                            Dashboard
                        </NavLink>
                        <NavLink to="/employees" className="nav-link">
                            Employees
                        </NavLink>
                        <NavLink to="/departments" className="nav-link">
                            Departments
                        </NavLink>
                        {user.role === 'admin' && (
                            <NavLink to="/admin/users" className="nav-link">
                                Admin
                            </NavLink>
                        )}
                    </nav>

                    <div>
                        <span style={{ marginRight: '1rem' }}>{user.name}</span>
                        <button type="button" className="btn-secondary btn" onClick={handleLogout}>
                            Log out
                        </button>
                    </div>
                </div>

                <Outlet />
            </div>
        </div>
    );
}

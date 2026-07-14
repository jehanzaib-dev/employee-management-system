import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="card" style={{ marginTop: '1.5rem' }}>
            <h1>Welcome, {user.name}</h1>
            <p>Role: {user.role}</p>
        </div>
    );
}

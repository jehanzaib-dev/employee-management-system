import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteUser, fetchUsers } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function UserList() {
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    function loadUsers() {
        setIsLoading(true);

        fetchUsers()
            .then((response) => setUsers(response.data))
            .catch(() => setError('Failed to load users.'))
            .finally(() => setIsLoading(false));
    }

    async function handleDelete(user) {
        if (!confirm(`Delete ${user.name}?`)) {
            return;
        }

        setError('');

        try {
            await deleteUser(user.id);
            setUsers((current) => current.filter((item) => item.id !== user.id));
        } catch (deleteError) {
            setError(deleteError.response?.data?.message ?? 'Failed to delete user.');
        }
    }

    return (
        <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="list-header">
                <h1>Users</h1>
                <Link to="/admin/users/new" className="btn">
                    Add User
                </Link>
            </div>

            {error && <div className="form-error">{error}</div>}

            {isLoading ? (
                <p>Loading…</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    {user.name}
                                    {user.id === currentUser.id && ' (you)'}
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className="badge">{user.role}</span>
                                </td>
                                <td className="table-actions">
                                    <Link to={`/admin/users/${user.id}/edit`}>Edit</Link>
                                    {user.id !== currentUser.id && (
                                        <button
                                            type="button"
                                            className="link-danger"
                                            onClick={() => handleDelete(user)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

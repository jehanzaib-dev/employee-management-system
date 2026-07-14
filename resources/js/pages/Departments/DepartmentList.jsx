import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteDepartment, fetchDepartments } from '../../api/client';

export default function DepartmentList() {
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDepartments();
    }, []);

    function loadDepartments() {
        setIsLoading(true);

        fetchDepartments()
            .then((response) => setDepartments(response.data))
            .catch(() => setError('Failed to load departments.'))
            .finally(() => setIsLoading(false));
    }

    async function handleDelete(department) {
        if (!confirm(`Delete ${department.name}?`)) {
            return;
        }

        setError('');

        try {
            await deleteDepartment(department.id);
            setDepartments((current) => current.filter((item) => item.id !== department.id));
        } catch (deleteError) {
            setError(deleteError.response?.data?.message ?? 'Failed to delete department.');
        }
    }

    return (
        <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="list-header">
                <h1>Departments</h1>
                <Link to="/departments/new" className="btn">
                    Add Department
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
                            <th>Description</th>
                            <th>Employees</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((department) => (
                            <tr key={department.id}>
                                <td>{department.name}</td>
                                <td>{department.description}</td>
                                <td>{department.employees_count}</td>
                                <td className="table-actions">
                                    <Link to={`/departments/${department.id}/edit`}>Edit</Link>
                                    <button
                                        type="button"
                                        className="link-danger"
                                        onClick={() => handleDelete(department)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

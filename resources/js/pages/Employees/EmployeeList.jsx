import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteEmployee, fetchEmployees } from '../../api/client';

export default function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadEmployees();
    }, []);

    function loadEmployees() {
        setIsLoading(true);

        fetchEmployees()
            .then((response) => setEmployees(response.data))
            .catch(() => setError('Failed to load employees.'))
            .finally(() => setIsLoading(false));
    }

    async function handleDelete(employee) {
        if (!confirm(`Delete ${employee.first_name} ${employee.last_name}?`)) {
            return;
        }

        try {
            await deleteEmployee(employee.id);
            setEmployees((current) => current.filter((item) => item.id !== employee.id));
        } catch {
            setError('Failed to delete employee.');
        }
    }

    return (
        <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="list-header">
                <h1>Employees</h1>
                <Link to="/employees/new" className="btn">
                    Add Employee
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
                            <th>Department</th>
                            <th>Job Title</th>
                            <th>Manager</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee) => (
                            <tr key={employee.id}>
                                <td>
                                    {employee.first_name} {employee.last_name}
                                </td>
                                <td>{employee.department?.name}</td>
                                <td>{employee.job_title}</td>
                                <td>
                                    {employee.manager
                                        ? `${employee.manager.first_name} ${employee.manager.last_name}`
                                        : '—'}
                                </td>
                                <td>
                                    <span className={`badge badge-${employee.status}`}>
                                        {employee.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="table-actions">
                                    <Link to={`/employees/${employee.id}/edit`}>Edit</Link>
                                    <button type="button" className="link-danger" onClick={() => handleDelete(employee)}>
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

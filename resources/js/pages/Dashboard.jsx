import { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../api/client';
import { useAuth } from '../context/AuthContext';

const STATUS_TILES = [
    { key: 'active', label: 'Active', className: 'stat-tile-active' },
    { key: 'on_leave', label: 'On leave', className: 'stat-tile-on-leave' },
    { key: 'terminated', label: 'Terminated', className: 'stat-tile-terminated' },
];

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardStats()
            .then((response) => setStats(response.data))
            .catch(() => setError('Failed to load dashboard stats.'))
            .finally(() => setIsLoading(false));
    }, []);

    const statusCounts = stats?.employees_by_status ?? {};
    const departments = stats?.employees_by_department ?? [];
    const maxDepartmentCount = Math.max(1, ...departments.map((department) => department.employees_count));

    return (
        <>
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <h1>Welcome, {user.name}</h1>
                <p>Role: {user.role}</p>
            </div>

            {error && <div className="form-error" style={{ marginTop: '1.5rem' }}>{error}</div>}

            {isLoading ? (
                <p style={{ marginTop: '1.5rem' }}>Loading…</p>
            ) : (
                stats && (
                    <>
                        <div className="stat-grid">
                            <div className="stat-tile">
                                <span className="stat-value">{stats.total_employees}</span>
                                <span className="stat-label">Total employees</span>
                            </div>
                            <div className="stat-tile">
                                <span className="stat-value">{stats.total_departments}</span>
                                <span className="stat-label">Total departments</span>
                            </div>
                            {STATUS_TILES.map((tile) => (
                                <div key={tile.key} className="stat-tile">
                                    <span className="stat-value">{statusCounts[tile.key] ?? 0}</span>
                                    <span className="stat-label">
                                        <span className={`stat-dot ${tile.className}`}></span>
                                        {tile.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="card" style={{ marginTop: '1.5rem' }}>
                            <h2>Employees by department</h2>
                            {departments.length === 0 ? (
                                <p>No departments yet.</p>
                            ) : (
                                departments.map((department) => (
                                    <div key={department.id} className="bar-row">
                                        <span className="bar-label">{department.name}</span>
                                        <div className="bar-track">
                                            <div
                                                className="bar-fill"
                                                style={{
                                                    width: `${(department.employees_count / maxDepartmentCount) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="bar-value">{department.employees_count}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="card" style={{ marginTop: '1.5rem' }}>
                            <h2>Recent hires</h2>
                            {stats.recent_hires.length === 0 ? (
                                <p>No employees yet.</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Department</th>
                                            <th>Job Title</th>
                                            <th>Hire Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recent_hires.map((employee) => (
                                            <tr key={employee.id}>
                                                <td>
                                                    {employee.first_name} {employee.last_name}
                                                </td>
                                                <td>{employee.department?.name}</td>
                                                <td>{employee.job_title}</td>
                                                <td>{employee.hire_date.slice(0, 10)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )
            )}
        </>
    );
}

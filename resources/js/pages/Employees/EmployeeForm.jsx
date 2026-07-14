import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    createEmployee,
    fetchDepartments,
    fetchEmployee,
    fetchEmployees,
    removeEmployeePhoto,
    updateEmployee,
    uploadEmployeePhoto,
} from '../../api/client';

const STATUSES = ['active', 'on_leave', 'terminated'];

const EMPTY_FORM = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    department_id: '',
    manager_id: '',
    hire_date: '',
    salary: '',
    status: 'active',
};

export default function EmployeeForm() {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY_FORM);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoUrl, setPhotoUrl] = useState(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState('');

    useEffect(() => {
        fetchDepartments().then((response) => setDepartments(response.data));
        fetchEmployees({ per_page: 100 }).then((response) => setEmployees(response.data.data));
    }, []);

    useEffect(() => {
        if (!isEditing) {
            return;
        }

        fetchEmployee(id).then((response) => {
            const employee = response.data;

            setForm({
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email,
                phone: employee.phone ?? '',
                job_title: employee.job_title,
                department_id: employee.department_id,
                manager_id: employee.manager_id ?? '',
                hire_date: employee.hire_date.slice(0, 10),
                salary: employee.salary,
                status: employee.status,
            });
            setPhotoUrl(employee.photo_url);
            setIsLoading(false);
        });
    }, [id, isEditing]);

    useEffect(() => {
        if (!photoPreview) {
            return;
        }

        return () => URL.revokeObjectURL(photoPreview);
    }, [photoPreview]);

    function handleChange(field) {
        return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
    }

    async function handlePhotoChange(event) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setPhotoError('');
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));

        if (!isEditing) {
            return;
        }

        setIsUploadingPhoto(true);

        try {
            const response = await uploadEmployeePhoto(id, file);
            setPhotoUrl(response.data.photo_url);
            setPhotoFile(null);
        } catch (error) {
            if (error.response?.status === 403) {
                setPhotoError("You don't have permission to do this.");
            } else {
                setPhotoError(error.response?.data?.errors?.photo?.[0] ?? 'Failed to upload photo.');
            }
        } finally {
            setIsUploadingPhoto(false);
        }
    }

    async function handleRemovePhoto() {
        if (!isEditing) {
            setPhotoFile(null);
            setPhotoPreview(null);
            return;
        }

        setIsUploadingPhoto(true);
        setPhotoError('');

        try {
            await removeEmployeePhoto(id);
            setPhotoUrl(null);
            setPhotoFile(null);
            setPhotoPreview(null);
        } catch {
            setPhotoError('Failed to remove photo.');
        } finally {
            setIsUploadingPhoto(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        const payload = {
            ...form,
            department_id: Number(form.department_id),
            manager_id: form.manager_id ? Number(form.manager_id) : null,
            salary: Number(form.salary),
        };

        try {
            if (isEditing) {
                await updateEmployee(id, payload);
            } else {
                const response = await createEmployee(payload);

                if (photoFile) {
                    await uploadEmployeePhoto(response.data.id, photoFile);
                }
            }

            navigate('/employees');
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
            } else if (error.response?.status === 403) {
                setErrors({ email: ["You don't have permission to do this."] });
            } else {
                setErrors({ email: ['Something went wrong. Please try again.'] });
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <p>Loading…</p>
            </div>
        );
    }

    return (
        <div className="card" style={{ marginTop: '1.5rem', maxWidth: '640px' }}>
            <h1>{isEditing ? 'Edit Employee' : 'Add Employee'}</h1>

            <div className="field">
                <label>Photo</label>
                <div className="photo-field">
                    {photoPreview || photoUrl ? (
                        <img src={photoPreview ?? photoUrl} alt="" className="avatar avatar-lg" />
                    ) : (
                        <span className="avatar avatar-lg avatar-placeholder">
                            {form.first_name.charAt(0)}
                            {form.last_name.charAt(0)}
                        </span>
                    )}

                    <div>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handlePhotoChange}
                            disabled={isUploadingPhoto}
                        />
                        {(photoPreview || photoUrl) && (
                            <button
                                type="button"
                                className="link-danger"
                                onClick={handleRemovePhoto}
                                disabled={isUploadingPhoto}
                            >
                                Remove photo
                            </button>
                        )}
                        {isUploadingPhoto && <p>Uploading…</p>}
                    </div>
                </div>
                {photoError && <div className="field-error">{photoError}</div>}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="first_name">First name</label>
                    <input id="first_name" value={form.first_name} onChange={handleChange('first_name')} required />
                    {errors.first_name && <div className="field-error">{errors.first_name[0]}</div>}
                </div>

                <div className="field">
                    <label htmlFor="last_name">Last name</label>
                    <input id="last_name" value={form.last_name} onChange={handleChange('last_name')} required />
                    {errors.last_name && <div className="field-error">{errors.last_name[0]}</div>}
                </div>

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={form.email} onChange={handleChange('email')} required />
                    {errors.email && <div className="field-error">{errors.email[0]}</div>}
                </div>

                <div className="field">
                    <label htmlFor="phone">Phone</label>
                    <input id="phone" value={form.phone} onChange={handleChange('phone')} />
                    {errors.phone && <div className="field-error">{errors.phone[0]}</div>}
                </div>

                <div className="field">
                    <label htmlFor="job_title">Job title</label>
                    <input id="job_title" value={form.job_title} onChange={handleChange('job_title')} required />
                    {errors.job_title && <div className="field-error">{errors.job_title[0]}</div>}
                </div>

                <div className="field">
                    <label htmlFor="department_id">Department</label>
                    <select id="department_id" value={form.department_id} onChange={handleChange('department_id')} required>
                        <option value="">Select a department</option>
                        {departments.map((department) => (
                            <option key={department.id} value={department.id}>
                                {department.name}
                            </option>
                        ))}
                    </select>
                    {errors.department_id && <div className="field-error">{errors.department_id[0]}</div>}
                </div>

                <div className="field">
                    <label htmlFor="manager_id">Manager</label>
                    <select id="manager_id" value={form.manager_id} onChange={handleChange('manager_id')}>
                        <option value="">No manager</option>
                        {employees
                            .filter((employee) => String(employee.id) !== id)
                            .map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.first_name} {employee.last_name}
                                </option>
                            ))}
                    </select>
                    {errors.manager_id && <div className="field-error">{errors.manager_id[0]}</div>}
                </div>

                <div className="field">
                    <label htmlFor="hire_date">Hire date</label>
                    <input
                        id="hire_date"
                        type="date"
                        value={form.hire_date}
                        onChange={handleChange('hire_date')}
                        required
                    />
                    {errors.hire_date && <div className="field-error">{errors.hire_date[0]}</div>}
                </div>

                <div className="field">
                    <label htmlFor="salary">Salary</label>
                    <input
                        id="salary"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.salary}
                        onChange={handleChange('salary')}
                        required
                    />
                    {errors.salary && <div className="field-error">{errors.salary[0]}</div>}
                </div>

                <div className="field">
                    <label htmlFor="status">Status</label>
                    <select id="status" value={form.status} onChange={handleChange('status')} required>
                        {STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status.replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                    {errors.status && <div className="field-error">{errors.status[0]}</div>}
                </div>

                <button type="submit" className="btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : 'Save'}
                </button>
                <button type="button" className="btn-secondary btn" style={{ marginLeft: '0.5rem' }} onClick={() => navigate('/employees')}>
                    Cancel
                </button>
            </form>
        </div>
    );
}

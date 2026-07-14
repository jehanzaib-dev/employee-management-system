import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDepartment, fetchDepartment, updateDepartment } from '../../api/client';

const EMPTY_FORM = { name: '', description: '' };

export default function DepartmentForm() {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            return;
        }

        fetchDepartment(id).then((response) => {
            const department = response.data;
            setForm({ name: department.name, description: department.description ?? '' });
            setIsLoading(false);
        });
    }, [id, isEditing]);

    function handleChange(field) {
        return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            if (isEditing) {
                await updateDepartment(id, form);
            } else {
                await createDepartment(form);
            }

            navigate('/departments');
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
            } else {
                setErrors({ name: ['Something went wrong. Please try again.'] });
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
        <div className="card" style={{ marginTop: '1.5rem', maxWidth: '480px' }}>
            <h1>{isEditing ? 'Edit Department' : 'Add Department'}</h1>

            <form onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="name">Name</label>
                    <input id="name" value={form.name} onChange={handleChange('name')} required />
                    {errors.name && <div className="field-error">{errors.name[0]}</div>}
                </div>

                <div className="field">
                    <label htmlFor="description">Description</label>
                    <input id="description" value={form.description} onChange={handleChange('description')} />
                    {errors.description && <div className="field-error">{errors.description[0]}</div>}
                </div>

                <button type="submit" className="btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : 'Save'}
                </button>
                <button
                    type="button"
                    className="btn-secondary btn"
                    style={{ marginLeft: '0.5rem' }}
                    onClick={() => navigate('/departments')}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

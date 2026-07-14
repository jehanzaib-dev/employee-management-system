import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createUser, fetchUser, updateUser } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ROLES = ['admin', 'hr', 'manager', 'employee'];

const EMPTY_FORM = {
    name: '',
    email: '',
    password: '',
    role: 'employee',
};

export default function UserForm() {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const isEditingSelf = isEditing && Number(id) === currentUser.id;

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            return;
        }

        fetchUser(id).then((response) => {
            const user = response.data;

            setForm({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
            });
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

        const payload = { ...form };

        if (isEditing && !payload.password) {
            delete payload.password;
        }

        try {
            if (isEditing) {
                await updateUser(id, payload);
            } else {
                await createUser(payload);
            }

            navigate('/admin/users');
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? { name: [error.response.data.message] });
            } else if (error.response?.status === 403) {
                setErrors({ name: ["You don't have permission to do this."] });
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
            <h1>{isEditing ? 'Edit User' : 'Add User'}</h1>

            <form onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="name">Name</label>
                    <input id="name" value={form.name} onChange={handleChange('name')} required />
                    {errors.name && <div className="field-error">{errors.name[0]}</div>}
                </div>

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={form.email} onChange={handleChange('email')} required />
                    {errors.email && <div className="field-error">{errors.email[0]}</div>}
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange('password')}
                        autoComplete="new-password"
                        required={!isEditing}
                    />
                    {isEditing && <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Leave blank to keep the current password.</p>}
                    {errors.password && <div className="field-error">{errors.password[0]}</div>}
                </div>

                <div className="field">
                    <label htmlFor="role">Role</label>
                    <select id="role" value={form.role} onChange={handleChange('role')} disabled={isEditingSelf} required>
                        {ROLES.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>
                    {isEditingSelf && <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>You can't change your own role.</p>}
                    {errors.role && <div className="field-error">{errors.role[0]}</div>}
                </div>

                <button type="submit" className="btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : 'Save'}
                </button>
                <button
                    type="button"
                    className="btn-secondary btn"
                    style={{ marginLeft: '0.5rem' }}
                    onClick={() => navigate('/admin/users')}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

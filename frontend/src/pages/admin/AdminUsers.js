import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import PasswordInput from '../../components/PasswordInput';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    id: null,
    name: '',
    email: '',
    role: 'USER',
    active: true,
    password: '',
    confirmPassword: ''
  });

  const fetchUsers = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (e) {
      console.error('Failed to load users:', e);
      setError(e.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setModalMode('create');
    setFormError('');
    setForm({ id: null, name: '', email: '', role: 'USER', active: true, password: '', confirmPassword: '' });
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setModalMode('edit');
    setFormError('');
    setForm({
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'USER',
      active: u.active ?? true,
      password: '',
      confirmPassword: ''
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setFormError('');
  };

  const validateEmail = (email) => {
    // Simple RFC-ish check good enough for UI
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.name.trim()) return setFormError('Name is required');
    if (!form.email.trim() || !validateEmail(form.email.trim())) return setFormError('Valid email is required');
    const password = form.password.trim();
    const confirm = form.confirmPassword.trim();
    if (modalMode === 'create') {
      if (!password) return setFormError('Password is required for new users');
      if (!confirm) return setFormError('Confirm password is required');
      if (password !== confirm) return setFormError('Passwords do not match');
    } else {
      // edit: password is optional, but if provided then confirm is required and must match
      if (password || confirm) {
        if (!password) return setFormError('New password is required');
        if (!confirm) return setFormError('Confirm password is required');
        if (password !== confirm) return setFormError('Passwords do not match');
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        active: form.active,
        ...(password ? { password } : {})
      };

      if (modalMode === 'create') {
        const res = await api.post('/admin/users', payload);
        setUsers((prev) => [...prev, res.data].sort((a, b) => a.id - b.id));
      } else {
        const res = await api.put(`/admin/users/${form.id}`, payload);
        setUsers((prev) => prev.map((u) => (u.id === form.id ? res.data : u)));
      }
      setModalOpen(false);
    } catch (e) {
      console.error('Failed to save user:', e);
      setFormError(e.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      console.error('Failed to delete user:', e);
      alert(e.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q) ||
      String(u.id || '').includes(q)
    );
  });

  return (
    <div className="admin-page">
      {loading ? (
        <div className="admin-panel">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="admin-panel">
          <div className="admin-toolbar">
            <div className="admin-search">
              <Search size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, role..."
              />
            </div>
            <button type="button" className="admin-filterbtn" onClick={fetchUsers}>
              <SlidersHorizontal size={18} />
              Refresh
            </button>
            <button className="btn btn-purple" onClick={openCreate}>
              <span className="btn-purple__inner">
                <span className="btn-purple__icon" aria-hidden="true">
                  <Plus size={18} />
                </span>
                Create New User
              </span>
            </button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 18, color: '#64748b' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>ID: #{u.id}</div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className="admin-pill">{u.role}</span>
                    </td>
                    <td>
                      <span className={`admin-pill ${u.active ? 'admin-pill--active' : 'admin-pill--inactive'}`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={() => openEdit(u)}>
                          Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(u.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <div className="modal__title">
                {modalMode === 'create' ? 'Create User' : 'Edit User'}
              </div>
              <button className="modal__close" onClick={closeModal} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="modal__body">
              {formError && <div className="error">{formError}</div>}
              <div className="modal__grid">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Full name"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Active Status</label>
                  <div className="toggle">
                    <input
                      type="checkbox"
                      checked={!!form.active}
                      onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                    />
                    <span>{form.active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>

                <PasswordInput
                  label={modalMode === 'edit' ? 'New Password (optional)' : 'Password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder={modalMode === 'edit' ? 'Leave blank to keep current password' : 'Set initial password'}
                  autoComplete={modalMode === 'edit' ? 'new-password' : 'new-password'}
                />

                <PasswordInput
                  label={modalMode === 'edit' ? 'Confirm New Password' : 'Confirm Password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder={modalMode === 'edit' ? 'Confirm new password' : 'Confirm initial password'}
                  autoComplete={modalMode === 'edit' ? 'new-password' : 'new-password'}
                />
              </div>
            </div>

            <div className="modal__footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-purple" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;



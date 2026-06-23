'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell, { useAdmin } from '../components/AdminShell';

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  createdAt: string;
  role: {
    id?: string;
    name: string;
  };
  roleId: string;
}

export default function AdminUsersPage() {
  return (
    <AdminShell pageTitle="User Management">
      <AdminUsersPageInner />
    </AdminShell>
  );
}

function AdminUsersPageInner() {
  const { user, loading: authLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/admin/dashboard');
    }
  }, [user, authLoading, router]);

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
    isActive: true,
  });

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/roles'),
      ]);

      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();

      if (usersData.success) {
        setUsers(usersData.data);
      } else {
        showToast(usersData.message || 'Failed to fetch users', 'error');
      }

      if (rolesData.success) {
        setRoles(rolesData.data);
      }
    } catch (error) {
      console.error('Error fetching admin users data:', error);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const handleOpenCreate = () => {
    setEditUser(null);
    setForm({
      name: '',
      email: '',
      password: '',
      roleId: roles.length > 0 ? roles[0].id : '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditUser(user);
    setForm({
      name: user.name || '',
      email: user.email,
      password: '', // Leave blank to keep existing
      roleId: user.roleId,
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || (!editUser && !form.password) || !form.roleId) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    try {
      const method = editUser ? 'PUT' : 'POST';
      const url = editUser ? `/api/admin/users/${editUser.id}` : '/api/admin/users';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        showToast(editUser ? 'User updated successfully!' : 'User created successfully!', 'success');
        setShowModal(false);
        fetchUsersAndRoles();
      } else {
        showToast(data.message || 'Error occurred', 'error');
      }
    } catch (error) {
      showToast('Network error, try again.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        showToast('User deleted successfully.', 'success');
        fetchUsersAndRoles();
      } else {
        showToast(data.message || 'Failed to delete user', 'error');
      }
    } catch (error) {
      showToast('Error sending delete request', 'error');
    }
  };

  if (authLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
        Loading user authorization...
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <>
      {toast && <div className={`admin-toast admin-toast-${toast.type}`}>{toast.msg}</div>}

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3 className="admin-table-title">System Users ({users.length})</h3>
          <button className="admin-btn admin-btn-primary" onClick={handleOpenCreate}>
            + Add New User
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>User Details</th>
              <th>Email</th>
              <th>Assigned Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                  Loading admin users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                  No users found in the system.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: '#F7931E',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0,
                    }}>
                      {(u.name || u.email)[0].toUpperCase()}
                    </div>
                    {u.name || 'Unnamed User'}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`admin-badge ${
                      u.role.name === 'ADMIN' ? 'admin-badge-danger' :
                      u.role.name === 'EDITOR' ? 'admin-badge-warning' :
                      'admin-badge-info'
                    }`}>
                      {u.role.name}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${u.isActive ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                      {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={{ color: '#718096', fontSize: '12px' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="admin-btn admin-btn-outline admin-btn-sm" 
                        onClick={() => handleOpenEdit(u)}
                      >
                        Edit
                      </button>
                      <button 
                        className="admin-btn admin-btn-danger admin-btn-sm" 
                        onClick={() => handleDelete(u.id)}
                      >
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

      {/* Edit/Create User Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editUser ? 'Edit User Profile' : 'Create System User'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Full Name</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Email Address *</label>
                  <input
                    type="email"
                    className="admin-form-input"
                    placeholder="e.g. name@domain.com"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Password {editUser ? '(Leave empty to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    className="admin-form-input"
                    placeholder={editUser ? '••••••••' : 'Enter password'}
                    required={!editUser}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label className="admin-form-label">Assigned Role *</label>
                    <select
                      className="admin-form-select"
                      required
                      value={form.roleId}
                      onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                    >
                      <option value="" disabled>Select Role</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} - {r.description || 'No description'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label className="admin-form-label">Status *</label>
                    <select
                      className="admin-form-select"
                      required
                      value={form.isActive ? 'true' : 'false'}
                      onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                    >
                      <option value="true">Active (Access allowed)</option>
                      <option value="false">Inactive (Suspended)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="admin-btn admin-btn-outline" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

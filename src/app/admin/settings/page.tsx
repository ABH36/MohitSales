'use client';

import { useState, useEffect } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';

interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  group: string;
  label: string | null;
  description: string | null;
  isPublic: boolean;
}

export default function AdminSettingsPage() {
  return (
    <AdminShell pageTitle="Settings">
      <AdminSettingsPageInner />
    </AdminShell>
  );
}

function AdminSettingsPageInner() {
  const { user } = useAdmin();
  const isAdmin = user?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState<'site' | 'account'>('site');
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Password Verification Modal States
  const [confirmSetting, setConfirmSetting] = useState<Setting | null>(null);
  const [passwordInput, setPasswordInput] = useState('');

  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        const vals: Record<string, string> = {};
        data.data.forEach((s: Setting) => { vals[s.id] = s.value; });
        setEditValues(vals);
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setProfileName(data.user.name || '');
        setProfileEmail(data.user.email || '');
        setTwoFactorEnabled(!!data.user.twoFactorEnabled);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchSettings(), fetchProfile()]);
      setLoading(false);
    };
    init();
  }, []);

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveSettingClick = (setting: Setting) => {
    setConfirmSetting(setting);
    setPasswordInput('');
  };

  const handleConfirmSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmSetting) return;

    setSaving(confirmSetting.id);
    try {
      const res = await fetch(`/api/admin/settings/${confirmSetting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          value: editValues[confirmSetting.id],
          password: passwordInput
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`"${confirmSetting.label || confirmSetting.key}" updated!`, 'success');
        setConfirmSetting(null);
        fetchSettings(); // Refresh settings state
      } else {
        showToast(data.message || 'Error updating setting.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setSaving(null);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await fetch('/api/admin/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, email: profileEmail }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Profile updated successfully!', 'success');
        // Update session cache
        const cached = sessionStorage.getItem('admin_user_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.user) {
            parsed.user.name = profileName;
            parsed.user.email = profileEmail;
            sessionStorage.setItem('admin_user_cache', JSON.stringify(parsed));
          }
        }
      } else {
        showToast(data.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/admin/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorEnabled: enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setTwoFactorEnabled(enabled);
        showToast(`Two-Factor Authentication ${enabled ? 'enabled' : 'disabled'}.`, 'success');
        // Update cache
        const cached = sessionStorage.getItem('admin_user_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.user) {
            parsed.user.twoFactorEnabled = enabled;
            sessionStorage.setItem('admin_user_cache', JSON.stringify(parsed));
          }
        }
      } else {
        showToast(data.message || 'Failed to update 2FA setting.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Please try again.', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    
    setPasswordSaving(true);
    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password updated! Redirecting to login...', 'success');
        sessionStorage.removeItem('admin_user_cache');
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 1500);
      } else {
        showToast(data.message || 'Failed to update password.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '#475569' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&#]/.test(pwd)) score++;

    if (pwd.length < 8) return { score: 1, label: 'Too Short', color: '#EF4444' };
    if (score <= 2) return { score: 2, label: 'Weak', color: '#EF4444' };
    if (score === 3) return { score: 3, label: 'Medium', color: '#F59E0B' };
    return { score: 4, label: 'Strong', color: '#10B981' };
  };

  const strength = getPasswordStrength(newPassword);
  const groups = Array.from(new Set(settings.map(s => s.group)));

  const groupLabels: Record<string, string> = {
    general: '🏢 General Settings',
    contact: '📞 Contact Settings',
    social: '🌐 Social Media Settings',
    seo: '🔍 SEO Settings',
    appearance: '🎨 Appearance Settings',
  };

  return (
    <>
      {toast && <div className={`admin-toast admin-toast-${toast.type}`}>{toast.msg}</div>}

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
        <button 
          className={`admin-btn ${activeTab === 'site' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
          onClick={() => setActiveTab('site')}
          style={{ borderRadius: '10px' }}
        >
          ⚙️ Site Config
        </button>
        <button 
          className={`admin-btn ${activeTab === 'account' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
          onClick={() => setActiveTab('account')}
          style={{ borderRadius: '10px' }}
        >
          👤 My Account
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#718096', fontWeight: 600 }}>Loading settings...</div>
      ) : activeTab === 'site' ? (
        groups.map((group) => {
          const groupSettings = settings.filter(s => s.group === group);
          return (
            <div key={group} className="admin-table-wrapper" style={{ marginBottom: '24px' }}>
              <div className="admin-table-header">
                <h3 className="admin-table-title">{groupLabels[group] || group.toUpperCase()}</h3>
              </div>
              <div style={{ padding: '24px' }}>
                {groupSettings.map((s) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--admin-fs)', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>{s.label || s.key}</div>
                      <div style={{ fontSize: 'var(--admin-fs-sm)', color: 'var(--admin-text-muted)' }}>{s.key}</div>
                    </div>
                    <div style={{ flex: 2 }}>
                      {s.type === 'boolean' ? (
                        <select
                          className="admin-form-select"
                          value={editValues[s.id] || ''}
                          onChange={(e) => setEditValues({ ...editValues, [s.id]: e.target.value })}
                          disabled={!isAdmin}
                          style={{ borderRadius: '10px' }}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : (
                        <input
                          className="admin-form-input"
                          value={editValues[s.id] || ''}
                          onChange={(e) => setEditValues({ ...editValues, [s.id]: e.target.value })}
                          disabled={!isAdmin}
                          style={{ borderRadius: '10px' }}
                        />
                      )}
                    </div>
                    {isAdmin && (
                      <button
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        onClick={() => handleSaveSettingClick(s)}
                        disabled={saving === s.id}
                        style={{ minWidth: '80px', borderRadius: '8px' }}
                      >
                        Save
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        /* My Account Tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Profile Form */}
          <div className="admin-table-wrapper">
            <div className="admin-table-header">
              <h3 className="admin-table-title">👤 Profile Details</h3>
            </div>
            <form onSubmit={handleUpdateProfile} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="admin-form-input"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="admin-form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={profileSaving}
                className="admin-btn admin-btn-primary"
                style={{ alignSelf: 'flex-start', minWidth: '150px' }}
              >
                {profileSaving ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="admin-table-wrapper">
            <div className="admin-table-header">
              <h3 className="admin-table-title">🔑 Change Password</h3>
            </div>
            <form onSubmit={handleChangePassword} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="admin-form-input"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="admin-form-input"
                  placeholder="••••••••"
                  required
                />
                
                {/* Visual Strength Meter */}
                {newPassword && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--admin-fs-sm)', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '4px' }}>
                      <span>Strength: {strength.label}</span>
                      <span>{Math.round((strength.score / 4) * 100)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${(strength.score / 4) * 100}%`, 
                          height: '100%', 
                          background: strength.color, 
                          transition: 'all 0.3s ease' 
                        }} 
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="admin-form-input"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={passwordSaving}
                className="admin-btn admin-btn-primary"
                style={{ alignSelf: 'flex-start', minWidth: '150px' }}
              >
                {passwordSaving ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication Security Card */}
          <div className="admin-table-wrapper" style={{ border: '1px solid rgba(59, 130, 246, 0.2)', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%)' }}>
            <div className="admin-table-header" style={{ borderBottomColor: 'rgba(59, 130, 246, 0.1)' }}>
              <h3 className="admin-table-title">🛡️ Security Settings (2FA)</h3>
            </div>
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
              <div>
                <div style={{ fontSize: 'var(--admin-fs)', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>Email OTP Two-Factor Authentication</div>
                <div style={{ fontSize: 'var(--admin-fs-sm)', color: 'var(--admin-text-muted)', maxWidth: '600px', lineHeight: 1.5 }}>
                  Enabling 2FA adds an extra layer of protection. On login, you will receive a secure 6-digit OTP verification code via email to confirm your identity.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                  <input 
                    type="checkbox" 
                    checked={twoFactorEnabled}
                    onChange={(e) => handleToggle2FA(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: twoFactorEnabled ? '#3B82F6' : '#cbd5e1',
                    transition: '.4s', borderRadius: '34px',
                    boxShadow: twoFactorEnabled ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '26px', width: '26px', left: '4px', bottom: '4px',
                      backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                      transform: twoFactorEnabled ? 'translateX(26px)' : 'none'
                    }} />
                  </span>
                </label>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Password Verification Modal */}
      {confirmSetting && (
        <div className="admin-modal-overlay" onClick={() => setConfirmSetting(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">🔐 Verify Administrator Password</h3>
              <button className="admin-modal-close" onClick={() => setConfirmSetting(null)}>✕</button>
            </div>
            <form onSubmit={handleConfirmSave}>
              <div className="admin-modal-body" style={{ padding: '24px' }}>
                <p style={{ fontSize: 'var(--admin-fs)', color: 'var(--admin-text)', marginBottom: '16px', lineHeight: 1.5 }}>
                  You are saving changes to **{confirmSetting.label || confirmSetting.key}**. For security, please enter your password to authorize this update.
                </p>
                <div className="admin-form-group">
                  <label className="admin-form-label">Password</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="admin-form-input"
                    placeholder="Enter admin password"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="admin-modal-footer" style={{ padding: '16px 24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setConfirmSetting(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving === confirmSetting.id}>
                  {saving === confirmSetting.id ? 'Saving...' : 'Verify & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


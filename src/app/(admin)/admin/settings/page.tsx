'use client';

import { useState, useEffect } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';
import { useAdminCache, getCached } from '../components/AdminCacheProvider';
import SkeletonTable from '../components/SkeletonTable';

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
  const { fetchWithCache, invalidate } = useAdminCache();
  const cachedSettings = getCached('/api/admin/settings');
  const isAdmin = user?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState<'site' | 'webmaster' | 'account'>('site');
  const [settings, setSettings] = useState<Setting[]>(cachedSettings?.success ? cachedSettings.data : []);
  const [loading, setLoading] = useState(!cachedSettings?.success);
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
      const data = await fetchWithCache('/api/admin/settings');
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
        invalidate('/api/admin/settings');
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
          className={`admin-btn ${activeTab === 'webmaster' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
          onClick={() => setActiveTab('webmaster')}
          style={{ borderRadius: '10px' }}
        >
          🔍 Webmaster Tools
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
        <SkeletonTable rows={6} cols={3} />
      ) : activeTab === 'webmaster' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="admin-table-wrapper" style={{ border: '1px solid rgba(59,130,246,0.15)', background: 'linear-gradient(135deg, rgba(59,130,246,0.02) 0%, rgba(139,92,246,0.02) 100%)' }}>
            <div className="admin-table-header" style={{ borderBottomColor: 'rgba(59,130,246,0.1)' }}>
              <h3 className="admin-table-title">🔍 Webmaster Verification Tools</h3>
            </div>
            <div style={{ padding: '16px 24px 8px', fontSize: 'var(--admin-fs-sm)', color: 'var(--admin-text-muted)', lineHeight: 1.6 }}>
              Paste only the <strong>content</strong> value from the verification meta tag. Example: if Google gives you<br />
              <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: '12px' }}>&lt;meta name=&quot;google-site-verification&quot; content=&quot;<strong>abc123xyz</strong>&quot; /&gt;</code><br />
              then paste only <strong>abc123xyz</strong>.
            </div>
            <div style={{ padding: '12px 24px 24px' }}>
              {[
                { key: 'webmaster_google', label: 'Google Search Console', placeholder: 'e.g. abc123xyz...' },
                { key: 'webmaster_bing', label: 'Bing Webmaster Tools', placeholder: 'e.g. 1A2B3C4D...' },
              ].map((tool) => {
                const setting = settings.find(s => s.key === tool.key);
                if (!setting) return null;
                return (
                  <div key={tool.key} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                      {tool.key === 'webmaster_google' ? (
                        <svg viewBox="0 0 24 24" width="30" height="30">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85c-.22-.66-.35-1.36-.35-2.09z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="30" height="30">
                          <path fill="#008373" d="M19.34 16.03c-.22-.24-.59-.26-.83-.04L13.5 20.25V4.62c0-.33-.27-.6-.6-.6h-1.8c-.33 0-.6.27-.6.6v17.44c0 .41.45.65.79.4l7.98-6.6c.24-.22.26-.59.07-.83z" />
                          <path fill="#00A1F1" d="M10.5 4.02V2.62c0-.33-.27-.6-.6-.6H8.1c-.33 0-.6.27-.6.6v12.28c0 .2.1.39.27.49l2.25 1.35c.31.18.48.51.48.87v2.64l6.63-5.48c.24-.2.59-.18.8.06.21.24.19.59-.05.8l-7.38 6.1c-.24.2-.59.18-.8-.06-.08-.1-.13-.22-.13-.35v-3.71c0-.13-.07-.25-.18-.32l-2.82-1.69c-.43-.26-.69-.73-.69-1.23V2.62c0-.88.72-1.6 1.6-1.6H9.9c.88 0 1.6.72 1.6 1.6v1.4c0 .33-.27.6-.6.6z" />
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--admin-fs)', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>{tool.label}</div>
                      <input
                        className="admin-form-input"
                        value={editValues[setting.id] || ''}
                        onChange={(e) => setEditValues({ ...editValues, [setting.id]: e.target.value })}
                        placeholder={tool.placeholder}
                        disabled={!isAdmin}
                        style={{ borderRadius: '10px', fontSize: '13px' }}
                      />
                    </div>
                    {isAdmin && (
                      <button
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        onClick={() => handleSaveSettingClick(setting)}
                        disabled={saving === setting.id}
                        style={{ minWidth: '80px', borderRadius: '8px', flexShrink: 0, alignSelf: 'flex-end', marginBottom: '2px' }}
                      >
                        {saving === setting.id ? '...' : 'Save'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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


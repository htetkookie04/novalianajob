import React, { useState } from 'react';
import PasswordInput from '../../components/PasswordInput';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function AdminSettings() {
  const { user } = useAuth();
  const email = user?.email || '';
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success | error
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading) {
      return;
    }
    
    setMessage('');
    setMessageType('');

    const oldPw = oldPassword.trim();
    const newPw = password.trim();
    const confirmPw = confirmPassword.trim();

    // Password change validation (frontend-only)
    const anyPasswordField = oldPw || newPw || confirmPw;
    if (anyPasswordField) {
      if (!oldPw) {
        setMessage('Old password is required');
        setMessageType('error');
        return;
      }
      if (!newPw) {
        setMessage('New password is required');
        setMessageType('error');
        return;
      }
      if (newPw.length < 6) {
        setMessage('New password must be at least 6 characters long');
        setMessageType('error');
        return;
      }
      if (newPw !== confirmPw) {
        setMessage('Confirm password must match the new password');
        setMessageType('error');
        return;
      }

      await handlePasswordChange(oldPw, newPw, confirmPw);
      return;
    }

    setMessage('Nothing to save.');
    setMessageType('success');
  };

  const handlePasswordChange = async (oldPw, newPw, confirmPw) => {
    setIsLoading(true);
    setMessage('');
    setMessageType('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You are not logged in. Please login again.');
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      const res = await api.post(
        '/admin/update-password',
        {
          oldPassword: oldPw,
          newPassword: newPw,
          confirmPassword: confirmPw
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage(res.data?.message || 'Password updated successfully');
      setMessageType('success');
      setOldPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.message;
      let msg = backendMsg || (status ? `Failed to update password (${status})` : 'Failed to update password');
      
      if (status === 401) {
        msg = 'Unauthorized. Please login again.';
      } else if (status === 403) {
        msg = 'Forbidden. You do not have permission to change password.';
      } else if (status === 400) {
        // Use backend message for validation errors
        msg = backendMsg || 'Invalid password. Please check your input.';
      }
      
      setMessage(msg);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-panel">
        <div className="admin-toolbar">
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 900,
              color: '#0f172a'
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                background: 'rgba(109, 40, 217, 0.10)',
                border: '1px solid rgba(109, 40, 217, 0.16)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6d28d9'
              }}
              aria-hidden="true"
            >
              <SettingsIcon size={18} />
            </span>
            Settings
          </div>

          <button 
            type="submit" 
            form="admin-settings-form" 
            className="btn btn-purple"
            disabled={isLoading}
          >
            <span className="btn-purple__inner">
              <span className="btn-purple__icon" aria-hidden="true">
                <Save size={18} />
              </span>
              {isLoading ? 'Saving...' : 'Save Settings'}
            </span>
          </button>
        </div>

        {message && <div className={messageType === 'success' ? 'success' : 'error'}>{message}</div>}

        <div className="admin-formgrid">
          <form id="admin-settings-form" onSubmit={handleSubmit}>
            <div className="admin-tableTitle">Update Admin Account</div>

            <div className="admin-formgrid__row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Admin Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  placeholder="Your account email"
                  style={{
                    cursor: 'not-allowed',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    opacity: 1
                  }}
                />
              </div>
            </div>

            <div className="admin-formgrid__row admin-formgrid__row--2">
              <PasswordInput
                label="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter old password"
                autoComplete="current-password"
              />

              <PasswordInput
                label="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
              />

              <div style={{ gridColumn: '1 / -1' }}>
              <PasswordInput
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
              </div>
            </div>

            <div style={{ marginTop: 14, color: '#94a3b8', fontWeight: 800, fontSize: 12 }}>
              Email is read-only and cannot be changed. Password change is available below.
            </div>
          </form>

          <div className="admin-tableMeta">
            <div className="admin-tableMeta__item">
              <div className="admin-tableMeta__label">Email</div>
              <div className="admin-tableMeta__value">Read-only (from your account)</div>
            </div>
            <div className="admin-tableMeta__item">
              <div className="admin-tableMeta__label">Security</div>
              <div className="admin-tableMeta__value">Password fields are optional</div>
            </div>
            <div className="admin-tableMeta__item">
              <div className="admin-tableMeta__label">Tip</div>
              <div className="admin-tableMeta__value">Use a strong password (6+ chars)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;



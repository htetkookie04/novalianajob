import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function getTitle(pathname) {
  if (pathname === '/admin' || pathname === '/admin/') return 'Dashboard';
  if (pathname.startsWith('/admin/jobs')) return 'Job Listings';
  if (pathname.startsWith('/admin/users')) return 'User Management';
  if (pathname.startsWith('/admin/settings')) return 'Settings';
  return 'Admin';
}

function getSubtitle(pathname) {
  if (pathname.startsWith('/admin/jobs')) return "Manage your organization's open positions.";
  if (pathname.startsWith('/admin/users')) return 'Manage users, roles, and account status.';
  if (pathname.startsWith('/admin/settings')) return 'Account and security preferences.';
  return 'Overview of key metrics and recent activity.';
}

function AdminTopbar() {
  const location = useLocation();
  const { user } = useAuth();

  const title = useMemo(() => getTitle(location.pathname), [location.pathname]);
  const subtitle = useMemo(() => getSubtitle(location.pathname), [location.pathname]);

  return (
    <header className="admin-topbar">
      <div>
        <div className="admin-topbar__title">{title}</div>
        <div className="admin-topbar__subtitle">{subtitle}</div>
      </div>

      <div className="admin-topbar__right">
        <div className="admin-user">
          <div className="admin-user__text">
            <div className="admin-user__name">{user?.email ? user.email.split('@')[0] : 'Admin User'}</div>
            <div className="admin-user__role">
              {user?.role === 'SUPER_ADMIN' 
                ? 'Super Admin' 
                : user?.role === 'ADMIN' 
                  ? 'Admin' 
                  : user?.role || 'Admin'}
            </div>
          </div>
          <div className="admin-user__avatar" aria-hidden="true">
            {String(user?.email || 'A').slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;



import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BriefcaseBusiness, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function AdminSidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <img 
          src="/novaliana.jpg" 
          alt="Novaliana" 
          className="admin-brand__mark admin-brand__mark--image"
          style={{ width: '36px', height: '36px', borderRadius: '12px', objectFit: 'cover' }}
        />
        <div className="admin-brand__name">Novaliana</div>
      </div>

      <div className="admin-sidebar__section">MAIN MENU</div>
      <nav className="admin-sidebar__nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
          }
        >
          <span className="admin-sidebar__icon">
            <LayoutDashboard size={18} />
          </span>
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/jobs"
          className={({ isActive }) =>
            `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
          }
        >
          <span className="admin-sidebar__icon">
            <BriefcaseBusiness size={18} />
          </span>
          Job Management
        </NavLink>
        {isSuperAdmin && (
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
            }
          >
            <span className="admin-sidebar__icon">
              <Users size={18} />
            </span>
            User Management
          </NavLink>
        )}
      </nav>

      <div className="admin-sidebar__section">SYSTEM</div>
      <nav className="admin-sidebar__nav">
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
          }
        >
          <span className="admin-sidebar__icon">
            <Settings size={18} />
          </span>
          Settings
        </NavLink>
      </nav>

      <div className="admin-sidebar__footer">
        <button className="admin-logout" onClick={handleLogout} type="button">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;



import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Public navbar (used across public pages).
 * Default right-side link is "Admin Login".
 */
function Navbar({ title = 'Novaliana', right }) {
  return (
    <header className="public-header">
      <div className="public-header__inner">
        <Link to="/" className="public-brand" aria-label="Go to home">
          <img 
            src="/novaliana.jpg" 
            alt="Novaliana" 
            className="public-brand__mark public-brand__mark--image"
            style={{ width: '34px', height: '34px', borderRadius: '10px', objectFit: 'cover' }}
          />
          <span className="public-brand__name">{title}</span>
        </Link>

        <nav className="public-header__right">
          {right ?? <Link to="/admin/login" className="public-link">Admin Login</Link>}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;



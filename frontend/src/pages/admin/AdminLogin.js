import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import PasswordInput from '../../components/PasswordInput';
import '../PublicJobList.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="public-page">
      <Navbar
        title="Novaliana"
        right={
          <a className="public-link" href="/">
            Public Site
          </a>
        }
      />

      <div className="container">
        <div className="public-auth">
          <div className="public-auth__card">
            <div className="public-auth__title">Admin Login</div>
            <div className="public-auth__subtitle">Sign in to manage jobs, users and settings.</div>

            <form onSubmit={handleSubmit} className="public-auth__form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />

              {error && <div className="error">{error}</div>}

              <button type="submit" className="public-search__btn" style={{ width: '100%' }}>
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;


import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Search, MapPin, Clock, Bookmark } from 'lucide-react';
import './PublicJobList.css';

function PublicJobList() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (search = '') => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const response = await api.get('/jobs', { params });
      setJobs(response.data);
      setPage(1);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(searchTerm);
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const timeAgo = (iso) => {
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return '';
    const diffDays = Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  };

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pagedJobs = jobs.slice(startIdx, startIdx + pageSize);

  return (
    <div className="public-page">
      <Navbar
        title="Novaliana"
        right={
          isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="public-link">
                  Admin
                </Link>
              )}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                  navigate('/');
                }}
                className="public-link"
              >
                Logout
              </a>
            </>
          ) : (
            <Link to="/admin/login" className="public-link">
              Admin Login
            </Link>
          )
        }
      />

      <section className="public-hero">
        <div className="public-hero__inner">
          <h1 className="public-hero__title">
            Find Your <span className="public-gradient">Dream Job</span>
          </h1>
          <p className="public-hero__subtitle">
            Browse open positions and discover the perfect opportunity to grow your career with Novaliana.
          </p>

          <form onSubmit={handleSearch} className="public-search">
            <div className="public-search__field">
              <Search size={18} className="public-search__icon" />
              <input
                type="text"
                placeholder="Job title, keywords, or location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="public-search__btn">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="public-section">
        <div className="container">
          {loading ? (
            <div className="public-empty">Loading...</div>
          ) : jobs.length === 0 ? (
            <div className="public-empty">No jobs found.</div>
          ) : (
            <>
              <div className="public-grid">
                {pagedJobs.map((job, idx) => {
                  const remoteTag =
                    typeof job.location === 'string' && job.location.toLowerCase().includes('remote')
                      ? 'Remote'
                      : 'On-site';
                  const posted = timeAgo(job.createdAt);
                  const accentClass = `public-accent--${idx % 4}`;
                  return (
                    <button
                      type="button"
                      key={job.id}
                      className={`public-card ${accentClass}`}
                      onClick={() => handleJobClick(job.id)}
                    >
                      <div className="public-card__top">
                        <div className="public-card__company">{(job.company || '').toUpperCase()}</div>
                        <span className="public-card__bookmark" aria-hidden="true">
                          <Bookmark size={18} />
                        </span>
                      </div>

                      <div className="public-card__title">{job.title}</div>

                      <div className="public-card__meta">
                        <span className="public-meta">
                          <MapPin size={16} /> {job.location}
                        </span>
                        {posted && (
                          <span className="public-meta">
                            <Clock size={16} /> {posted}
                          </span>
                        )}
                      </div>

                      <div className="public-card__bottom">
                        <div className="public-badges">
                          <span className="public-badge">{job.jobType}</span>
                          <span className="public-badge public-badge--soft">{remoteTag}</span>
                        </div>
                        <span className="public-card__cta">Details →</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="public-pagination">
                <button
                  type="button"
                  className="public-pagebtn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`public-pagebtn ${n === safePage ? 'public-pagebtn--active' : ''}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  className="public-pagebtn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                >
                  ›
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="public-footer">
        <div className="container public-footer__inner">
          <div>© {new Date().getFullYear()} Novaliana. All rights reserved.</div>
          <div className="public-footer__links">
            <a className="public-link" href="#" onClick={(e) => e.preventDefault()}>
              Privacy Policy
            </a>
            <a className="public-link" href="#" onClick={(e) => e.preventDefault()}>
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicJobList;


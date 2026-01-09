import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Check, Plus, Search, SlidersHorizontal, X } from 'lucide-react';

function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [postedWithinDays, setPostedWithinDays] = useState('ALL'); // ALL | 7 | 30
  const filterRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setFilterOpen(false);
    }
    function onMouseDown(e) {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(e.target)) setFilterOpen(false);
    }
    if (filterOpen) {
      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('mousedown', onMouseDown);
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [filterOpen]);

  const jobTypeOptions = useMemo(
    () => [
      { key: 'fulltime', label: 'Full Time' },
      { key: 'parttime', label: 'Part Time' }
    ],
    []
  );

  const normalizeJobType = (value) => {
    const s = String(value || '')
      .toLowerCase()
      .replace(/[\s_-]/g, '');
    if (!s) return '';
    if (s.includes('fulltime')) return 'fulltime';
    if (s.includes('parttime')) return 'parttime';
    return 'other';
  };

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (selectedTypes.length) n += 1;
    if (postedWithinDays !== 'ALL') n += 1;
    return n;
  }, [postedWithinDays, selectedTypes.length]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchJobs();
      } catch (error) {
        alert('Error deleting job');
        console.error('Error deleting job:', error);
      }
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !query.trim() ||
      (j.title || '').toLowerCase().includes(q) ||
      (j.company || '').toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q);

    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(normalizeJobType(j.jobType));

    const matchesPosted =
      postedWithinDays === 'ALL' ||
      (() => {
        const created = j?.createdAt ? Date.parse(j.createdAt) : NaN;
        if (!Number.isFinite(created)) return false;
        const days = Number(postedWithinDays);
        return Date.now() - created <= days * 24 * 60 * 60 * 1000;
      })();

    return matchesQuery && matchesType && matchesPosted;
  });

  const clearFilters = () => {
    setSelectedTypes([]);
    setPostedWithinDays('ALL');
  };

  const toggleInArray = (value, arrSetter) => {
    arrSetter((prev) => {
      const has = prev.includes(value);
      if (has) return prev.filter((v) => v !== value);
      return [...prev, value];
    });
  };

  return (
    <div className="admin-page">
      {loading ? (
        <div className="admin-panel">Loading...</div>
      ) : (
        <div className="admin-panel">
          <div className="admin-toolbar">
            <div className="admin-search">
              <Search size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search job title, company..."
              />
            </div>
            <div className="admin-filterwrap" ref={filterRef}>
              <button
                type="button"
                className={`admin-filterbtn ${activeFilterCount ? 'admin-filterbtn--active' : ''}`}
                onClick={() => setFilterOpen((p) => !p)}
              >
                <SlidersHorizontal size={18} />
                Filter
                {activeFilterCount ? <span className="admin-filtercount">{activeFilterCount}</span> : null}
              </button>

              {filterOpen && (
                <div className="admin-popover" role="dialog" aria-label="Job filters">
                  <div className="admin-popover__head">
                    <div className="admin-popover__title">Filters</div>
                    <button type="button" className="admin-popover__close" onClick={() => setFilterOpen(false)}>
                      <X size={16} />
            </button>
        </div>

                  <div className="admin-popover__section">
                    <div className="admin-popover__label">Job Type</div>
                    <div className="admin-popover__chips">
                      {jobTypeOptions.map((t) => {
                        const active = selectedTypes.includes(t.key);
                        return (
          <button
                            key={t.key}
                            type="button"
                            className={`admin-chip ${active ? 'admin-chip--active' : ''}`}
                            onClick={() => toggleInArray(t.key, setSelectedTypes)}
                          >
                            {active ? <Check size={14} /> : null}
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="admin-popover__muted" style={{ marginTop: 10 }}>
                      Leave unselected to show all jobs.
                    </div>
                  </div>

                  <div className="admin-popover__section">
                    <div className="admin-popover__label">Posted Within</div>
                    <select
                      className="admin-popover__select"
                      value={postedWithinDays}
                      onChange={(e) => setPostedWithinDays(e.target.value)}
                    >
                      <option value="ALL">Any time</option>
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                    </select>
                  </div>

                  <div className="admin-popover__footer">
                    <button type="button" className="btn btn-secondary" onClick={clearFilters}>
                      Clear
                    </button>
                    <button type="button" className="btn btn-purple" onClick={() => setFilterOpen(false)}>
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-purple" onClick={() => navigate('/admin/jobs/new')}>
              <span className="btn-purple__inner">
                <span className="btn-purple__icon" aria-hidden="true">
                  <Plus size={18} />
                </span>
            Create New Job
              </span>
          </button>
        </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Job Details</th>
                <th>Company</th>
                <th>Location</th>
                <th>Type</th>
                <th>Posted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 18, color: '#64748b' }}>
                    No jobs found.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>ID: #{job.id}</div>
                    </td>
                    <td>{job.company}</td>
                    <td>{job.location}</td>
                    <td>
                      <span className="admin-pill">{job.jobType}</span>
                    </td>
                    <td>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={() => navigate(`/admin/jobs/edit/${job.id}`)}>
                          Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(job.id)}>
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
    </div>
  );
}

export default AdminDashboard;


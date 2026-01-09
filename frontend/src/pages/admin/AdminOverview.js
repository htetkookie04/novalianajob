import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  BriefcaseBusiness,
  ChevronDown,
  UserPlus,
  Briefcase,
  Clock
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function AdminOverview() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setErrors([]);

      // Only fetch users if user is SUPER_ADMIN (ADMIN users don't have access)
      const promises = [api.get('/jobs')];
      if (isSuperAdmin) {
        promises.push(api.get('/admin/users'));
      }

      const results = await Promise.allSettled(promises);
      if (!isMounted) return;

      const nextErrors = [];

      const jobsRes = results[0];
      if (jobsRes.status === 'fulfilled') {
        setJobs(jobsRes.value.data || []);
      } else {
        console.error('Failed to load jobs:', jobsRes.reason);
        nextErrors.push('Failed to load jobs (backend not reachable?).');
      }

      // Only process users result if we tried to fetch it (SUPER_ADMIN only)
      if (isSuperAdmin) {
        const usersRes = results[1];
        if (usersRes.status === 'fulfilled') {
          setUsers(usersRes.value.data || []);
        } else {
          console.error('Failed to load users:', usersRes.reason);
          const status = usersRes.reason?.response?.status;
          if (status === 401 || status === 403) {
            nextErrors.push('User count blocked (401/403). Please login as SUPER_ADMIN to access user data.');
          } else {
            nextErrors.push('Failed to load users.');
          }
        }
      } else {
        // For ADMIN users, set empty users array (they don't have access)
        setUsers([]);
      }

      setErrors(nextErrors);
      setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [isSuperAdmin]);

  const activePostings = useMemo(() => {
    // No explicit "active" field in Job entity; treat "active" as jobs created within last 30 days.
    const now = Date.now();
    const days30 = 30 * 24 * 60 * 60 * 1000;
    return jobs.filter((j) => {
      const created = j?.createdAt ? Date.parse(j.createdAt) : NaN;
      return Number.isFinite(created) && now - created <= days30;
    }).length;
  }, [jobs]);

  const jobsThisWeek = useMemo(() => {
    const now = Date.now();
    const days7 = 7 * 24 * 60 * 60 * 1000;
    return jobs.filter((j) => {
      const created = j?.createdAt ? Date.parse(j.createdAt) : NaN;
      return Number.isFinite(created) && now - created <= days7;
    }).length;
  }, [jobs]);

  const totalJobs = jobs.length;

  const chartData = useMemo(() => {
    // Real chart: jobs created in the last 7 days, bucketed by day (Mon..Sun).
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();

    // last 7 dates (including today) mapped to day label counts
    const countsByLabel = new Map(labels.map((l) => [l, 0]));
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);

    jobs.forEach((j) => {
      const created = j?.createdAt ? new Date(j.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) return;
      if (created < start) return;
      const day = labels[(created.getDay() + 6) % 7]; // JS: 0=Sun -> map to labels with Mon first
      countsByLabel.set(day, (countsByLabel.get(day) || 0) + 1);
    });

    // Ensure label order is Mon..Sun
    const values = labels.map((l) => countsByLabel.get(l) || 0);
    const max = Math.max(1, ...values);
    return {
      labels,
      values,
      max
    };
  }, [jobs]);

  const recentJobs = useMemo(() => {
    return [...jobs]
      .filter((j) => j?.createdAt)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 6);
  }, [jobs]);

  const recentUsers = useMemo(() => {
    return [...users]
      .filter((u) => u?.createdAt)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 3);
  }, [users]);

  function timeAgo(iso) {
    const t = iso ? Date.parse(iso) : NaN;
    if (!Number.isFinite(t)) return '—';
    const diffSec = Math.max(0, Math.floor((Date.now() - t) / 1000));
    const mins = Math.floor(diffSec / 60);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  return (
    <div className="admin-overview">
      {errors.length > 0 && (
        <div className="error" style={{ marginBottom: 14 }}>
          <strong>Backend connection issues:</strong>
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <div className="admin-panel">Loading...</div>
      ) : (
        <div className="admin-overview__grid">
          {/* Stat cards */}
          <div className="admin-overview__stats">
            {isSuperAdmin && (
              <div className="overview-stat">
                <div>
                  <div className="overview-stat__label">Total Users</div>
                  <div className="overview-stat__value">{users.length}</div>
                  <div className="overview-stat__sub">Real data</div>
                </div>
                <div className="overview-stat__icon overview-stat__icon--purple">
                  <Users size={18} />
                </div>
              </div>
            )}

            <div className="overview-stat">
              <div>
                <div className="overview-stat__label">Total Jobs</div>
                <div className="overview-stat__value">{totalJobs}</div>
                <div className="overview-stat__sub">Real data</div>
              </div>
              <div className="overview-stat__icon overview-stat__icon--violet">
                <Briefcase size={18} />
              </div>
            </div>

            <div className="overview-stat overview-stat--highlight">
              <div>
                <div className="overview-stat__label">Jobs Posted This Week</div>
                <div className="overview-stat__value">{jobsThisWeek}</div>
                <div className="overview-stat__sub overview-stat__sub--light">
                  Active postings: {activePostings}
                </div>
              </div>
              <div className="overview-stat__icon overview-stat__icon--light">
                <BriefcaseBusiness size={18} />
              </div>
            </div>

            <div className="overview-stat">
              <div>
                <div className="overview-stat__label">Active Postings</div>
                <div className="overview-stat__value">{activePostings}</div>
                <div className="overview-stat__sub">Last 30 days</div>
              </div>
              <div className="overview-stat__icon overview-stat__icon--orange">
                <Clock size={18} />
              </div>
            </div>
          </div>

          {/* Main row */}
          <div className="admin-overview__main">
            <div className="overview-panel">
              <div className="overview-panel__head">
                <div>
                  <div className="overview-panel__title">Job Posting Trends</div>
                  <div className="overview-panel__subtitle">Jobs created over the last 7 days.</div>
                </div>
                <button className="overview-select" type="button">
                  This Week <ChevronDown size={16} />
                </button>
              </div>

              <div className="overview-chart">
                <div className="overview-chart__axis">
                  {[10, 8, 6, 4, 2, 0].map((n) => (
                    <div key={n} className="overview-chart__tick">
                      <span>{n}</span>
                      <div className="overview-chart__line" />
                    </div>
                  ))}
                </div>

                <div className="overview-chart__bars" aria-hidden="true">
                  {chartData.values.map((v, i) => (
                    <div key={chartData.labels[i]} className="overview-barwrap">
                      <div
                        className={`overview-bar overview-bar--${i}`}
                        style={{ height: `${Math.round((v / chartData.max) * 100)}%` }}
                      />
                      <div className="overview-barlabel">{chartData.labels[i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overview-panel">
              <div className="overview-panel__head">
                <div className="overview-panel__title">Recent Activity</div>
              </div>

              <div className="overview-activity">
                {recentUsers.map((u) => (
                  <div key={`u-${u.id}`} className="overview-activity__item">
                    <div className="overview-activity__icon overview-activity__icon--blue">
                      <UserPlus size={18} />
                    </div>
                    <div>
                      <div className="overview-activity__title">New User Registration</div>
                      <div className="overview-activity__sub">{u.name} joined as {u.role || 'USER'}</div>
                      <div className="overview-activity__time">{timeAgo(u.createdAt)}</div>
                    </div>
                  </div>
                ))}

                {recentJobs.slice(0, 2).map((j) => (
                  <div key={`j-${j.id}`} className="overview-activity__item">
                    <div className="overview-activity__icon overview-activity__icon--violet">
                      <BriefcaseBusiness size={18} />
                    </div>
                    <div>
                      <div className="overview-activity__title">New Job Posted</div>
                      <div className="overview-activity__sub">
                        {j.title} • {j.company}
                      </div>
                      <div className="overview-activity__time">{timeAgo(j.createdAt)}</div>
                    </div>
                  </div>
                ))}

                {recentUsers.length === 0 && recentJobs.length === 0 && (
                  <div style={{ color: '#64748b', fontWeight: 800, padding: 6 }}>No recent activity.</div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom table */}
          <div className="overview-panel">
            <div className="overview-panel__head">
              <div className="overview-panel__title">Recent Jobs</div>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Posted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: 18, color: '#64748b' }}>
                      No jobs yet. Create a job to see it here.
                    </td>
                  </tr>
                ) : (
                  recentJobs.map((j) => (
                    <tr key={j.id}>
                      <td style={{ fontWeight: 900, color: '#0f172a' }}>{j.title}</td>
                      <td>{j.company}</td>
                      <td style={{ color: '#64748b', fontWeight: 800 }}>{timeAgo(j.createdAt)}</td>
                      <td>
                        <span className="overview-status">Active</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOverview;



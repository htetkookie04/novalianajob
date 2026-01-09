import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { MapPin, Clock, Briefcase } from 'lucide-react';
import './PublicJobList.css';

function PublicJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchJob = useCallback(async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  if (loading) {
    return (
      <div className="public-page">
        <Navbar title="Novaliana" />
        <div className="container">
          <div className="public-empty">Loading...</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="public-page">
        <Navbar title="Novaliana" />
        <div className="container">
          <div className="public-empty">
            Job not found.
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => navigate('/')}>
                Back to Job List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      <Navbar title="Novaliana" />

      <div className="container">
        <div className="public-detail">
          <div className="public-detail__top">
            <div className="public-detail__company">{(job.company || '').toUpperCase()}</div>
            <div className="public-badges">
              <span className="public-badge">{job.jobType}</span>
              {typeof job.location === 'string' && job.location.toLowerCase().includes('remote') ? (
                <span className="public-badge public-badge--soft">Remote</span>
              ) : (
                <span className="public-badge public-badge--soft">On-site</span>
              )}
            </div>
          </div>

          <h1 className="public-detail__title">{job.title}</h1>

          <div className="public-detail__meta">
            <span className="public-meta">
              <MapPin size={16} /> {job.location}
            </span>
            <span className="public-meta">
              <Briefcase size={16} /> {job.jobType}
            </span>
            <span className="public-meta">
              <Clock size={16} /> {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>

          {job.salary && <div className="public-detail__salary">Salary: {job.salary}</div>}

          <div className="public-detail__desc">
            <h3>Description</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{job.description || 'No description provided.'}</p>
          </div>

          <div className="public-detail__actions">
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicJobDetail;


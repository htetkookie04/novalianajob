import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import '../PublicJobList.css';

function AdminJobForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    salary: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      const job = response.data;
      setFormData({
        title: job.title,
        company: job.company,
        location: job.location,
        jobType: job.jobType,
        salary: job.salary || '',
        description: job.description || ''
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      setError('Error loading job');
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      fetchJob();
    }
  }, [isEdit, fetchJob]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/jobs/${id}`, formData);
      } else {
        await api.post('/jobs', formData);
      }
      navigate('/admin/jobs');
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: 0 }}>
      <div className="card">
        <h2>{isEdit ? 'Edit Job' : 'Create New Job'}</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Company *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Job Type *</label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div className="form-group">
              <label>Salary</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g., $50,000 - $70,000"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="10"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : isEdit ? 'Update Job' : 'Create Job'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin/jobs')}
              >
                Cancel
              </button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default AdminJobForm;


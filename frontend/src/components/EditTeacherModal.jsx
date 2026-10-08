import React, { useState, useEffect } from 'react';
import { TeacherAPI } from '../apis/teacher.api';
import { BookOpen, X, AlertCircle, Lock, Phone, UserCheck } from 'lucide-react';

export const EditTeacherModal = ({ teacher, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    Subject: '',
    teacher_ssn: '',
    user_name: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (teacher) {
      setFormData({
        full_name: teacher.full_name || '',
        phone: teacher.phone || '',
        Subject: teacher.Subject || '',
        teacher_ssn: teacher.teacher_ssn || '',
        user_name: teacher.user_name || '',
        password: ''
      });
    }
  }, [teacher]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');

      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        Subject: formData.Subject,
        teacher_ssn: formData.teacher_ssn,
        user_name: formData.user_name
      };

      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      await TeacherAPI.update(teacher.teacher_id, payload);
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update instructor info');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Edit Instructor Information</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Updating faculty record for {teacher?.full_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Subject / Specialty</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Physics, Chemistry, Math"
                  value={formData.Subject}
                  onChange={(e) => setFormData({ ...formData, Subject: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ paddingLeft: '2.2rem' }}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">National SSN (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="29001011234567"
                value={formData.teacher_ssn}
                onChange={(e) => setFormData({ ...formData, teacher_ssn: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.user_name}
                  onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Leave empty to keep current"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{ paddingLeft: '2.2rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving Changes...' : 'Update Instructor Info'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

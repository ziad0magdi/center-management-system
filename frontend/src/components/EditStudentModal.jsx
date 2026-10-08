import React, { useState, useEffect } from 'react';
import { StudentAPI } from '../apis/student.api';
import { UserCheck, X, AlertCircle, Lock, QrCode } from 'lucide-react';

export const EditStudentModal = ({ student, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    full_Name: '',
    student_phone: '',
    parent_phone: '',
    grade_level: '',
    QR_code: '',
    user_name: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        full_Name: student.full_Name || '',
        student_phone: student.student_phone || '',
        parent_phone: student.parent_phone || '',
        grade_level: student.grade_level || 'Grade 12 (Thanaweya Amma)',
        QR_code: student.QR_code || '',
        user_name: student.user_name || '',
        password: ''
      });
    }
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      
      const payload = {
        full_Name: formData.full_Name,
        student_phone: formData.student_phone,
        parent_phone: formData.parent_phone,
        grade_level: formData.grade_level,
        QR_code: formData.QR_code,
        user_name: formData.user_name
      };

      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      await StudentAPI.update(student.student_ID, payload);
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update student profile');
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
              <UserCheck size={18} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Edit Student Information</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Updating record for {student?.full_Name}
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
                value={formData.full_Name}
                onChange={(e) => setFormData({ ...formData, full_Name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Parent Phone (WhatsApp)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.student_phone}
                  onChange={(e) => setFormData({ ...formData, student_phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Grade Level</label>
                <select
                  className="form-select"
                  value={formData.grade_level}
                  onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                >
                  <option value="Grade 12 (Thanaweya Amma)">Grade 12 (Thanaweya Amma)</option>
                  <option value="Grade 11 (Secondary 2)">Grade 11 (Secondary 2)</option>
                  <option value="Grade 10 (Secondary 1)">Grade 10 (Secondary 1)</option>
                  <option value="Grade 9 (Prep 3)">Grade 9 (Prep 3)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">QR Code Identifier</label>
                <div style={{ position: 'relative' }}>
                  <QrCode size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-input"
                    value={formData.QR_code}
                    onChange={(e) => setFormData({ ...formData, QR_code: e.target.value })}
                    style={{ paddingLeft: '2.2rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                    required
                  />
                </div>
              </div>
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
              {isSubmitting ? 'Saving Changes...' : 'Update Student Info'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

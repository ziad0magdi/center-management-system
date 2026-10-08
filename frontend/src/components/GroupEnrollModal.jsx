import React, { useState, useEffect } from 'react';
import { StudentAPI } from '../apis/student.api';
import { GroupAPI } from '../apis/group.api';
import { X, Layers, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const GroupEnrollModal = ({ student, onClose, onUpdated }) => {
  const [allGroups, setAllGroups] = useState([]);
  const [enrolledGroups, setEnrolledGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (student?.student_ID) {
      loadData();
    }
  }, [student]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [groups, enrolled] = await Promise.all([
        GroupAPI.getAll({ is_active: true }),
        StudentAPI.getStudentGroups(student.student_ID)
      ]);
      setAllGroups(groups || []);
      setEnrolledGroups(enrolled || []);
      
      const enrolledIds = new Set((enrolled || []).map(g => g.group_id));
      const available = (groups || []).filter(g => !enrolledIds.has(g.group_id));
      if (available.length > 0) {
        setSelectedGroupId(available[0].group_id);
      } else {
        setSelectedGroupId('');
      }
    } catch (err) {
      setError(err.message || 'Failed to load group details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) return;

    try {
      setIsProcessing(true);
      setError('');
      await StudentAPI.enroll(student.student_ID, Number(selectedGroupId));
      setMessage('Student successfully enrolled in group!');
      await loadData();
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Enrollment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnenroll = async (groupId) => {
    try {
      setIsProcessing(true);
      setError('');
      await StudentAPI.unenroll(student.student_ID, Number(groupId));
      setMessage('Student removed from group.');
      await loadData();
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Removal failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const enrolledIds = new Set(enrolledGroups.map(g => g.group_id));
  const availableGroups = allGroups.filter(g => !enrolledIds.has(g.group_id));

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Group Enrollments</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Student: <strong style={{ color: 'var(--text-primary)' }}>{student?.full_Name}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {message && (
            <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <CheckCircle2 size={18} />
              {message}
            </div>
          )}

          {/* Currently Enrolled Groups */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
              Active Group Enrollments ({enrolledGroups.length})
            </h4>

            {isLoading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading enrollments...</div>
            ) : enrolledGroups.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                This student is not currently enrolled in any groups.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {enrolledGroups.map(grp => (
                  <div
                    key={grp.group_id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid var(--border-color)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{grp.group_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Teacher: {grp.teacher_name} ({grp.Subject}) • Fee: <strong>EGP {grp.monthly_fee}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnenroll(grp.group_id)}
                      disabled={isProcessing}
                      className="btn btn-danger btn-sm"
                      title="Unenroll from group"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enroll into New Group */}
          {availableGroups.length > 0 && (
            <form onSubmit={handleEnroll} style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px dashed rgba(99, 102, 241, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.6rem' }}>
                Enroll in Another Group:
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  className="form-select"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  style={{ flex: 1, fontSize: '0.85rem' }}
                >
                  {availableGroups.map(g => (
                    <option key={g.group_id} value={g.group_id}>
                      {g.group_name} (Teacher: {g.teacher_name} • EGP {g.monthly_fee})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isProcessing || !selectedGroupId}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={16} />
                  Enroll
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

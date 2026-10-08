import React, { useState, useEffect } from 'react';
import { GroupAPI } from '../apis/group.api';
import { StudentAPI } from '../apis/student.api';
import { Users, Plus, Trash2, X, AlertCircle, CheckCircle2, Search, QrCode } from 'lucide-react';

export const GroupStudentsModal = ({ group, onClose, onUpdated }) => {
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (group?.group_id) {
      loadData();
    }
  }, [group]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [roster, all] = await Promise.all([
        GroupAPI.getStudents(group.group_id),
        StudentAPI.getAll()
      ]);
      setEnrolledStudents(roster || []);
      setAllStudents(all || []);

      const enrolledIds = new Set((roster || []).map(s => s.student_ID));
      const available = (all || []).filter(s => !enrolledIds.has(s.student_ID));
      if (available.length > 0) {
        setSelectedStudentId(available[0].student_ID);
      } else {
        setSelectedStudentId('');
      }
    } catch (err) {
      setError(err.message || 'Failed to load group roster');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    try {
      setIsProcessing(true);
      setError('');
      await StudentAPI.enroll(Number(selectedStudentId), group.group_id);
      setMessage('Student successfully added to group roster!');
      await loadData();
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to add student to group');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnenroll = async (studentId) => {
    try {
      setIsProcessing(true);
      setError('');
      await StudentAPI.unenroll(Number(studentId), group.group_id);
      setMessage('Student removed from group.');
      await loadData();
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to remove student');
    } finally {
      setIsProcessing(false);
    }
  };

  const enrolledIds = new Set(enrolledStudents.map(s => s.student_ID));
  const availableStudents = allStudents.filter(s => !enrolledIds.has(s.student_ID));

  const filteredEnrolled = enrolledStudents.filter(s =>
    !searchTerm ||
    s.full_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.parent_phone.includes(searchTerm) ||
    s.QR_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="var(--info)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Group Roster & Assignment</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {group?.group_name} • (Monthly Fee: EGP {group?.monthly_fee})
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

          {/* Quick Assign Student Form */}
          {availableStudents.length > 0 && (
            <form onSubmit={handleEnroll} style={{ background: 'rgba(99, 102, 241, 0.06)', border: '1px dashed rgba(99, 102, 241, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.6rem' }}>
                Assign Student to this Group:
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  className="form-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={{ flex: 1, fontSize: '0.85rem' }}
                >
                  {availableStudents.map(s => (
                    <option key={s.student_ID} value={s.student_ID}>
                      {s.full_Name} ({s.grade_level || 'General'} • {s.QR_code})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isProcessing || !selectedStudentId}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={16} />
                  Add to Group
                </button>
              </div>
            </form>
          )}

          {/* Enrolled Students Roster List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Enrolled Students ({enrolledStudents.length})
              </h4>

              {enrolledStudents.length > 3 && (
                <div style={{ position: 'relative', width: '200px' }}>
                  <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Filter roster..."
                    className="form-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '1.8rem', padding: '0.35rem 0.5rem 0.35rem 1.8rem', fontSize: '0.8rem' }}
                  />
                </div>
              )}
            </div>

            {isLoading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>
                Loading group roster...
              </div>
            ) : enrolledStudents.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                No students are currently enrolled in this group. Use the selector above to add students.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                {filteredEnrolled.map(student => (
                  <div
                    key={student.student_ID}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid var(--border-color)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{student.full_Name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.6rem', marginTop: '0.15rem' }}>
                        <span>Grade: <strong>{student.grade_level || 'General'}</strong></span>
                        <span>Parent: <strong>{student.parent_phone}</strong></span>
                        <code style={{ color: '#38bdf8' }}>{student.QR_code}</code>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnenroll(student.student_ID)}
                      disabled={isProcessing}
                      className="btn btn-danger btn-sm"
                      title="Remove student from group"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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

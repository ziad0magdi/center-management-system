import React, { useState, useEffect } from 'react';
import { AttendanceAPI } from '../apis/attendance.api';
import { Send, CheckCheck, AlertCircle, X, MessageSquare, Phone, UserX } from 'lucide-react';

export const WhatsAppModal = ({ session, onClose, onSentSuccess }) => {
  const [absentStudents, setAbsentStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.session_ID) {
      loadAbsentStudents();
    }
  }, [session]);

  const loadAbsentStudents = async () => {
    try {
      setIsLoading(true);
      const data = await AttendanceAPI.getAbsentStudents(session.session_ID);
      setAbsentStudents(data || []);
      setSelectedIds((data || []).map(s => s.student_ID));
    } catch (err) {
      setError(err.message || 'Failed to load absent students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStudent = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one absent student to notify.');
      return;
    }

    try {
      setIsSending(true);
      setError('');
      const res = await AttendanceAPI.sendAbsenceWhatsApp(session.session_ID, {
        custom_message: customMessage,
        target_student_ids: selectedIds
      });

      setDispatchResult(res);
      if (onSentSuccess) {
        onSentSuccess(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to send WhatsApp notifications.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Send Absence WhatsApp Alert</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {session?.session_title} • ({session?.session_date})
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

          {dispatchResult ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--success-bg)', border: '2px solid var(--success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCheck size={32} color="#10b981" />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399', marginBottom: '0.5rem' }}>
                WhatsApp Alerts Dispatched!
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {dispatchResult.message}
              </p>

              <div style={{ maxHeight: '200px', overflowY: 'auto', textAlign: 'left', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                {dispatchResult.notifications?.map(n => (
                  <div key={n.message_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                    <span><strong>{n.student_name}</strong> ({n.recipient_phone})</span>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>✓ DELIVERED</span>
                  </div>
                ))}
              </div>

              <button onClick={onClose} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                Close
              </button>
            </div>
          ) : isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Filtering absent students...
            </div>
          ) : absentStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <UserX size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontWeight: 700 }}>No Absent Students!</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                All enrolled students for this group have attended this session.
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Select Absent Students ({selectedIds.length}/{absentStudents.length})</span>
                  <button
                    type="button"
                    onClick={() => setSelectedIds(selectedIds.length === absentStudents.length ? [] : absentStudents.map(s => s.student_ID))}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    {selectedIds.length === absentStudents.length ? 'Deselect All' : 'Select All'}
                  </button>
                </label>

                <div style={{ maxHeight: '180px', overflowY: 'auto', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                  {absentStudents.map(student => (
                    <label
                      key={student.student_ID}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        background: selectedIds.includes(student.student_ID) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        marginBottom: '0.25rem'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(student.student_ID)}
                        onChange={() => handleToggleStudent(student.student_ID)}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{student.full_Name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Parent WhatsApp: <strong>{student.parent_phone}</strong>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message Customization */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={14} />
                  Custom Message Template (Leave empty for default):
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Dear Parent, we would like to inform you that your child was absent from today's session in..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  style={{ fontSize: '0.85rem', height: '90px' }}
                />
              </div>
            </>
          )}
        </div>

        {!dispatchResult && absentStudents.length > 0 && (
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={isSending}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || selectedIds.length === 0}
              className="btn btn-gradient"
            >
              <Send size={16} />
              {isSending ? 'Dispatching WhatsApp Alerts...' : `Send to ${selectedIds.length} Parent(s)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

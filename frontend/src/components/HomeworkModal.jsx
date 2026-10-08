import React, { useState } from 'react';
import { SessionAPI } from '../apis/session.api';
import { BookOpen, Check, X, AlertCircle } from 'lucide-react';

export const HomeworkModal = ({ session, onClose, onUpdated }) => {
  const [homeworkNotes, setHomeworkNotes] = useState(session?.homework_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError('');
      await SessionAPI.updateHomework(session.session_ID, homeworkNotes);
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update homework');
    } finally {
      setIsSaving(false);
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Assign Homework / Notes</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {session?.session_title}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {error && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Homework Description & Instructions for Students:</label>
              <textarea
                className="form-textarea"
                rows={6}
                placeholder="e.g. Solve Chapter 2 exercises (page 45-48). Prepare summary notes for next week's quiz."
                value={homeworkNotes}
                onChange={(e) => setHomeworkNotes(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              <Check size={16} />
              {isSaving ? 'Saving...' : 'Save Homework'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { StudentNotesAPI } from '../apis/student_notes.api';
import { FileText, Check, X, AlertCircle } from 'lucide-react';

export const PersonalNoteModal = ({ session, onClose, onSaved }) => {
  const [personalNote, setPersonalNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.session_ID) {
      loadExistingNote();
    }
  }, [session]);

  const loadExistingNote = async () => {
    try {
      setIsLoading(true);
      const data = await StudentNotesAPI.getSessionNote(session.session_ID);
      if (data && data.personal_note) {
        setPersonalNote(data.personal_note);
      }
    } catch {
      // no existing note
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError('');
      await StudentNotesAPI.saveNote({
        session_id: session.session_ID,
        personal_note: personalNote
      });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save personal note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#a855f7" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Personal Session Note</h3>
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
              <label className="form-label">Write your personal study notes, doubts, or reminders:</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="e.g. Remember to ask teacher about formula derivation on page 32..."
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" disabled={isSaving || isLoading} className="btn btn-gradient">
              <Check size={16} />
              {isSaving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

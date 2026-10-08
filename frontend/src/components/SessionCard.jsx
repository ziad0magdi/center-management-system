import React, { useState } from 'react';
import { Calendar, BookOpen, CheckCircle, Clock, Send, QrCode, FileText, Edit2, MessageSquare } from 'lucide-react';

export const SessionCard = ({
  session,
  userRole = 'teacher',
  onEditHomework,
  onOpenQRScanner,
  onSendWhatsApp,
  onAddStudentNote,
  onToggleComplete
}) => {
  const [showHomework, setShowHomework] = useState(false);

  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin';
  const isStudent = userRole === 'student';

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: session.completed ? '4px solid #10b981' : '4px solid #6366f1' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
              <Calendar size={12} />
              {session.session_date}
            </span>
            <span className={`badge ${session.completed ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem' }}>
              {session.completed ? <CheckCircle size={12} /> : <Clock size={12} />}
              {session.completed ? 'Completed' : 'Upcoming / In Progress'}
            </span>
          </div>

          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {session.session_title}
          </h4>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Group: <strong>{session.group_name}</strong> {session.teacher_name && `• Teacher: ${session.teacher_name}`}
          </p>
        </div>

        {/* Attendance Stats for Teacher/Admin */}
        {isTeacherOrAdmin && (
          <div style={{ textAlign: 'right', background: 'rgba(15, 23, 42, 0.6)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ATTENDANCE</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
              {session.attended_count || 0} / {session.total_enrolled || 0}
            </div>
          </div>
        )}
      </div>

      {/* Homework Notes Section */}
      <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#818cf8' }}>
            <BookOpen size={15} />
            Teacher Homework & Instructions:
          </div>
          {isTeacherOrAdmin && onEditHomework && (
            <button
              onClick={() => onEditHomework(session)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--primary)' }}
            >
              <Edit2 size={12} />
              Edit Homework
            </button>
          )}
        </div>
        <p style={{ fontSize: '0.875rem', color: session.homework_notes ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
          {session.homework_notes || 'No homework assigned yet for this session.'}
        </p>
      </div>

      {/* Student Personal Note if provided */}
      {isStudent && session.personal_note && (
        <div style={{ background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
            <FileText size={14} />
            My Personal Session Note:
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            {session.personal_note}
          </p>
        </div>
      )}

      {/* Action Buttons Toolbar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
        {/* Teacher Actions */}
        {isTeacherOrAdmin && (
          <>
            {onOpenQRScanner && (
              <button
                onClick={() => onOpenQRScanner(session)}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <QrCode size={15} />
                Live QR Scanner
              </button>
            )}

            {onSendWhatsApp && (
              <button
                onClick={() => onSendWhatsApp(session)}
                className="btn btn-gradient btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <Send size={14} />
                Send Absence WhatsApp
              </button>
            )}

            {onToggleComplete && (
              <button
                onClick={() => onToggleComplete(session)}
                className={`btn btn-sm ${session.completed ? 'btn-outline' : 'btn-success'}`}
                style={{ gap: '0.35rem', marginLeft: 'auto' }}
              >
                <CheckCircle size={14} />
                {session.completed ? 'Mark Incomplete' : 'Complete Session'}
              </button>
            )}
          </>
        )}

        {/* Student Actions */}
        {isStudent && onAddStudentNote && (
          <button
            onClick={() => onAddStudentNote(session)}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <MessageSquare size={14} />
            {session.personal_note ? 'Edit My Note' : 'Add Personal Note'}
          </button>
        )}
      </div>
    </div>
  );
};

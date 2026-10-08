import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { TeacherAPI } from '../apis/teacher.api';
import { SessionAPI } from '../apis/session.api';
import { AttendanceAPI } from '../apis/attendance.api';

import { Navbar } from '../components/Navbar';
import { SessionCard } from '../components/SessionCard';
import { QRScanner } from '../components/QRScanner';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { HomeworkModal } from '../components/HomeworkModal';

import { 
  BookOpen, 
  Layers, 
  Users, 
  Calendar, 
  Plus, 
  QrCode, 
  Send, 
  CheckCircle2, 
  Clock, 
  X,
  FileText,
  Sparkles
} from 'lucide-react';

export const TeacherView = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedGroupId, setSelectedGroupId] = useState('ALL');
  
  // Modals state
  const [activeQRScannerSession, setActiveQRScannerSession] = useState(null);
  const [activeWhatsAppSession, setActiveWhatsAppSession] = useState(null);
  const [activeHomeworkSession, setActiveHomeworkSession] = useState(null);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);

  // New Session Form State
  const [newSessionForm, setNewSessionForm] = useState({
    group_id: '',
    session_date: new Date().toISOString().split('T')[0],
    session_title: '',
    homework_notes: ''
  });

  // 1. Fetch only groups assigned to the logged-in teacher
  const { data: myGroups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ['teacher-groups'],
    queryFn: () => TeacherAPI.getMyGroups()
  });

  // 2. Fetch sessions for the teacher
  const { data: mySessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['teacher-sessions'],
    queryFn: () => SessionAPI.getAll()
  });

  // Create Session Mutation
  const createSessionMutation = useMutation({
    mutationFn: (data) => SessionAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-sessions'] });
      setShowCreateSessionModal(false);
      setNewSessionForm({
        group_id: myGroups[0]?.group_id || '',
        session_date: new Date().toISOString().split('T')[0],
        session_title: '',
        homework_notes: ''
      });
    }
  });

  // Toggle Session Completion
  const toggleCompleteMutation = useMutation({
    mutationFn: (session) => SessionAPI.update(session.session_ID, { completed: !session.completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-sessions'] });
    }
  });

  // Filter sessions by selected group
  const filteredSessions = mySessions.filter(s => {
    if (selectedGroupId === 'ALL') return true;
    return s.group_id === Number(selectedGroupId);
  });

  const totalStudents = myGroups.reduce((acc, g) => acc + (Number(g.student_count) || 0), 0);
  const totalCompleted = mySessions.filter(s => s.completed).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="page-wrapper">
        {/* Welcome & Stats Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-primary">INSTRUCTOR PORTAL</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Specialty: {user?.subject || 'Educator'}</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              Welcome back, {user?.full_name || 'Teacher'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Manage your teaching batches, schedule class sessions, assign homework, and notify parents of absences.
            </p>
          </div>

          <button
            onClick={() => {
              if (myGroups.length > 0) {
                setNewSessionForm(prev => ({ ...prev, group_id: myGroups[0].group_id }));
              }
              setShowCreateSessionModal(true);
            }}
            disabled={myGroups.length === 0}
            className="btn btn-gradient"
          >
            <Plus size={18} /> Schedule New Session
          </button>
        </div>

        {/* Quick Stat Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <Layers size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{myGroups.length}</div>
              <div className="stat-label">Assigned Batches / Groups</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
              <Users size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{totalStudents}</div>
              <div className="stat-label">Enrolled Students Across Groups</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent)' }}>
              <Calendar size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{mySessions.length}</div>
              <div className="stat-label">Total Scheduled Sessions</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--info)' }}>
              <CheckCircle2 size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{totalCompleted}</div>
              <div className="stat-label">Completed Classes</div>
            </div>
          </div>
        </div>

        {/* Group Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
            <button
              onClick={() => setSelectedGroupId('ALL')}
              className={`tab-btn ${selectedGroupId === 'ALL' ? 'active' : ''}`}
            >
              All Batches ({mySessions.length})
            </button>
            {myGroups.map(g => (
              <button
                key={g.group_id}
                onClick={() => setSelectedGroupId(g.group_id)}
                className={`tab-btn ${selectedGroupId === g.group_id ? 'active' : ''}`}
              >
                {g.group_name} ({g.student_count || 0} students)
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        {loadingSessions || loadingGroups ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading teaching schedule...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Calendar size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Sessions Scheduled</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem', maxWidth: '400px', margin: '0.4rem auto 1.5rem' }}>
              Create your first lesson to record student attendance via QR code, set homework, and alert parents.
            </p>
            <button
              onClick={() => setShowCreateSessionModal(true)}
              className="btn btn-primary"
            >
              <Plus size={16} /> Create Session
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
            {filteredSessions.map(session => (
              <SessionCard
                key={session.session_ID}
                session={session}
                userRole="teacher"
                onEditHomework={(s) => setActiveHomeworkSession(s)}
                onOpenQRScanner={(s) => setActiveQRScannerSession(s)}
                onSendWhatsApp={(s) => setActiveWhatsAppSession(s)}
                onToggleComplete={(s) => toggleCompleteMutation.mutate(s)}
              />
            ))}
          </div>
        )}
      </main>

      {/* =========================================================================
          MODALS
      ========================================================================= */}
      {/* 1. Real-Time QR Scanner Modal */}
      {activeQRScannerSession && (
        <div className="modal-overlay">
          <div style={{ maxWidth: '650px', width: '100%' }}>
            <QRScanner
              session={activeQRScannerSession}
              onClose={() => setActiveQRScannerSession(null)}
              onAttendanceSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['teacher-sessions'] });
              }}
            />
          </div>
        </div>
      )}

      {/* 2. Send Absence WhatsApp Modal */}
      {activeWhatsAppSession && (
        <WhatsAppModal
          session={activeWhatsAppSession}
          onClose={() => setActiveWhatsAppSession(null)}
        />
      )}

      {/* 3. Assign / Edit Homework Modal */}
      {activeHomeworkSession && (
        <HomeworkModal
          session={activeHomeworkSession}
          onClose={() => setActiveHomeworkSession(null)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['teacher-sessions'] });
          }}
        />
      )}

      {/* 4. Schedule New Session Modal */}
      {showCreateSessionModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Schedule Class Session</h3>
              <button onClick={() => setShowCreateSessionModal(false)} className="btn btn-ghost btn-sm">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              createSessionMutation.mutate(newSessionForm);
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Assign to Group / Batch</label>
                  <select
                    className="form-select"
                    value={newSessionForm.group_id}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, group_id: e.target.value })}
                    required
                  >
                    <option value="">Select Group</option>
                    {myGroups.map(g => (
                      <option key={g.group_id} value={g.group_id}>
                        {g.group_name} ({g.student_count || 0} students)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Session Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newSessionForm.session_date}
                      onChange={(e) => setNewSessionForm({ ...newSessionForm, session_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lesson Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Chapter 3: Gauss Law"
                      value={newSessionForm.session_title}
                      onChange={(e) => setNewSessionForm({ ...newSessionForm, session_title: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Homework Notes / Required Prep (Optional)</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Enter initial homework exercises or required materials..."
                    value={newSessionForm.homework_notes}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, homework_notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateSessionModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createSessionMutation.isPending || !newSessionForm.group_id}>
                  {createSessionMutation.isPending ? 'Scheduling...' : 'Schedule Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

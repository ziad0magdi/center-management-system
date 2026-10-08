import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { StudentAPI } from '../apis/student.api';
import { SessionAPI } from '../apis/session.api';
import { PaymentAPI } from '../apis/payment.api';
import { StudentNotesAPI } from '../apis/student_notes.api';

import { Navbar } from '../components/Navbar';
import { SessionCard } from '../components/SessionCard';
import { StudentQRModal } from '../components/StudentQRModal';
import { PersonalNoteModal } from '../components/PersonalNoteModal';
import { QRCodeSVG } from 'qrcode.react';

import { 
  GraduationCap, 
  Layers, 
  CreditCard, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  FileText, 
  DollarSign, 
  User,
  Clock,
  ExternalLink
} from 'lucide-react';

export const StudentView = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('sessions');
  const [selectedSessionForNote, setSelectedSessionForNote] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // 1. Fetch Enrolled Groups
  const { data: enrolledGroups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ['student-enrolled-groups'],
    queryFn: () => StudentAPI.getMyGroups()
  });

  // 2. Fetch Sessions for enrolled groups
  const { data: mySessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['student-sessions'],
    queryFn: () => SessionAPI.getAll()
  });

  // 3. Fetch Monthly Payment Status
  const { data: paymentStatus, isLoading: loadingPayments } = useQuery({
    queryKey: ['student-payment-status', currentMonth, currentYear],
    queryFn: () => PaymentAPI.getMyStatus({ month: currentMonth, year: currentYear })
  });

  // 4. Fetch Payment Receipts History
  const { data: paymentHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['student-payments-history'],
    queryFn: () => PaymentAPI.getMyPayments()
  });

  // 5. Fetch Personal Notes
  const { data: myNotes = [] } = useQuery({
    queryKey: ['student-notes'],
    queryFn: () => StudentNotesAPI.getMyNotes()
  });

  // Merge personal notes into sessions
  const sessionsWithNotes = mySessions.map(sess => {
    const note = myNotes.find(n => n.session_id === sess.session_ID);
    return {
      ...sess,
      personal_note: note ? note.personal_note : ''
    };
  });

  const isAllPaid = paymentStatus?.records?.length > 0 && paymentStatus.records.every(r => r.is_paid);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="page-wrapper">
        {/* Top Header Card with Quick QR Badge */}
        <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)' }}>
              <GraduationCap size={32} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span className="badge badge-success">STUDENT DASHBOARD</span>
                <span className="badge badge-primary">{user?.grade_level || 'Grade 12'}</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {user?.full_name || user?.full_Name || 'Student Portal'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                QR Code: <code style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{user?.qr_code || user?.QR_code || 'STD-2026'}</code> • Parent: {user?.parent_phone || 'N/A'}
              </p>
            </div>
          </div>

          {/* Quick QR Card Button */}
          <button
            onClick={() => setShowQRModal(true)}
            className="btn btn-gradient"
            style={{ padding: '0.85rem 1.25rem', gap: '0.6rem' }}
          >
            <QrCode size={20} />
            <span>Show My Digital ID & QR</span>
          </button>
        </div>

        {/* Payment Summary Banner */}
        <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: isAllPaid ? '4px solid #10b981' : '4px solid #f59e0b' }}>
          <div className="card-header" style={{ marginBottom: '0.75rem' }}>
            <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
              <CreditCard size={18} color={isAllPaid ? '#10b981' : '#f59e0b'} />
              Monthly Tuition Status — Month {currentMonth}/{currentYear}
            </h3>
            <span className={`badge ${isAllPaid ? 'badge-success' : 'badge-warning'}`}>
              {isAllPaid ? <CheckCircle2 size={13} /> : <Clock size={13} />}
              {isAllPaid ? 'ALL GROUPS FULLY PAID' : 'PENDING PAYMENT FOR THIS MONTH'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            {paymentStatus?.records?.map((rec, i) => (
              <div
                key={`${rec.group_id}-${i}`}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rec.group_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Instructor: {rec.teacher_name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.85rem' }}>
                    Fee: <strong>EGP {rec.monthly_fee}</strong>
                  </span>
                  <span className={`badge ${rec.is_paid ? 'badge-success' : rec.total_paid > 0 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                    {rec.is_paid ? 'PAID ✓' : rec.total_paid > 0 ? `PAID EGP ${rec.total_paid}` : 'UNPAID'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="tabs-nav">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          >
            <Calendar size={16} />
            My Lessons & Homework ({sessionsWithNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
          >
            <Layers size={16} />
            Enrolled Groups ({enrolledGroups.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          >
            <CreditCard size={16} />
            Payment Receipts History ({paymentHistory.length})
          </button>
        </div>

        {/* =====================================================================
            TAB 1: LESSONS & HOMEWORK
        ===================================================================== */}
        {activeTab === 'sessions' && (
          <div>
            {loadingSessions ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Loading your class schedule...
              </div>
            ) : sessionsWithNotes.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <Calendar size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3>No Sessions Scheduled</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  There are no scheduled sessions for your groups at the moment.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {sessionsWithNotes.map(session => (
                  <SessionCard
                    key={session.session_ID}
                    session={session}
                    userRole="student"
                    onAddStudentNote={(s) => setSelectedSessionForNote(s)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 2: ENROLLED GROUPS
        ===================================================================== */}
        {activeTab === 'groups' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {enrolledGroups.map(grp => (
              <div key={grp.group_id} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{grp.group_name}</h3>
                  <span className="badge badge-success">Enrolled</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div>Instructor: <strong style={{ color: 'var(--text-primary)' }}>{grp.teacher_name}</strong></div>
                  <div>Subject: <strong style={{ color: 'var(--primary)' }}>{grp.Subject}</strong></div>
                  <div>Monthly Fee: <strong style={{ color: '#34d399' }}>EGP {grp.monthly_fee}</strong></div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Enrolled on: {new Date(grp.enrollment_Date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================================================
            TAB 3: PAYMENT RECEIPTS HISTORY
        ===================================================================== */}
        {activeTab === 'history' && (
          <div className="glass-card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Receipt ID</th>
                    <th>Group</th>
                    <th>Target Month</th>
                    <th>Amount Paid</th>
                    <th>Payment Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No past payment transactions recorded.
                      </td>
                    </tr>
                  ) : (
                    paymentHistory.map(p => (
                      <tr key={p.payment_id}>
                        <td><code>#REC-{p.payment_id}</code></td>
                        <td>{p.group_name}</td>
                        <td>Month {p.target_month} / {p.target_year}</td>
                        <td><strong style={{ color: '#34d399' }}>EGP {p.amount_paid}</strong></td>
                        <td>{new Date(p.payment_date).toLocaleString()}</td>
                        <td><span className="badge badge-success">CONFIRMED ✓</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* =====================================================================
          MODALS
      ===================================================================== */}
      {/* 1. Student Digital QR Pass Modal */}
      {showQRModal && (
        <StudentQRModal
          student={{
            full_Name: user?.full_name || user?.full_Name || 'Student',
            grade_level: user?.grade_level || 'Grade 12',
            QR_code: user?.qr_code || user?.QR_code || 'STD-2026',
            parent_phone: user?.parent_phone || '+201000000000'
          }}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* 2. Personal Session Note Modal */}
      {selectedSessionForNote && (
        <PersonalNoteModal
          session={selectedSessionForNote}
          onClose={() => setSelectedSessionForNote(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['student-notes'] });
          }}
        />
      )}
    </div>
  );
};

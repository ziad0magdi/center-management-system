import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentAPI } from '../apis/student.api';
import { TeacherAPI } from '../apis/teacher.api';
import { GroupAPI } from '../apis/group.api';
import { SessionAPI } from '../apis/session.api';
import { PaymentAPI } from '../apis/payment.api';

import { Navbar } from '../components/Navbar';
import { StudentTable } from '../components/StudentTable';
import { QRScanner } from '../components/QRScanner';
import { PaymentModal } from '../components/PaymentModal';
import { StudentQRModal } from '../components/StudentQRModal';
import { GroupEnrollModal } from '../components/GroupEnrollModal';
import { EditStudentModal } from '../components/EditStudentModal';
import { EditTeacherModal } from '../components/EditTeacherModal';
import { GroupStudentsModal } from '../components/GroupStudentsModal';

import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  QrCode, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Calendar, 
  DollarSign, 
  Search,
  Trash2,
  Edit3,
  X,
  Phone,
  UserPlus
} from 'lucide-react';

export const AdminView = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [selectedStudentForQR, setSelectedStudentForQR] = useState(null);
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const [selectedTeacherForEdit, setSelectedTeacherForEdit] = useState(null);
  const [selectedGroupForRoster, setSelectedGroupForRoster] = useState(null);

  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [showCreateTeacherModal, setShowCreateTeacherModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  
  // Payment tracking month/year filter
  const [paymentMonth, setPaymentMonth] = useState(new Date().getMonth() + 1);
  const [paymentYear, setPaymentYear] = useState(new Date().getFullYear());
  const [paymentFilter, setPaymentFilter] = useState('ALL'); // ALL, PAID, UNPAID

  // QR Scanner session selector
  const [scannerGroupId, setScannerGroupId] = useState('');
  const [scannerSessionId, setScannerSessionId] = useState('');

  // 1. Data Fetching via React Query
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: () => StudentAPI.getAll()
  });

  const { data: teachers = [], isLoading: loadingTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => TeacherAPI.getAll()
  });

  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => GroupAPI.getAll()
  });

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => SessionAPI.getAll()
  });

  const { data: paymentOverview, isLoading: loadingPayments } = useQuery({
    queryKey: ['payment-overview', paymentMonth, paymentYear],
    queryFn: () => PaymentAPI.getMonthlyOverview({ month: paymentMonth, year: paymentYear })
  });

  // Forms state
  const [studentForm, setStudentForm] = useState({
    full_Name: '',
    student_phone: '',
    parent_phone: '',
    grade_level: 'Grade 12 (Thanaweya Amma)',
    user_name: '',
    password: 'password123'
  });

  const [teacherForm, setTeacherForm] = useState({
    teacher_ssn: '',
    full_name: '',
    phone: '',
    Subject: 'Physics',
    user_name: '',
    password: 'password123'
  });

  const [groupForm, setGroupForm] = useState({
    teacher_id: '',
    group_name: '',
    monthly_fee: 450,
    is_active: true
  });

  // Mutations
  const createStudentMutation = useMutation({
    mutationFn: (data) => StudentAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowCreateStudentModal(false);
      setStudentForm({
        full_Name: '',
        student_phone: '',
        parent_phone: '',
        grade_level: 'Grade 12 (Thanaweya Amma)',
        user_name: '',
        password: 'password123'
      });
    }
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id) => StudentAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
  });

  const createTeacherMutation = useMutation({
    mutationFn: (data) => TeacherAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setShowCreateTeacherModal(false);
      setTeacherForm({
        teacher_ssn: '',
        full_name: '',
        phone: '',
        Subject: 'Physics',
        user_name: '',
        password: 'password123'
      });
    }
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: (id) => TeacherAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] })
  });

  const createGroupMutation = useMutation({
    mutationFn: (data) => GroupAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setShowCreateGroupModal(false);
      setGroupForm({
        teacher_id: '',
        group_name: '',
        monthly_fee: 450,
        is_active: true
      });
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id) => GroupAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] })
  });

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
    { id: 'students', label: 'Students', icon: <GraduationCap size={16} /> },
    { id: 'teachers', label: 'Teachers', icon: <BookOpen size={16} /> },
    { id: 'groups', label: 'Groups', icon: <Layers size={16} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
    { id: 'scanner', label: 'QR Scanner', icon: <QrCode size={16} /> }
  ];

  // Selected session for scanner
  const availableScannerSessions = sessions.filter(s => !scannerGroupId || s.group_id === Number(scannerGroupId));
  const activeScannerSession = sessions.find(s => s.session_ID === Number(scannerSessionId)) || availableScannerSessions[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} navigationItems={navItems} />

      <main className="page-wrapper">
        {/* =========================================================================
            TAB 1: OVERVIEW & ANALYTICS
        ========================================================================= */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Center Operations Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Real-time statistics across students, teachers, active sessions, and monthly fee collections.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button onClick={() => setShowCreateStudentModal(true)} className="btn btn-primary btn-sm">
                  <Plus size={16} /> Add Student
                </button>
                <button onClick={() => setShowCreateTeacherModal(true)} className="btn btn-outline btn-sm">
                  <Plus size={16} /> Add Teacher
                </button>
                <button onClick={() => setShowCreateGroupModal(true)} className="btn btn-gradient btn-sm">
                  <Plus size={16} /> Create Group
                </button>
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
                  <GraduationCap size={26} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{students.length}</div>
                  <div className="stat-label">Total Enrolled Students</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent)' }}>
                  <BookOpen size={26} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{teachers.length}</div>
                  <div className="stat-label">Active Instructors</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--info)' }}>
                  <Layers size={26} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{groups.length}</div>
                  <div className="stat-label">Active Groups</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                  <DollarSign size={26} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">EGP {paymentOverview?.summary?.total_collected || 0}</div>
                  <div className="stat-label">
                    Collected This Month ({paymentOverview?.summary?.collection_rate_percent || 0}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Sessions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Payment Health Card */}
              <div className="glass-card">
                <div className="card-header">
                  <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
                    <CreditCard size={18} color="var(--primary)" />
                    Monthly Payment Health ({paymentMonth}/{paymentYear})
                  </h3>
                  <button onClick={() => setActiveTab('payments')} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
                    View Matrix →
                  </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span>Collection Progress</span>
                    <strong>{paymentOverview?.summary?.collection_rate_percent || 0}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${paymentOverview?.summary?.collection_rate_percent || 0}%`, height: '100%', background: 'var(--emerald-gradient)', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PAID STUDENTS</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>{paymentOverview?.summary?.paid_count || 0}</div>
                  </div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UNPAID / PENDING</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f87171' }}>{paymentOverview?.summary?.unpaid_count || 0}</div>
                  </div>
                </div>
              </div>

              {/* Fast QR Attendance Launcher */}
              <div className="glass-card">
                <div className="card-header">
                  <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
                    <QrCode size={18} color="var(--primary)" />
                    Real-Time QR Attendance Check
                  </h3>
                  <button onClick={() => setActiveTab('scanner')} className="btn btn-primary btn-sm">
                    Open Full Scanner
                  </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Scan student QR code badges using a live webcam or test the attendance pipeline in real-time.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {sessions.slice(0, 3).map(s => (
                    <div key={s.session_ID} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', flex: 1, minWidth: '160px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.session_title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{s.group_name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Students Preview Table */}
            <StudentTable
              students={students.slice(0, 5)}
              onViewQR={(s) => setSelectedStudentForQR(s)}
              onManageGroups={(s) => setSelectedStudentForEnroll(s)}
              onEditStudent={(s) => setSelectedStudentForEdit(s)}
              onRecordPayment={(s) => setSelectedStudentForPayment(s)}
            />
          </div>
        )}

        {/* =========================================================================
            TAB 2: STUDENTS MANAGEMENT
        ========================================================================= */}
        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Student Directory & QR Codes</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Create and edit student profiles, assign them to educational groups, and print digital attendance cards.
                </p>
              </div>
              <button onClick={() => setShowCreateStudentModal(true)} className="btn btn-primary">
                <Plus size={16} /> Register New Student
              </button>
            </div>

            <StudentTable
              students={students}
              onViewQR={(s) => setSelectedStudentForQR(s)}
              onManageGroups={(s) => setSelectedStudentForEnroll(s)}
              onEditStudent={(s) => setSelectedStudentForEdit(s)}
              onRecordPayment={(s) => setSelectedStudentForPayment(s)}
              onDeleteStudent={(s) => {
                if (window.confirm(`Are you sure you want to delete student "${s.full_Name}"?`)) {
                  deleteStudentMutation.mutate(s.student_ID);
                }
              }}
            />
          </div>
        )}

        {/* =========================================================================
            TAB 3: TEACHERS MANAGEMENT
        ========================================================================= */}
        {activeTab === 'teachers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Faculty & Instructors</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Manage instructor profiles, subjects, credentials, and their assigned educational batches.
                </p>
              </div>
              <button onClick={() => setShowCreateTeacherModal(true)} className="btn btn-primary">
                <Plus size={16} /> Add Instructor
              </button>
            </div>

            <div className="glass-card">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Instructor Name</th>
                      <th>Specialty / Subject</th>
                      <th>Contact Phone</th>
                      <th>National SSN</th>
                      <th>Username</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                          No teachers registered yet.
                        </td>
                      </tr>
                    ) : (
                      teachers.map(t => (
                        <tr key={t.teacher_id}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{t.full_name}</div>
                          </td>
                          <td>
                            <span className="badge badge-primary">{t.Subject}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem' }}>{t.phone}</span>
                          </td>
                          <td>
                            <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.teacher_ssn || 'N/A'}</code>
                          </td>
                          <td>
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>@{t.user_name}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => setSelectedTeacherForEdit(t)}
                                className="btn btn-outline btn-sm"
                                title="Edit Instructor Info"
                                style={{ padding: '0.35rem 0.6rem' }}
                              >
                                <Edit3 size={14} /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete teacher "${t.full_name}"?`)) {
                                    deleteTeacherMutation.mutate(t.teacher_id);
                                  }
                                }}
                                className="btn btn-danger btn-sm"
                                title="Delete Instructor"
                                style={{ padding: '0.35rem 0.6rem' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: GROUPS MANAGEMENT
        ========================================================================= */}
        {activeTab === 'groups' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Educational Groups & Batches</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Manage classes, monthly tuition fees, assigned instructors, and assign students directly to rosters.
                </p>
              </div>
              <button onClick={() => setShowCreateGroupModal(true)} className="btn btn-gradient">
                <Plus size={16} /> Create New Group
              </button>
            </div>

            <div className="glass-card">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Group Name</th>
                      <th>Instructor</th>
                      <th>Monthly Fee</th>
                      <th>Enrolled Students</th>
                      <th>Sessions</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                          No groups configured yet.
                        </td>
                      </tr>
                    ) : (
                      groups.map(g => (
                        <tr key={g.group_id}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{g.group_name}</div>
                          </td>
                          <td>
                            <div>{g.teacher_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.teacher_subject}</div>
                          </td>
                          <td>
                            <strong style={{ color: '#34d399' }}>EGP {g.monthly_fee}</strong>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedGroupForRoster(g)}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--primary)', fontWeight: 700 }}
                              title="Manage Group Roster & Assign Students"
                            >
                              <Users size={14} style={{ marginRight: '0.3rem' }} />
                              {g.student_count || 0} Student(s) →
                            </button>
                          </td>
                          <td>
                            <span className="badge badge-primary">{g.session_count || 0} Session(s)</span>
                          </td>
                          <td>
                            <span className={`badge ${g.is_active ? 'badge-success' : 'badge-danger'}`}>
                              {g.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => setSelectedGroupForRoster(g)}
                                className="btn btn-outline btn-sm"
                                title="Manage Students in this Group"
                                style={{ padding: '0.35rem 0.6rem' }}
                              >
                                <UserPlus size={14} /> Roster
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete group "${g.group_name}"?`)) {
                                    deleteGroupMutation.mutate(g.group_id);
                                  }
                                }}
                                className="btn btn-danger btn-sm"
                                style={{ padding: '0.35rem 0.6rem' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: PAYMENTS TRACKING
        ========================================================================= */}
        {activeTab === 'payments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Student Monthly Payments Matrix</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Track who paid for the current month, calculate pending fees, and record receipts.
                </p>
              </div>

              {/* Month / Year Filter */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  className="form-select"
                  value={paymentMonth}
                  onChange={(e) => setPaymentMonth(Number(e.target.value))}
                  style={{ width: 'auto', fontSize: '0.85rem' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                    <option key={m} value={m}>Month {m}</option>
                  ))}
                </select>

                <input
                  type="number"
                  className="form-input"
                  value={paymentYear}
                  onChange={(e) => setPaymentYear(Number(e.target.value))}
                  style={{ width: '90px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Overview Metric Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL EXPECTED</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  EGP {paymentOverview?.summary?.total_expected || 0}
                </div>
              </div>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL COLLECTED</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>
                  EGP {paymentOverview?.summary?.total_collected || 0}
                </div>
              </div>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PENDING BALANCE</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f87171' }}>
                  EGP {paymentOverview?.summary?.total_pending || 0}
                </div>
              </div>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>COLLECTION RATE</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {paymentOverview?.summary?.collection_rate_percent || 0}%
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setPaymentFilter('ALL')}
                className={`btn btn-sm ${paymentFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              >
                All Students ({paymentOverview?.records?.length || 0})
              </button>
              <button
                onClick={() => setPaymentFilter('PAID')}
                className={`btn btn-sm ${paymentFilter === 'PAID' ? 'btn-success' : 'btn-outline'}`}
              >
                Paid ({paymentOverview?.records?.filter(r => r.is_paid).length || 0})
              </button>
              <button
                onClick={() => setPaymentFilter('UNPAID')}
                className={`btn btn-sm ${paymentFilter === 'UNPAID' ? 'btn-danger' : 'btn-outline'}`}
              >
                Unpaid / Due ({paymentOverview?.records?.filter(r => !r.is_paid).length || 0})
              </button>
            </div>

            {/* Payments Matrix Table */}
            <div className="glass-card">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Group</th>
                      <th>Monthly Fee</th>
                      <th>Paid Amount</th>
                      <th>Remaining Due</th>
                      <th>Status</th>
                      <th>Last Payment Date</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPayments ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          Loading payment matrix...
                        </td>
                      </tr>
                    ) : paymentOverview?.records?.filter(r => {
                      if (paymentFilter === 'PAID') return r.is_paid;
                      if (paymentFilter === 'UNPAID') return !r.is_paid;
                      return true;
                    }).length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                          No payment records found matching this filter.
                        </td>
                      </tr>
                    ) : (
                      paymentOverview?.records
                        ?.filter(r => {
                          if (paymentFilter === 'PAID') return r.is_paid;
                          if (paymentFilter === 'UNPAID') return !r.is_paid;
                          return true;
                        })
                        .map((rec, i) => (
                          <tr key={`${rec.student_ID}-${rec.group_id}-${i}`}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{rec.full_Name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Parent: {rec.parent_phone}</div>
                            </td>
                            <td>{rec.group_name}</td>
                            <td>EGP {rec.monthly_fee}</td>
                            <td>
                              <strong style={{ color: rec.total_paid > 0 ? '#34d399' : 'var(--text-muted)' }}>
                                EGP {rec.total_paid}
                              </strong>
                            </td>
                            <td>
                              <strong style={{ color: rec.remaining_balance > 0 ? '#f87171' : 'var(--text-muted)' }}>
                                EGP {rec.remaining_balance}
                              </strong>
                            </td>
                            <td>
                              <span className={`badge ${rec.is_paid ? 'badge-success' : rec.total_paid > 0 ? 'badge-warning' : 'badge-danger'}`}>
                                {rec.is_paid ? 'PAID' : rec.total_paid > 0 ? 'PARTIAL' : 'UNPAID'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {rec.last_payment_date ? new Date(rec.last_payment_date).toLocaleDateString() : 'No payment yet'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => setSelectedStudentForPayment({
                                  student_ID: rec.student_ID,
                                  full_Name: rec.full_Name
                                })}
                                className="btn btn-primary btn-sm"
                              >
                                Record Payment
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: REAL-TIME QR ATTENDANCE SCANNER
        ========================================================================= */}
        {activeTab === 'scanner' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Real-Time QR Attendance Checkpoint</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Select the active class session and scan student QR codes in real-time.
                </p>
              </div>

              {/* Group & Session Selectors */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  className="form-select"
                  value={scannerGroupId}
                  onChange={(e) => {
                    setScannerGroupId(e.target.value);
                    const matching = sessions.filter(s => !e.target.value || s.group_id === Number(e.target.value));
                    if (matching.length > 0) setScannerSessionId(matching[0].session_ID);
                  }}
                  style={{ width: 'auto', fontSize: '0.85rem' }}
                >
                  <option value="">All Groups</option>
                  {groups.map(g => (
                    <option key={g.group_id} value={g.group_id}>{g.group_name}</option>
                  ))}
                </select>

                <select
                  className="form-select"
                  value={scannerSessionId}
                  onChange={(e) => setScannerSessionId(e.target.value)}
                  style={{ width: 'auto', fontSize: '0.85rem' }}
                >
                  {availableScannerSessions.map(s => (
                    <option key={s.session_ID} value={s.session_ID}>
                      {s.session_title} ({s.session_date})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeScannerSession ? (
              <QRScanner
                session={activeScannerSession}
                onAttendanceSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['sessions'] });
                  queryClient.invalidateQueries({ queryKey: ['attendance'] });
                }}
              />
            ) : (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <Calendar size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3>No Sessions Scheduled</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Please create a session for a group first to activate real-time QR attendance scanning.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
          MODALS
      ========================================================================= */}
      {/* 1. Student Digital QR Code Modal */}
      {selectedStudentForQR && (
        <StudentQRModal
          student={selectedStudentForQR}
          onClose={() => setSelectedStudentForQR(null)}
        />
      )}

      {/* 2. Group Enrollments Modal (From Student Row) */}
      {selectedStudentForEnroll && (
        <GroupEnrollModal
          student={selectedStudentForEnroll}
          onClose={() => setSelectedStudentForEnroll(null)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
          }}
        />
      )}

      {/* 3. Group Students / Roster Assignment Modal (From Group Row) */}
      {selectedGroupForRoster && (
        <GroupStudentsModal
          group={selectedGroupForRoster}
          onClose={() => setSelectedGroupForRoster(null)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
          }}
        />
      )}

      {/* 4. Edit Student Modal */}
      {selectedStudentForEdit && (
        <EditStudentModal
          student={selectedStudentForEdit}
          onClose={() => setSelectedStudentForEdit(null)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
          }}
        />
      )}

      {/* 5. Edit Teacher / Instructor Modal */}
      {selectedTeacherForEdit && (
        <EditTeacherModal
          teacher={selectedTeacherForEdit}
          onClose={() => setSelectedTeacherForEdit(null)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
          }}
        />
      )}

      {/* 6. Record Payment Modal */}
      {selectedStudentForPayment && (
        <PaymentModal
          student={selectedStudentForPayment}
          groups={groups}
          onClose={() => setSelectedStudentForPayment(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['payment-overview'] });
          }}
        />
      )}

      {/* 7. Create Student Modal */}
      {showCreateStudentModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Register New Student</h3>
              <button onClick={() => setShowCreateStudentModal(false)} className="btn btn-ghost btn-sm">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              createStudentMutation.mutate(studentForm);
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mostafa Mahmoud Hassan"
                    value={studentForm.full_Name}
                    onChange={(e) => setStudentForm({ ...studentForm, full_Name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Parent Phone (WhatsApp)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="+201012345678"
                      value={studentForm.parent_phone}
                      onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Student Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="+201123456789"
                      value={studentForm.student_phone}
                      onChange={(e) => setStudentForm({ ...studentForm, student_phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Grade Level</label>
                  <select
                    className="form-select"
                    value={studentForm.grade_level}
                    onChange={(e) => setStudentForm({ ...studentForm, grade_level: e.target.value })}
                  >
                    <option value="Grade 12 (Thanaweya Amma)">Grade 12 (Thanaweya Amma)</option>
                    <option value="Grade 11 (Secondary 2)">Grade 11 (Secondary 2)</option>
                    <option value="Grade 10 (Secondary 1)">Grade 10 (Secondary 1)</option>
                    <option value="Grade 9 (Prep 3)">Grade 9 (Prep 3)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. mostafa_m"
                      value={studentForm.user_name}
                      onChange={(e) => setStudentForm({ ...studentForm, user_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateStudentModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createStudentMutation.isPending}>
                  {createStudentMutation.isPending ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Create Teacher Modal */}
      {showCreateTeacherModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Add Instructor / Teacher</h3>
              <button onClick={() => setShowCreateTeacherModal(false)} className="btn btn-ghost btn-sm">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              createTeacherMutation.mutate(teacherForm);
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Hisham Mahmoud"
                    value={teacherForm.full_name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, full_name: e.target.value })}
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
                      value={teacherForm.Subject}
                      onChange={(e) => setTeacherForm({ ...teacherForm, Subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="+201012345678"
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">National SSN (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="29001011234567"
                    value={teacherForm.teacher_ssn}
                    onChange={(e) => setTeacherForm({ ...teacherForm, teacher_ssn: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. hisham_physics"
                      value={teacherForm.user_name}
                      onChange={(e) => setTeacherForm({ ...teacherForm, user_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={teacherForm.password}
                      onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateTeacherModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createTeacherMutation.isPending}>
                  {createTeacherMutation.isPending ? 'Saving...' : 'Add Instructor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Create Group Modal */}
      {showCreateGroupModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Create Educational Group</h3>
              <button onClick={() => setShowCreateGroupModal(false)} className="btn btn-ghost btn-sm">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              createGroupMutation.mutate(groupForm);
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Group Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Physics Masters - Grade 12 (Sat & Tue 6 PM)"
                    value={groupForm.group_name}
                    onChange={(e) => setGroupForm({ ...groupForm, group_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Instructor</label>
                  <select
                    className="form-select"
                    value={groupForm.teacher_id}
                    onChange={(e) => setGroupForm({ ...groupForm, teacher_id: e.target.value })}
                    required
                  >
                    <option value="">Select an Instructor</option>
                    {teachers.map(t => (
                      <option key={t.teacher_id} value={t.teacher_id}>
                        {t.full_name} ({t.Subject})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Monthly Tuition Fee (EGP)</label>
                  <input
                    type="number"
                    step="10"
                    className="form-input"
                    placeholder="e.g. 450.00"
                    value={groupForm.monthly_fee}
                    onChange={(e) => setGroupForm({ ...groupForm, monthly_fee: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateGroupModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-gradient" disabled={createGroupMutation.isPending || !groupForm.teacher_id}>
                  {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

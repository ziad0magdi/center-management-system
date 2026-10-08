import React from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { AdminView } from './pages/AdminView';
import { TeacherView } from './pages/TeacherView';
import { StudentView } from './pages/StudentView';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { user, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulseGlow 1.5s infinite ease-in-out'
        }}>
          <Sparkles size={26} color="#ffffff" />
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
          Initializing SmartCenter Management System...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  switch (role?.toLowerCase()) {
    case 'admin':
      return <AdminView />;
    case 'teacher':
      return <TeacherView />;
    case 'student':
      return <StudentView />;
    default:
      return <Login />;
  }
}

export default function App() {
  return <AppContent />;
}

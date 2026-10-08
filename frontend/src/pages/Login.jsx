import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldCheck, BookOpen, GraduationCap, ArrowRight, Lock, User, AlertCircle, Check } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    if (newRole === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (newRole === 'teacher') {
      setUsername('tamer_physics');
      setPassword('password123');
    } else if (newRole === 'student') {
      setUsername('omar_khaled');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password, role);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0a0e1a 100%)'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'rgba(26, 34, 52, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
          }}>
            <Sparkles size={30} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SmartCenter Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Smart Educational Center Management & Real-Time Attendance
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.4rem',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.75rem',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`btn btn-sm ${role === 'admin' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.2rem' }}
          >
            <ShieldCheck size={14} />
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('teacher')}
            className={`btn btn-sm ${role === 'teacher' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.2rem' }}
          >
            <BookOpen size={14} />
            Teacher
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            className={`btn btn-sm ${role === 'student' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.2rem' }}
          >
            <GraduationCap size={14} />
            Student
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Enter username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="form-input"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-gradient"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginBottom: '1.25rem' }}
          >
            {isLoading ? 'Signing in securely...' : `Sign in as ${role.toUpperCase()}`}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Quick Demo Credentials Footer */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          border: '1px dashed var(--border-color)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.35rem' }}>
            ✨ Quick 1-Click Demo Accounts:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div>• <strong>Admin:</strong> admin / admin123</div>
            <div>• <strong>Teacher:</strong> tamer_physics / password123</div>
            <div>• <strong>Student:</strong> omar_khaled / password123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

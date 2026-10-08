import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Sparkles, ShieldCheck, GraduationCap, BookOpen } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, navigationItems = [] }) => {
  const { user, role, logout } = useAuth();

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return <ShieldCheck size={18} color="#ec4899" />;
      case 'teacher':
        return <BookOpen size={18} color="#818cf8" />;
      case 'student':
        return <GraduationCap size={18} color="#34d399" />;
      default:
        return <User size={18} />;
    }
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'admin':
        return 'badge-danger';
      case 'teacher':
        return 'badge-primary';
      case 'student':
        return 'badge-success';
      default:
        return 'badge-info';
    }
  };

  return (
    <header style={{
      background: 'rgba(17, 24, 39, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.85rem 2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SmartCenter
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Educational Hub & Attendance
            </p>
          </div>
        </div>

        {/* Navigation Tabs if provided */}
        {navigationItems.length > 0 && (
          <nav style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`btn btn-sm ${activeTab === item.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.full_name || user?.full_Name || user?.username || 'User'}
              </div>
              <div className={`badge ${getRoleBadgeClass()}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                {getRoleIcon()}
                {role}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-outline btn-sm"
            title="Log Out"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

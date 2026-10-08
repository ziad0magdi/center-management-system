import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Printer, QrCode, GraduationCap, ShieldCheck } from 'lucide-react';

export const StudentQRModal = ({ student, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!student) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(student.QR_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '460px', textAlign: 'center' }}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
            <ShieldCheck size={18} />
            Digital Student ID Pass
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ paddingTop: '0.5rem' }}>
          {/* Card Frame */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            border: '2px solid rgba(99, 102, 241, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem 1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            marginBottom: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <GraduationCap size={22} color="#818cf8" />
              <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.05em', color: '#c7d2fe', textTransform: 'uppercase' }}>
                Smart Educational Center
              </span>
            </div>

            {/* QR Code Container */}
            <div style={{
              background: '#ffffff',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              display: 'inline-block',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              marginBottom: '1rem'
            }}>
              <QRCodeSVG
                value={student.QR_code}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Student Info */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
              {student.full_Name}
            </h3>
            <div className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
              {student.grade_level || 'General Student'}
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 0.85rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>QR Code Key:</span>
                <code style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{student.QR_code}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Parent Phone:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{student.parent_phone}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
            <button
              onClick={handleCopy}
              className="btn btn-outline btn-sm"
              style={{ flex: 1 }}
            >
              {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
              {copied ? 'Copied QR!' : 'Copy QR Code'}
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
            >
              <Printer size={16} />
              Print Badge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

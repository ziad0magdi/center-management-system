import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { AttendanceAPI } from '../apis/attendance.api';
import { QrCode, Camera, CheckCircle2, AlertCircle, RefreshCw, Zap, X, UserCheck } from 'lucide-react';

export const QRScanner = ({ session, onAttendanceSuccess, onClose }) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentScans, setRecentScans] = useState([]);

  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);

  // Common sample student QR codes for fast 1-click simulation
  const quickTestCodes = [
    { name: 'Omar Khaled Mahmoud', code: 'STD-2026-0001-OKM' },
    { name: 'Nour El-Din Youssef', code: 'STD-2026-0002-NDY' },
    { name: 'Mariam Ali Mostafa', code: 'STD-2026-0003-MAM' }
  ];

  const handleProcessCode = async (codeToSubmit) => {
    if (!codeToSubmit || !codeToSubmit.trim()) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setScanResult(null);

    try {
      const response = await AttendanceAPI.scanQR({
        session_id: session.session_ID,
        qr_code: codeToSubmit.trim()
      });

      setScanResult({
        success: true,
        message: response.message || 'Attendance registered successfully!',
        data: response.data
      });

      setRecentScans(prev => [
        {
          id: Date.now(),
          code: codeToSubmit,
          name: response.data?.student?.full_Name || 'Student',
          time: new Date().toLocaleTimeString()
        },
        ...prev
      ]);

      setManualCode('');
      if (onAttendanceSuccess) {
        onAttendanceSuccess(response.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to register attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startCamera = async () => {
    try {
      setErrorMessage('');
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      scannerInstance.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          html5QrCode.pause();
          handleProcessCode(decodedText).finally(() => {
            setTimeout(() => {
              if (scannerInstance.current?.isScanning) {
                html5QrCode.resume();
              }
            }, 2000);
          });
        },
        () => {
          // ignore scan frame errors
        }
      );
      setIsScanning(true);
    } catch (err) {
      setErrorMessage('Could not initialize camera. You can use manual input or test buttons below.');
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerInstance.current) {
      try {
        await scannerInstance.current.stop();
        scannerInstance.current.clear();
      } catch (err) {
        console.warn('Scanner stop error:', err);
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerInstance.current) {
        try {
          scannerInstance.current.stop().catch(() => {});
        } catch {}
      }
    };
  }, []);

  return (
    <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto', position: 'relative' }}>
      {onClose && (
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm"
          style={{ position: 'absolute', top: '1rem', right: '1rem' }}
        >
          <X size={20} />
        </button>
      )}

      <div className="card-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h3 className="card-title" style={{ color: 'var(--primary)' }}>
            <QrCode size={22} />
            Real-Time Attendance QR Scanner
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Session: <strong style={{ color: 'var(--text-primary)' }}>{session?.session_title || 'Class Session'}</strong>
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {scanResult && (
        <div style={{
          background: 'var(--success-bg)',
          border: '1px solid var(--success-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'slideUp 0.2s ease'
        }}>
          <CheckCircle2 size={24} color="#34d399" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#34d399' }}>{scanResult.message}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Recorded at {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={22} color="#f87171" />
          <div style={{ fontSize: '0.9rem', color: '#f87171' }}>{errorMessage}</div>
        </div>
      )}

      {/* Live Camera Scanner Box */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        border: '1px dashed var(--border-color)',
        textAlign: 'center',
        marginBottom: '1.25rem'
      }}>
        <div id="qr-reader-container" style={{ width: '100%', minHeight: isScanning ? '260px' : '0', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}></div>

        {!isScanning ? (
          <button
            onClick={startCamera}
            className="btn btn-gradient"
            style={{ width: '100%', padding: '0.85rem' }}
          >
            <Camera size={20} />
            Start Live Camera Scanner
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="btn btn-danger btn-sm"
            style={{ marginTop: '0.75rem' }}
          >
            Stop Camera
          </button>
        )}
      </div>

      {/* Manual QR Code Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleProcessCode(manualCode);
        }}
        style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}
      >
        <input
          type="text"
          className="form-input"
          placeholder="Enter QR Code string (e.g. STD-2026-0001-OKM)..."
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !manualCode.trim()}
          className="btn btn-primary"
        >
          {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <UserCheck size={18} />}
          Mark
        </button>
      </form>

      {/* Quick Test Simulator */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.05)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.6rem' }}>
          <Zap size={16} />
          Quick One-Click Test Simulator:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {quickTestCodes.map((student) => (
            <button
              key={student.code}
              type="button"
              onClick={() => handleProcessCode(student.code)}
              disabled={isSubmitting}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.8rem', background: 'rgba(17, 24, 39, 0.7)' }}
            >
              Scan: <strong>{student.name}</strong> ({student.code})
            </button>
          ))}
        </div>
      </div>

      {/* Recent Scans List */}
      {recentScans.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Recent Scans in this session:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {recentScans.map(scan => (
              <div
                key={scan.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem'
                }}
              >
                <span><strong>{scan.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({scan.code})</span></span>
                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>{scan.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

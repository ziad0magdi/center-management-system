import React, { useState, useEffect } from 'react';
import { PaymentAPI } from '../apis/payment.api';
import { StudentAPI } from '../apis/student.api';
import { DollarSign, CheckCircle, AlertCircle, X, CreditCard, Calendar } from 'lucide-react';

export const PaymentModal = ({ student, groups = [], onClose, onSuccess }) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [studentGroups, setStudentGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [targetMonth, setTargetMonth] = useState(currentMonth);
  const [targetYear, setTargetYear] = useState(currentYear);
  const [amountPaid, setAmountPaid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student?.student_ID) {
      loadStudentGroups(student.student_ID);
    }
  }, [student]);

  const loadStudentGroups = async (studentId) => {
    try {
      const data = await StudentAPI.getStudentGroups(studentId);
      setStudentGroups(data || []);
      if (data && data.length > 0) {
        setSelectedGroupId(data[0].group_id);
        setAmountPaid(data[0].monthly_fee || 0);
      }
    } catch {
      setStudentGroups([]);
    }
  };

  const handleGroupChange = (groupId) => {
    setSelectedGroupId(groupId);
    const grp = studentGroups.find(g => g.group_id === Number(groupId));
    if (grp) {
      setAmountPaid(grp.monthly_fee || 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroupId || !amountPaid || parseFloat(amountPaid) <= 0) {
      setError('Please select a valid group and enter an amount paid.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await PaymentAPI.recordPayment({
        student_id: student.student_ID,
        group_id: Number(selectedGroupId),
        target_month: Number(targetMonth),
        target_year: Number(targetYear),
        amount_paid: parseFloat(amountPaid)
      });

      if (onSuccess) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Record Monthly Payment</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Student: <strong style={{ color: 'var(--text-primary)' }}>{student?.full_Name}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {studentGroups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                This student is not enrolled in any active groups yet. Please enroll them in a group first.
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Enrolled Educational Group:</label>
                  <select
                    className="form-select"
                    value={selectedGroupId}
                    onChange={(e) => handleGroupChange(e.target.value)}
                    required
                  >
                    {studentGroups.map(grp => (
                      <option key={grp.group_id} value={grp.group_id}>
                        {grp.group_name} — Fee: EGP {grp.monthly_fee}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Target Month:</label>
                    <select
                      className="form-select"
                      value={targetMonth}
                      onChange={(e) => setTargetMonth(e.target.value)}
                      required
                    >
                      {months.map(m => (
                        <option key={m.value} value={m.value}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Year:</label>
                    <input
                      type="number"
                      className="form-input"
                      value={targetYear}
                      onChange={(e) => setTargetYear(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Amount Paid (EGP):</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      className="form-input"
                      placeholder="e.g. 450.00"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      style={{ paddingLeft: '2.2rem', fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || studentGroups.length === 0}
              className="btn btn-success"
            >
              <CheckCircle size={16} />
              {isSubmitting ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

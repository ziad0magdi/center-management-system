import React, { useState } from 'react';
import { Search, QrCode, Trash2, Edit3, UserPlus, Phone, Layers, CheckCircle2 } from 'lucide-react';

export const StudentTable = ({
  students = [],
  onViewQR,
  onManageGroups,
  onEditStudent,
  onDeleteStudent,
  onRecordPayment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  const gradeLevels = Array.from(new Set(students.map(s => s.grade_level).filter(Boolean)));

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm ||
      student.full_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parent_phone.includes(searchTerm) ||
      student.QR_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = !gradeFilter || student.grade_level === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="glass-card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="card-title">
            <Layers size={20} color="var(--primary)" />
            Student Directory ({filteredStudents.length})
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Manage registered students, group assignments, and digital QR codes
          </p>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search name, phone, QR..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
            />
          </div>

          <select
            className="form-select"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '0.85rem' }}
          >
            <option value="">All Grade Levels</option>
            {gradeLevels.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Grade Level</th>
              <th>Contact Info</th>
              <th>QR Code</th>
              <th>Enrolled Groups</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  No students found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.student_ID}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{student.full_Name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{student.user_name}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{student.grade_level || 'General'}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>Parent:</strong> {student.parent_phone}
                    </div>
                    {student.student_phone && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <strong>Student:</strong> {student.student_phone}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => onViewQR(student)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.8rem', gap: '0.35rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                    >
                      <QrCode size={14} color="var(--primary)" />
                      {student.QR_code}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => onManageGroups(student)}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--primary)', borderColor: 'rgba(99, 102, 241, 0.3)', gap: '0.4rem' }}
                      title="Assign or remove student from groups"
                    >
                      <Layers size={13} />
                      {student.enrolled_groups_count || 0} Group(s)
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      {onRecordPayment && (
                        <button
                          onClick={() => onRecordPayment(student)}
                          className="btn btn-success btn-sm"
                          title="Record Payment"
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          Pay
                        </button>
                      )}
                      {onEditStudent && (
                        <button
                          onClick={() => onEditStudent(student)}
                          className="btn btn-outline btn-sm"
                          title="Edit Student Info"
                          style={{ padding: '0.35rem 0.6rem', gap: '0.3rem' }}
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                      )}
                      {onDeleteStudent && (
                        <button
                          onClick={() => onDeleteStudent(student)}
                          className="btn btn-danger btn-sm"
                          title="Delete Student"
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

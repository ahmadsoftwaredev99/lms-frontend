import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStudentAttendance } from '../features/attendance/attendanceSlice';
import { Calendar, CheckCircle, XCircle, Clock, Award, AlertTriangle } from 'lucide-react';
import Pagination from './Pagination';

const StudentAttendance = () => {
  const dispatch = useDispatch();
  const { studentAttendance, studentPagination, isLoading, isError, message } = useSelector(
    (state) => state.attendance
  );

  useEffect(() => {
    dispatch(fetchStudentAttendance({ page: 1, limit: 10 }));
  }, [dispatch]);

  const overall = studentAttendance?.overall || {
    totalSessions: 0,
    presentCount: 0,
    absentCount: 0,
    leaveCount: 0,
    attendancePercentage: 100.0,
  };

  const courseBreakdown = studentAttendance?.courseBreakdown || [];
  const records = studentAttendance?.records || [];

  const getPercentageColor = (pct) => {
    if (pct >= 85) return 'var(--accent-primary)'; // Green
    if (pct >= 75) return 'var(--accent-orange)'; // Orange
    return 'var(--danger)'; // Red
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <span className="badge badge-student">Present</span>;
      case 'absent':
        return <span className="badge badge-admin">Absent</span>;
      case 'leave':
        return <span className="badge badge-teacher">On Leave</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--accent-primary)' }}>Attendance Analytics</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
          Monitor your percentage view per course and overall attendance history
        </p>
      </div>

      {isError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {message || 'Failed to fetch attendance data'}
        </div>
      )}

      {isLoading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          Calculating attendance percentages...
        </div>
      ) : (
        <>
          {/* OVERALL ATTENDANCE SUMMARY BANNER */}
          <div className="glass-card" style={{ marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
              
              {/* OVERALL PERCENTAGE GAUGE CARD */}
              <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                  OVERALL ATTENDANCE
                </span>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: getPercentageColor(overall.attendancePercentage), margin: '0.5rem 0 0.25rem 0' }}>
                  {overall.attendancePercentage}%
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '12px', background: '#F8FAFC', border: '1px solid var(--border-color)' }}>
                  {overall.attendancePercentage >= 75 ? (
                    <Award size={14} color="var(--accent-primary)" />
                  ) : (
                    <AlertTriangle size={14} color="var(--danger)" />
                  )}
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{overall.attendancePercentage >= 75 ? 'Satisfactory Standing' : 'Below 75% Requirement'}</span>
                </div>
              </div>

              {/* STAT METRICS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', gridColumn: 'span 3' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                  <Calendar size={20} color="var(--accent-primary)" style={{ marginBottom: '0.25rem' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Sessions</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{overall.totalSessions}</span>
                </div>

                <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                  <CheckCircle size={20} color="#16A34A" style={{ marginBottom: '0.25rem' }} />
                  <span style={{ fontSize: '0.75rem', color: '#166534', display: 'block', fontWeight: 600 }}>Present</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#16A34A' }}>{overall.presentCount}</span>
                </div>

                <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                  <XCircle size={20} color="#DC2626" style={{ marginBottom: '0.25rem' }} />
                  <span style={{ fontSize: '0.75rem', color: '#991B1B', display: 'block', fontWeight: 600 }}>Absent</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#DC2626' }}>{overall.absentCount}</span>
                </div>

                <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                  <Clock size={20} color="#D97706" style={{ marginBottom: '0.25rem' }} />
                  <span style={{ fontSize: '0.75rem', color: '#92400E', display: 'block', fontWeight: 600 }}>Leave</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#D97706' }}>{overall.leaveCount}</span>
                </div>
              </div>

            </div>
          </div>

          {/* PER-COURSE PERCENTAGE CARDS */}
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-primary)' }}>Per-Course Attendance Percentages</h2>
          {courseBreakdown.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
              No course breakdown data available yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {courseBreakdown.map((item) => {
                const pct = item.attendancePercentage;
                const barColor = getPercentageColor(pct);

                return (
                  <div key={item.course._id} className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        {item.course.title}
                      </h3>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: barColor }}>
                        {pct}%
                      </span>
                    </div>

                    {/* PROGRESS BAR */}
                    <div style={{ height: '8px', width: '100%', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '4px', transition: 'width 0.5s ease-in-out' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Sessions: {item.totalSessions}</span>
                      <span>Present: {item.presentCount} | Absent: {item.absentCount} | Leave: {item.leaveCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DETAILED ATTENDANCE LOGS TABLE */}
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-primary)' }}>Attendance History Logs</h2>
          {records.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
              No attendance records marked by teachers yet.
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Marked By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record._id}>
                        <td>{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td style={{ fontWeight: 600 }}>{record.courseId?.title || 'Subject Course'}</td>
                        <td>{getStatusBadge(record.status)}</td>
                        <td>{record.markedBy?.name || 'Instructor'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Pagination
            currentPage={studentPagination?.page || 1}
            totalPages={studentPagination?.totalPages || 1}
            total={studentPagination?.total || 0}
            limit={studentPagination?.limit || 10}
            onPageChange={(page) => dispatch(fetchStudentAttendance({ page, limit: 10 }))}
          />
        </>
      )}
    </div>
  );
};

export default StudentAttendance;

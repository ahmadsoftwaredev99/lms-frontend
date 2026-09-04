import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTeacherCourses,
  fetchCourseAttendance,
  markAttendance,
  markBulkAttendance,
  updateAttendance,
} from '../features/attendance/attendanceSlice';
import { Percent } from 'lucide-react';
import Pagination from './Pagination';

const AttendanceTeacher = () => {
  const dispatch = useDispatch();
  const { teacherCourses, records, studentStats, pagination, isLoading } = useSelector(
    (state) => state.attendance
  );

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [mode, setMode] = useState('bulk'); // 'bulk' | 'single'

  // Single mark state
  const [singleStudentId, setSingleStudentId] = useState('');
  const [singleStatus, setSingleStatus] = useState('present');

  // Bulk mark state: { [studentId]: 'present' | 'absent' | 'leave' }
  const [bulkStatuses, setBulkStatuses] = useState({});

  useEffect(() => {
    dispatch(fetchTeacherCourses());
  }, [dispatch]);

  useEffect(() => {
    if (teacherCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(teacherCourses[0]._id);
    }
  }, [teacherCourses, selectedCourseId]);

  useEffect(() => {
    if (selectedCourseId) {
      dispatch(fetchCourseAttendance(selectedCourseId));
    }
  }, [selectedCourseId, dispatch]);

  const selectedCourse = teacherCourses.find((c) => c._id === selectedCourseId);

  // Initialize bulk statuses when course changes
  useEffect(() => {
    if (selectedCourse?.enrolledStudents) {
      const initial = {};
      selectedCourse.enrolledStudents.forEach((s) => {
        initial[s._id] = 'present';
      });
      setBulkStatuses(initial);
    }
  }, [selectedCourse]);

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    const recordsPayload = Object.keys(bulkStatuses).map((studentId) => ({
      studentId,
      status: bulkStatuses[studentId],
    }));

    dispatch(
      markBulkAttendance({
        courseId: selectedCourseId,
        date: attendanceDate,
        records: recordsPayload,
      })
    );
  };

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCourseId || !singleStudentId) return;

    dispatch(
      markAttendance({
        courseId: selectedCourseId,
        studentId: singleStudentId,
        date: attendanceDate,
        status: singleStatus,
      })
    ).then(() => {
      dispatch(fetchCourseAttendance(selectedCourseId));
    });
  };

  const handleStatusChange = (recordId, newStatus) => {
    dispatch(
      updateAttendance({ id: recordId, status: newStatus, courseId: selectedCourseId })
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* HEADER CARD */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Attendance Roster</h2>
          <p style={{ color: 'var(--text-muted)' }}>Mark daily attendance & monitor student participation rates</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '0.2rem' }}>Select Course</label>
            <select
              className="form-input"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              style={{ minWidth: '220px' }}
            >
              {teacherCourses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: '0.2rem' }}>Session Date</label>
            <input
              type="date"
              className="form-input"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selectedCourse ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          {/* MAIN ATTENDANCE FORM */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Mark Attendance</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className={`btn-secondary ${mode === 'bulk' ? 'btn-primary' : ''}`}
                    onClick={() => setMode('bulk')}
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    Bulk Class Roster
                  </button>
                  <button
                    className={`btn-secondary ${mode === 'single' ? 'btn-primary' : ''}`}
                    onClick={() => setMode('single')}
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    Single Student
                  </button>
                </div>
              </div>

              {mode === 'bulk' ? (
                <form onSubmit={handleBulkSubmit}>
                  {selectedCourse.enrolledStudents?.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem 0' }}>
                      No students are currently enrolled in this course.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {selectedCourse.enrolledStudents?.map((student) => (
                        <div
                          key={student._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            background: '#F8FAFC',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{student.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.email}</div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {['present', 'absent', 'leave'].map((st) => (
                              <label
                                key={st}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  textTransform: 'capitalize',
                                  color:
                                    bulkStatuses[student._id] === st
                                      ? st === 'present'
                                        ? 'var(--accent-primary)'
                                        : st === 'absent'
                                        ? 'var(--danger)'
                                        : 'var(--accent-orange)'
                                      : 'var(--text-muted)',
                                  fontWeight: bulkStatuses[student._id] === st ? 700 : 500,
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`status-${student._id}`}
                                  value={st}
                                  checked={bulkStatuses[student._id] === st}
                                  onChange={() =>
                                    setBulkStatuses({ ...bulkStatuses, [student._id]: st })
                                  }
                                />
                                {st}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                    Submit Bulk Attendance for {attendanceDate}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSingleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Select Student</label>
                    <select
                      className="form-input"
                      value={singleStudentId}
                      onChange={(e) => setSingleStudentId(e.target.value)}
                      required
                    >
                      <option value="">-- Select Enrolled Student --</option>
                      {selectedCourse.enrolledStudents?.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Status</label>
                    <select
                      className="form-input"
                      value={singleStatus}
                      onChange={(e) => setSingleStatus(e.target.value)}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="leave">Leave</option>
                    </select>
                  </div>

                  <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                    Record Attendance Record
                  </button>
                </form>
              )}
            </div>

            {/* ATTENDANCE HISTORY TABLE */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Past Session Records</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Total Logged Sessions: {records.length}
                </span>
              </div>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        No past attendance records found for this course.
                      </td>
                    </tr>
                  ) : (
                    records.map((rec) => (
                      <tr key={rec._id}>
                        <td style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                          {new Date(rec.date).toLocaleDateString()}
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {rec.studentId?.name || 'Unknown Student'}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              rec.status === 'present'
                                ? 'badge-student'
                                : rec.status === 'absent'
                                ? 'badge-admin'
                                : 'badge-teacher'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={rec.status}
                            onChange={(e) => handleStatusChange(rec._id, e.target.value)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              background: '#FFFFFF',
                              color: 'var(--text-main)',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.8rem',
                            }}
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="leave">Leave</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <Pagination
                currentPage={pagination?.page || 1}
                totalPages={pagination?.totalPages || 1}
                total={pagination?.total || 0}
                limit={pagination?.limit || 10}
                onPageChange={(page) =>
                  dispatch(fetchCourseAttendance({ courseId: selectedCourseId, page, limit: 10 }))
                }
              />
            </div>
          </div>

          {/* AUTO-CALCULATED ATTENDANCE PERCENTAGES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Percent color="var(--accent-primary)" size={20} /> Calculated Percentages
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Auto-calculated per student attendance rate
              </p>

              {studentStats.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  No student stats available.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {studentStats.map((st) => {
                    const pct = st.attendancePercentage;
                    const color = pct >= 75 ? 'var(--accent-primary)' : pct >= 50 ? 'var(--accent-orange)' : 'var(--danger)';
                    return (
                      <div key={st.student._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>{st.student.name}</span>
                          <span style={{ fontWeight: 700, color }}>{pct}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: color,
                              borderRadius: '3px',
                              transition: 'width 0.3s ease',
                            }}
                          ></div>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                          <span>P: {st.presentCount}</span>
                          <span>A: {st.absentCount}</span>
                          <span>L: {st.leaveCount}</span>
                          <span>Tot: {st.totalSessions}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No courses assigned to your teacher account yet.</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceTeacher;

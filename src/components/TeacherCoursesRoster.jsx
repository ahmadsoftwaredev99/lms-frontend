import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTeacherCourses,
  fetchCourseRoster,
  clearCurrentRoster,
  enrollStudent,
} from '../features/courses/coursesSlice';
import { fetchStudents } from '../features/students/studentsSlice';
import { Users, UserPlus, UserCheck, BookOpen, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const TeacherCoursesRoster = () => {
  const dispatch = useDispatch();
  const { teacherCourses, currentRoster, rosterLoading } = useSelector(
    (state) => state.courses
  );
  const { students } = useSelector((state) => state.students);
  const { user } = useSelector((state) => state.auth);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollCourseId, setEnrollCourseId] = useState('');
  const [studentId, setStudentId] = useState('');

  // Inline feedback states
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    dispatch(fetchTeacherCourses({ all: true }));
    dispatch(fetchStudents());
  }, [dispatch]);

  // Set default selected course when teacher courses load
  useEffect(() => {
    if (teacherCourses && teacherCourses.length > 0) {
      if (!selectedCourseId || !teacherCourses.some((c) => c._id === selectedCourseId)) {
        setSelectedCourseId(teacherCourses[0]._id);
      }
    } else {
      setSelectedCourseId('');
      dispatch(clearCurrentRoster());
    }
  }, [teacherCourses]);

  // Fetch roster when selectedCourseId changes
  useEffect(() => {
    if (selectedCourseId) {
      dispatch(fetchCourseRoster(selectedCourseId));
    }
  }, [selectedCourseId, dispatch]);

  const activeCourse = teacherCourses.find((c) => c._id === selectedCourseId);

  const openEnrollModal = (courseIdToEnroll) => {
    const targetId = courseIdToEnroll || selectedCourseId || teacherCourses[0]?._id || '';
    setEnrollCourseId(targetId);
    setStudentId('');
    setEnrollError('');
    setEnrollSuccess('');
    setShowEnrollModal(true);
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!enrollCourseId || !studentId) return;

    setEnrollError('');
    setEnrollSuccess('');
    setIsEnrolling(true);

    const resultAction = await dispatch(
      enrollStudent({ courseId: enrollCourseId, studentId })
    );

    setIsEnrolling(false);

    if (enrollStudent.fulfilled.match(resultAction)) {
      setEnrollSuccess('Student enrolled successfully into your assigned course!');
      setStudentId('');
      // Refresh teacher courses and active roster
      dispatch(fetchTeacherCourses({ all: true }));
      if (selectedCourseId) {
        dispatch(fetchCourseRoster(selectedCourseId));
      }
      setTimeout(() => {
        setShowEnrollModal(false);
        setEnrollSuccess('');
      }, 1200);
    } else {
      // Defensive 403 handling or specific backend message
      const errorMsg = resultAction.payload || '';
      if (errorMsg.includes('403') || errorMsg.toLowerCase().includes('not assigned')) {
        setEnrollError('You can only enroll students into your own assigned courses.');
      } else {
        setEnrollError(errorMsg || 'Failed to enroll student');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* HEADER SECTION */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            Course Rosters & Student Enrollment
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            View class rosters and enroll students directly into your assigned courses
          </p>
        </div>

        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => openEnrollModal()}
          disabled={teacherCourses.length === 0}
        >
          <UserPlus size={18} /> Enroll Student
        </button>
      </div>

      {/* COURSE SELECTOR / ZERO COURSES NOTICE */}
      {teacherCourses.length === 0 ? (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '1rem',
              borderRadius: '50%',
              color: '#ef4444',
            }}
          >
            <BookOpen size={32} />
          </div>
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>No courses assigned to you yet.</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: 0 }}>
            An Administrator needs to assign you to one or more courses before you can view rosters or enroll students.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* COURSE PICKER TABS / DROPDOWN */}
          <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                  Select Course:
                </label>
                <select
                  className="form-input"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  style={{ maxWidth: '400px' }}
                >
                  {teacherCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.enrolledStudents?.length || 0} enrolled)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  className="btn-secondary"
                  onClick={() => dispatch(fetchCourseRoster(selectedCourseId))}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                  title="Refresh Roster"
                >
                  <RefreshCw size={15} /> Refresh Roster
                </button>
                <button
                  className="btn-primary"
                  onClick={() => openEnrollModal(selectedCourseId)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                >
                  <UserCheck size={16} /> Enroll Student
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE COURSE ROSTER DETAILS */}
          {activeCourse && (
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--accent-primary)', fontSize: '1.25rem' }}>
                    {activeCourse.title} — Enrolled Students
                  </h3>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    {activeCourse.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-student" style={{ fontSize: '0.88rem', padding: '0.35rem 0.75rem' }}>
                    <Users size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                    {currentRoster.length} Students Enrolled
                  </span>
                </div>
              </div>

              {rosterLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading course roster...
                </div>
              ) : currentRoster.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    No students enrolled in this course yet.
                  </p>
                  <button
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    onClick={() => openEnrollModal(selectedCourseId)}
                  >
                    <UserPlus size={16} /> Enroll First Student
                  </button>
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email Address</th>
                      <th>Enrolled By</th>
                      <th>Enrollment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRoster.map((entry) => (
                      <tr key={entry._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {entry.student?.name || 'Unknown Student'}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {entry.student?.email || 'N/A'}
                        </td>
                        <td>
                          {entry.enrolledByRole === 'admin' ? (
                            <span className="badge badge-admin">
                              Admin: {entry.enrolledBy?.name || 'Administrator'}
                            </span>
                          ) : (
                            <span className="badge badge-teacher">
                              Teacher: {entry.enrolledBy?.name || user?.name || 'Teacher'}
                            </span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Existing'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* ENROLL STUDENT MODAL (SCOPED TO ASSIGNED COURSES) */}
      {showEnrollModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '480px' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Enroll Student</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Select a student to enroll into your assigned course.
            </p>

            {/* INLINE ERROR ALERT */}
            {enrollError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#dc2626',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={17} style={{ flexShrink: 0 }} />
                <span>{enrollError}</span>
              </div>
            )}

            {/* INLINE SUCCESS ALERT */}
            {enrollSuccess && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#059669',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle size={17} style={{ flexShrink: 0 }} />
                <span>{enrollSuccess}</span>
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Course (Your Assigned Courses Only)</label>
                {teacherCourses.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.6rem 0' }}>
                    No courses assigned to you yet.
                  </div>
                ) : (
                  <select
                    className="form-input"
                    value={enrollCourseId}
                    onChange={(e) => setEnrollCourseId(e.target.value)}
                    required
                  >
                    {teacherCourses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="form-label">Select Student</label>
                <select
                  className="form-input"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  disabled={teacherCourses.length === 0}
                >
                  <option value="">-- Select Student --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowEnrollModal(false);
                    setEnrollError('');
                    setEnrollSuccess('');
                  }}
                  disabled={isEnrolling}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isEnrolling || teacherCourses.length === 0}
                >
                  {isEnrolling ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCoursesRoster;

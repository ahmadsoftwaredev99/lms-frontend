import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTeacherCourses,
  fetchCourseRoster,
  clearCurrentRoster,
  enrollStudent,
  unenrollStudent,
} from '../features/courses/coursesSlice';
import { fetchStudents } from '../features/students/studentsSlice';
import { Users, UserPlus, UserCheck, BookOpen, AlertCircle, CheckCircle, RefreshCw, Trash2, UserMinus, X } from 'lucide-react';
import usePagination from '../hooks/usePagination';
import Pagination from './Pagination';

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
  const [selectedEnrollStudentIds, setSelectedEnrollStudentIds] = useState([]);

  // Table selection states for bulk unenrollment
  const [selectedRosterIds, setSelectedRosterIds] = useState([]);

  // Inline feedback states
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Unenroll confirmation states
  const [unenrollTarget, setUnenrollTarget] = useState(null); // { studentIds: [], names: [], courseId, courseTitle }
  const [isUnenrolling, setIsUnenrolling] = useState(false);

  // Client-side pagination for course roster (limit 6)
  const {
    currentItems: paginatedRoster,
    currentPage,
    totalPages,
    goToPage,
    totalItems,
    resetPage,
  } = usePagination(currentRoster, 6);

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

  // Fetch roster and reset page when selectedCourseId changes
  useEffect(() => {
    if (selectedCourseId) {
      dispatch(fetchCourseRoster(selectedCourseId));
      resetPage();
      setSelectedRosterIds([]);
    }
  }, [selectedCourseId, dispatch]);

  const activeCourse = teacherCourses.find((c) => c._id === selectedCourseId);

  // Roster unenroll selection helpers
  const toggleRosterSelection = (id) => {
    setSelectedRosterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllRoster = () => {
    const pageIds = paginatedRoster
      .map((entry) => (entry.student?._id || entry.student)?.toString())
      .filter(Boolean);

    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedRosterIds.includes(id));

    if (allPageSelected) {
      setSelectedRosterIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const set = new Set([...selectedRosterIds, ...pageIds]);
      setSelectedRosterIds(Array.from(set));
    }
  };

  // Open single unenroll confirmation
  const openSingleUnenroll = (entry) => {
    const studentId = (entry.student?._id || entry.student)?.toString();
    const studentName = entry.student?.name || 'Student';
    setUnenrollTarget({
      studentIds: [studentId],
      names: [studentName],
      courseId: activeCourse._id,
      courseTitle: activeCourse.title,
    });
  };

  // Open bulk unenroll confirmation
  const openBulkUnenroll = () => {
    if (selectedRosterIds.length === 0) return;
    const names = selectedRosterIds.map((id) => {
      const entry = currentRoster.find(
        (r) => ((r.student?._id || r.student) || '').toString() === id
      );
      return entry?.student?.name || 'Student';
    });
    setUnenrollTarget({
      studentIds: selectedRosterIds,
      names,
      courseId: activeCourse._id,
      courseTitle: activeCourse.title,
    });
  };

  const handleConfirmUnenroll = async () => {
    if (!unenrollTarget || !unenrollTarget.studentIds.length) return;
    setIsUnenrolling(true);
    const res = await dispatch(
      unenrollStudent({
        courseId: unenrollTarget.courseId,
        studentIds: unenrollTarget.studentIds,
        studentId: unenrollTarget.studentIds[0],
      })
    );
    setIsUnenrolling(false);
    if (!res.error) {
      dispatch(fetchTeacherCourses({ all: true }));
      if (selectedCourseId) {
        dispatch(fetchCourseRoster(selectedCourseId));
      }
      setSelectedRosterIds((prev) =>
        prev.filter((id) => !unenrollTarget.studentIds.includes(id))
      );
      setUnenrollTarget(null);
    } else {
      alert(res.payload || 'Failed to unenroll student(s)');
      setUnenrollTarget(null);
    }
  };

  // Eligible students for enrollment into target course
  const currentEnrolledIdSet = new Set(
    currentRoster.map((r) => ((r.student?._id || r.student) || '').toString())
  );
  const eligibleStudents = students.filter(
    (s) => s && !currentEnrolledIdSet.has(s._id.toString())
  );

  const openEnrollModal = (courseIdToEnroll) => {
    const targetId = courseIdToEnroll || selectedCourseId || teacherCourses[0]?._id || '';
    setEnrollCourseId(targetId);
    setSelectedEnrollStudentIds([]);
    setEnrollError('');
    setEnrollSuccess('');
    setShowEnrollModal(true);
  };

  const toggleStudentEnrollSelection = (id) => {
    setSelectedEnrollStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllEnroll = () => {
    if (selectedEnrollStudentIds.length === eligibleStudents.length) {
      setSelectedEnrollStudentIds([]);
    } else {
      setSelectedEnrollStudentIds(eligibleStudents.map((s) => s._id));
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!enrollCourseId || selectedEnrollStudentIds.length === 0) return;

    setEnrollError('');
    setEnrollSuccess('');
    setIsEnrolling(true);

    const resultAction = await dispatch(
      enrollStudent({ courseId: enrollCourseId, studentIds: selectedEnrollStudentIds })
    );

    setIsEnrolling(false);

    if (enrollStudent.fulfilled.match(resultAction)) {
      setEnrollSuccess(`${selectedEnrollStudentIds.length} student(s) enrolled successfully!`);
      setSelectedEnrollStudentIds([]);
      // Refresh teacher courses and active roster
      dispatch(fetchTeacherCourses({ all: true }));
      if (selectedCourseId) {
        dispatch(fetchCourseRoster(selectedCourseId));
      }
      // Auto-close modal immediately upon success
      setShowEnrollModal(false);
    } else {
      const errorMsg = resultAction.payload || '';
      if (errorMsg.includes('403') || errorMsg.toLowerCase().includes('not assigned')) {
        setEnrollError('You can only enroll students into your own assigned courses.');
      } else {
        setEnrollError(errorMsg || 'Failed to enroll student(s)');
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
            <>
              {rosterLoading ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading course roster...
                </div>
              ) : currentRoster.length === 0 ? (
                /* STATE A: Exactly 0 enrolled students -> Show ONLY the Enroll Student action */
                <div
                  className="glass-card"
                  style={{
                    textAlign: 'center',
                    padding: '3.5rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      padding: '1.25rem',
                      borderRadius: '50%',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    <UserPlus size={36} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 700 }}>
                      {activeCourse.title}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0.5rem auto 0', fontSize: '0.95rem' }}>
                      There are no students enrolled in this course yet. Get started by enrolling your first student.
                    </p>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', fontSize: '1rem' }}
                    onClick={() => openEnrollModal(selectedCourseId)}
                  >
                    <UserPlus size={18} /> Enroll Student
                  </button>
                </div>
              ) : (
                /* STATE B: >= 1 enrolled students -> Show table, limit 6 pagination, and accessible Enroll Student button */
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-student" style={{ fontSize: '0.88rem', padding: '0.35rem 0.75rem' }}>
                        <Users size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                        {currentRoster.length} Students Enrolled
                      </span>
                      {selectedRosterIds.length > 0 && (
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{
                            color: '#ef4444',
                            borderColor: 'rgba(239, 68, 68, 0.4)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.85rem',
                          }}
                          onClick={openBulkUnenroll}
                        >
                          <UserMinus size={15} /> Unenroll Selected ({selectedRosterIds.length})
                        </button>
                      )}
                      <button
                        className="btn-primary"
                        onClick={() => openEnrollModal(selectedCourseId)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                      >
                        <UserPlus size={16} /> Enroll Student
                      </button>
                    </div>
                  </div>

                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={
                              paginatedRoster.length > 0 &&
                              paginatedRoster.every((entry) =>
                                selectedRosterIds.includes((entry.student?._id || entry.student)?.toString())
                              )
                            }
                            onChange={toggleSelectAllRoster}
                            title="Select all on this page"
                          />
                        </th>
                        <th>Student Name</th>
                        <th>Email Address</th>
                        <th>Enrolled By</th>
                        <th>Enrollment Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRoster.map((entry) => {
                        const sId = (entry.student?._id || entry.student)?.toString();
                        const isChecked = selectedRosterIds.includes(sId);
                        return (
                          <tr key={entry._id} style={{ background: isChecked ? 'rgba(99, 102, 241, 0.04)' : undefined }}>
                            <td style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleRosterSelection(sId)}
                              />
                            </td>
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
                            <td>
                              <button
                                className="icon-btn"
                                title="Unenroll Student"
                                style={{ color: '#ef4444' }}
                                onClick={() => openSingleUnenroll(entry)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    total={totalItems}
                    limit={6}
                    onPageChange={goToPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ENROLL STUDENT MODAL (MULTI-SELECT CHECKBOXES) */}
      {showEnrollModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>Enroll Student</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  setShowEnrollModal(false);
                  setEnrollError('');
                  setEnrollSuccess('');
                }}
                style={{ color: 'var(--text-muted)' }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Select student(s) via checkboxes to enroll into your assigned course.
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
                    onChange={(e) => {
                      setEnrollCourseId(e.target.value);
                      setSelectedEnrollStudentIds([]);
                    }}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Select Students ({selectedEnrollStudentIds.length} selected)
                  </label>
                  {eligibleStudents.length > 0 && (
                    <label style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={selectedEnrollStudentIds.length === eligibleStudents.length && eligibleStudents.length > 0}
                        onChange={toggleSelectAllEnroll}
                      />
                      Select All ({eligibleStudents.length})
                    </label>
                  )}
                </div>

                <div
                  style={{
                    maxHeight: '220px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    background: 'var(--bg-main)',
                  }}
                >
                  {eligibleStudents.length === 0 ? (
                    <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      All registered students are already enrolled in this course.
                    </div>
                  ) : (
                    eligibleStudents.map((s) => {
                      const isSelected = selectedEnrollStudentIds.includes(s._id);
                      return (
                        <label
                          key={s._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '6px',
                            background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                            cursor: 'pointer',
                            border: isSelected ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudentEnrollSelection(s._id)}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-main)' }}>{s.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
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
                  disabled={isEnrolling || selectedEnrollStudentIds.length === 0 || teacherCourses.length === 0}
                >
                  {isEnrolling
                    ? 'Enrolling...'
                    : `Enroll Selected (${selectedEnrollStudentIds.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNENROLL CONFIRMATION MODAL */}
      {unenrollTarget && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }}>
          <div className="glass-card modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ color: '#ef4444', margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                Confirm Unenrollment
              </h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setUnenrollTarget(null)}
                style={{ color: 'var(--text-muted)' }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>
              {unenrollTarget.studentIds.length === 1 ? (
                <>
                  Are you sure you want to unenroll <strong>{unenrollTarget.names[0]}</strong> from{' '}
                  <strong>{unenrollTarget.courseTitle}</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to unenroll{' '}
                  <strong>{unenrollTarget.studentIds.length} students</strong> from{' '}
                  <strong>{unenrollTarget.courseTitle}</strong>?
                </>
              )}
            </p>
            {unenrollTarget.studentIds.length > 1 && (
              <div
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  background: 'var(--bg-main)',
                }}
              >
                {unenrollTarget.names.map((name, i) => (
                  <div key={i} style={{ padding: '0.2rem 0' }}>• {name}</div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setUnenrollTarget(null)}
                disabled={isUnenrolling}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ background: '#dc2626' }}
                onClick={handleConfirmUnenroll}
                disabled={isUnenrolling}
              >
                {isUnenrolling
                  ? 'Unenrolling...'
                  : unenrollTarget.studentIds.length > 1
                  ? `Confirm Unenroll (${unenrollTarget.studentIds.length})`
                  : 'Confirm Unenroll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCoursesRoster;

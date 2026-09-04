import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  assignTeacher,
  enrollStudent,
  fetchCourseRoster,
  clearCurrentRoster,
} from '../features/courses/coursesSlice';
import { fetchTeachers } from '../features/teachers/teachersSlice';
import { fetchStudents } from '../features/students/studentsSlice';
import { Plus, Edit2, Trash2, UserPlus, UserCheck, BookOpen, Users, X, Calendar } from 'lucide-react';
import Pagination from './Pagination';

const CoursesAdmin = () => {
  const dispatch = useDispatch();
  const {
    courses,
    pagination,
    isLoading,
    isError,
    message,
    currentRoster,
    rosterLoading,
  } = useSelector((state) => state.courses);
  const { teachers } = useSelector((state) => state.teachers);
  const { students } = useSelector((state) => state.students);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [rosterCourse, setRosterCourse] = useState(null);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [enrollCourseId, setEnrollCourseId] = useState('');

  // Inline feedback states for enrollment
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchTeachers());
    dispatch(fetchStudents({ all: true }));
  }, [dispatch]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    dispatch(createCourse({ title, description, teacherId: teacherId || null }));
    setShowAddModal(false);
    setTitle('');
    setDescription('');
    setTeacherId('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (selectedCourse) {
      dispatch(
        updateCourse({
          id: selectedCourse._id,
          courseData: { title, description, teacherId: teacherId || null },
        })
      );
      setShowEditModal(false);
      setSelectedCourse(null);
    }
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (selectedCourse && teacherId) {
      dispatch(assignTeacher({ courseId: selectedCourse._id, teacherId }));
      setShowAssignModal(false);
      setSelectedCourse(null);
      setTeacherId('');
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    const targetCourseId = selectedCourse?._id || enrollCourseId;
    if (!targetCourseId || !studentId) return;

    setEnrollError('');
    setEnrollSuccess('');
    setIsEnrolling(true);

    const resultAction = await dispatch(
      enrollStudent({ courseId: targetCourseId, studentId })
    );

    setIsEnrolling(false);

    if (enrollStudent.fulfilled.match(resultAction)) {
      setEnrollSuccess('Student enrolled successfully!');
      setStudentId('');
      // If roster modal is currently open for this course, refresh its roster
      if (rosterCourse && rosterCourse._id === targetCourseId) {
        dispatch(fetchCourseRoster(targetCourseId));
      }
      setTimeout(() => {
        setShowEnrollModal(false);
        setEnrollSuccess('');
      }, 1000);
    } else {
      setEnrollError(resultAction.payload || 'Failed to enroll student');
    }
  };

  const openEdit = (course) => {
    setSelectedCourse(course);
    setTitle(course.title);
    setDescription(course.description);
    setTeacherId(course.teacherId?._id || '');
    setShowEditModal(true);
  };

  const openAssign = (course) => {
    setSelectedCourse(course);
    setTeacherId(course.teacherId?._id || '');
    setShowAssignModal(true);
  };

  const openEnrollForCourse = (course) => {
    setSelectedCourse(course);
    setEnrollCourseId(course._id);
    setStudentId('');
    setEnrollError('');
    setEnrollSuccess('');
    setShowEnrollModal(true);
  };

  const openGlobalEnroll = () => {
    setSelectedCourse(null);
    setEnrollCourseId(courses[0]?._id || '');
    setStudentId('');
    setEnrollError('');
    setEnrollSuccess('');
    setShowEnrollModal(true);
  };

  const openRoster = (course) => {
    setRosterCourse(course);
    dispatch(fetchCourseRoster(course._id));
    setShowRosterModal(true);
  };

  const closeRoster = () => {
    setShowRosterModal(false);
    setRosterCourse(null);
    dispatch(clearCurrentRoster());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Courses Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Create, manage, assign teachers, and enroll students into any course</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={openGlobalEnroll}>
            <UserCheck size={18} /> Enroll Student
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add New Course
          </button>
        </div>
      </div>

      {isError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px' }}>
          {message}
        </div>
      )}

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Description</th>
              <th>Assigned Teacher</th>
              <th>Course Roster</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No courses found. Click "Add New Course" to create one.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{course.title}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: '280px' }}>
                    {course.description}
                  </td>
                  <td>
                    {course.teacherId ? (
                      <span className="badge badge-teacher">{course.teacherId.name}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => openRoster(course)}
                      className="badge badge-student"
                      style={{
                        cursor: 'pointer',
                        border: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.65rem',
                      }}
                      title="Click to view course roster"
                    >
                      <Users size={13} />
                      {course.enrolledStudents?.length || 0} Enrolled
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="icon-btn" title="View Course Roster" onClick={() => openRoster(course)}>
                        <Users size={16} color="var(--primary)" />
                      </button>
                      <button className="icon-btn" title="Enroll Student" onClick={() => openEnrollForCourse(course)}>
                        <UserCheck size={16} color="var(--accent-primary)" />
                      </button>
                      <button className="icon-btn" title="Assign Teacher" onClick={() => openAssign(course)}>
                        <UserPlus size={16} color="var(--accent-orange)" />
                      </button>
                      <button className="icon-btn" title="Edit Course" onClick={() => openEdit(course)}>
                        <Edit2 size={16} color="#6366f1" />
                      </button>
                      <button className="icon-btn" title="Delete Course" onClick={() => dispatch(deleteCourse(course._id))}>
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination?.page || 1}
        totalPages={pagination?.totalPages || 1}
        total={pagination?.total || 0}
        limit={pagination?.limit || 10}
        onPageChange={(page) => dispatch(fetchCourses({ page, limit: 10 }))}
      />

      {/* CREATE COURSE MODAL */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Create New Course</h3>
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Introduction to Computer Science"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Enter course syllabus, objectives, and prerequisites..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div>
                <label className="form-label">Assign Teacher (Optional)</label>
                <select
                  className="form-input"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                >
                  <option value="">-- None --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Edit Course</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Introduction to Computer Science"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Enter course syllabus, objectives, and prerequisites..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div>
                <label className="form-label">Teacher</label>
                <select
                  className="form-input"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                >
                  <option value="">-- None --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TEACHER MODAL */}
      {showAssignModal && selectedCourse && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Assign Teacher</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Course: <strong>{selectedCourse.title}</strong>
            </p>
            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Select Teacher</label>
                <select
                  className="form-input"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  required
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Assign Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLL STUDENT MODAL (UNRESTRICTED FOR ADMIN) */}
      {showEnrollModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '480px' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Enroll Student</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Admin has full unrestricted access to enroll any student into any course.
            </p>

            {enrollError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '0.65rem 0.9rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1rem' }}>
                {enrollError}
              </div>
            )}

            {enrollSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#059669', padding: '0.65rem 0.9rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1rem' }}>
                {enrollSuccess}
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Course</label>
                {selectedCourse ? (
                  <div style={{ padding: '0.6rem 0.8rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 600 }}>
                    {selectedCourse.title}
                  </div>
                ) : (
                  <select
                    className="form-input"
                    value={enrollCourseId}
                    onChange={(e) => setEnrollCourseId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} {c.teacherId ? `(Teacher: ${c.teacherId.name})` : '(No teacher)'}
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
                    setSelectedCourse(null);
                    setEnrollError('');
                    setEnrollSuccess('');
                  }}
                  disabled={isEnrolling}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isEnrolling}>
                  {isEnrolling ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COURSE ROSTER MODAL */}
      {showRosterModal && rosterCourse && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '750px', width: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>Course Roster</h3>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {rosterCourse.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Assigned Teacher: {rosterCourse.teacherId ? rosterCourse.teacherId.name : 'Unassigned'}
                </div>
              </div>
              <button
                className="icon-btn"
                onClick={closeRoster}
                style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}
              >
                <X size={20} />
              </button>
            </div>

            {rosterLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Loading course roster...
              </div>
            ) : currentRoster.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg-main)', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No students enrolled in this course yet.</p>
                <button
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => openEnrollForCourse(rosterCourse)}
                >
                  <UserCheck size={16} /> Enroll First Student
                </button>
              </div>
            ) : (
              <div style={{ maxHeight: '420px', overflowY: 'auto', marginBottom: '1rem' }}>
                <table className="custom-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Enrolled By</th>
                      <th>Enrolled On</th>
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
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                          {entry.student?.email || 'N/A'}
                        </td>
                        <td>
                          {entry.enrolledByRole === 'admin' ? (
                            <span className="badge badge-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              Admin: {entry.enrolledBy?.name || 'Admin'}
                            </span>
                          ) : (
                            <span className="badge badge-teacher" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              Teacher: {entry.enrolledBy?.name || 'Assigned Teacher'}
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
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Total Enrolled: <strong>{currentRoster.length}</strong>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-secondary"
                  onClick={() => openEnrollForCourse(rosterCourse)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <UserCheck size={16} /> Enroll Student
                </button>
                <button className="btn-primary" onClick={closeRoster}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesAdmin;

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  assignTeacher,
  enrollStudent,
  unenrollStudent,
} from '../features/courses/coursesSlice';
import { fetchTeachers } from '../features/teachers/teachersSlice';
import { fetchStudents } from '../features/students/studentsSlice';
import { Plus, Edit2, Trash2, UserPlus, UserCheck, BookOpen, Users, X, Calendar, UserMinus, CheckSquare, Square } from 'lucide-react';
import Pagination from './Pagination';

const CoursesAdmin = () => {
  const dispatch = useDispatch();
  const {
    courses,
    allCourses,
    pagination,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.courses);
  const { teachers, allTeachers } = useSelector((state) => state.teachers);
  const { students, allStudents } = useSelector((state) => state.students);

  // Unpaginated full lists for dropdowns & selectors
  const teacherList = allTeachers && allTeachers.length > 0 ? allTeachers : teachers;
  const studentList = allStudents && allStudents.length > 0 ? allStudents : students;
  const courseList = allCourses && allCourses.length > 0 ? allCourses : courses;

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [enrollCourseId, setEnrollCourseId] = useState('');

  // Multi-select for enrollment & unenrollment
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedEnrolledIds, setSelectedEnrolledIds] = useState([]);

  // Inline feedback states
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [unenrollTarget, setUnenrollTarget] = useState(null);
  const [isUnenrolling, setIsUnenrolling] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses({ page: 1, limit: 6 }));
    dispatch(fetchCourses({ all: true }));
    dispatch(fetchTeachers({ all: true }));
    dispatch(fetchStudents({ all: true }));
  }, [dispatch]);

  const activeEnrollCourse = selectedCourse || courseList.find((c) => c._id === enrollCourseId) || courses.find((c) => c._id === enrollCourseId);
  const currentlyEnrolledIds = (activeEnrollCourse?.enrolledStudents || []).map((s) => (s._id || s).toString());
  const availableStudents = studentList.filter((s) => !currentlyEnrolledIds.includes(s._id.toString()));

  const handleConfirmUnenroll = async () => {
    if (!unenrollTarget || !unenrollTarget.studentIds?.length) return;
    setIsUnenrolling(true);
    setEnrollError('');
    setEnrollSuccess('');
    const res = await dispatch(
      unenrollStudent({ courseId: unenrollTarget.courseId, studentIds: unenrollTarget.studentIds })
    );
    setIsUnenrolling(false);
    if (!res.error) {
      if (selectedCourse) {
        setSelectedCourse((prev) => ({
          ...prev,
          enrolledStudents: (prev.enrolledStudents || []).filter(
            (s) => !unenrollTarget.studentIds.includes((s._id || s).toString())
          ),
        }));
      }
      setSelectedEnrolledIds([]);
      dispatch(fetchCourses({ page: pagination?.page || 1, limit: 6 }));
      dispatch(fetchCourses({ all: true }));
      setUnenrollTarget(null);
    } else {
      setEnrollError(res.payload || 'Failed to unenroll student(s)');
      setUnenrollTarget(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createCourse({ title, description, teacherId: teacherId || null }));
    if (!res.error) {
      dispatch(fetchCourses({ page: 1, limit: 6 }));
      dispatch(fetchCourses({ all: true }));
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setTeacherId('');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (selectedCourse) {
      const res = await dispatch(
        updateCourse({
          id: selectedCourse._id,
          courseData: { title, description, teacherId: teacherId || null },
        })
      );
      if (!res.error) {
        dispatch(fetchCourses({ page: pagination?.page || 1, limit: 6 }));
        dispatch(fetchCourses({ all: true }));
        setShowEditModal(false);
        setSelectedCourse(null);
      }
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (selectedCourse && teacherId) {
      const res = await dispatch(assignTeacher({ courseId: selectedCourse._id, teacherId }));
      if (!res.error) {
        dispatch(fetchCourses({ page: pagination?.page || 1, limit: 6 }));
        dispatch(fetchCourses({ all: true }));
        setShowAssignModal(false);
        setSelectedCourse(null);
        setTeacherId('');
      }
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    const targetCourseId = selectedCourse?._id || enrollCourseId;
    if (!targetCourseId || selectedStudentIds.length === 0) return;

    setEnrollError('');
    setEnrollSuccess('');
    setIsEnrolling(true);

    const resultAction = await dispatch(
      enrollStudent({ courseId: targetCourseId, studentIds: selectedStudentIds })
    );

    setIsEnrolling(false);

    if (enrollStudent.fulfilled.match(resultAction)) {
      setSelectedStudentIds([]);
      setSelectedEnrolledIds([]);
      setShowEnrollModal(false);
      dispatch(fetchCourses({ page: pagination?.page || 1, limit: 6 }));
      dispatch(fetchCourses({ all: true }));
    } else {
      setEnrollError(resultAction.payload || 'Failed to enroll students');
    }
  };

  const toggleSelectAllAvailable = () => {
    if (selectedStudentIds.length === availableStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(availableStudents.map((s) => s._id));
    }
  };

  const toggleSelectStudent = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((sId) => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const toggleSelectAllEnrolled = (enrolledStudents) => {
    const allIds = enrolledStudents.map((s) => (s._id || s).toString());
    if (selectedEnrolledIds.length === allIds.length) {
      setSelectedEnrolledIds([]);
    } else {
      setSelectedEnrolledIds(allIds);
    }
  };

  const toggleSelectEnrolled = (id) => {
    const strId = id.toString();
    if (selectedEnrolledIds.includes(strId)) {
      setSelectedEnrolledIds(selectedEnrolledIds.filter((sId) => sId !== strId));
    } else {
      setSelectedEnrolledIds([...selectedEnrolledIds, strId]);
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
    setSelectedStudentIds([]);
    setSelectedEnrolledIds([]);
    setEnrollError('');
    setEnrollSuccess('');
    setShowEnrollModal(true);
  };

  const openGlobalEnroll = () => {
    setSelectedCourse(null);
    setEnrollCourseId(courseList[0]?._id || courses[0]?._id || '');
    setSelectedStudentIds([]);
    setSelectedEnrolledIds([]);
    setEnrollError('');
    setEnrollSuccess('');
    setShowEnrollModal(true);
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
              <th>Enrolled Students</th>
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
                    <span
                      className="badge badge-student"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.65rem',
                      }}
                    >
                      <Users size={13} />
                      {course.enrolledStudents?.length || 0} Enrolled
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="icon-btn" title="Enroll Student" onClick={() => openEnrollForCourse(course)}>
                        <UserCheck size={16} color="var(--accent-primary)" />
                      </button>
                      <button className="icon-btn" title="Assign Teacher" onClick={() => openAssign(course)}>
                        <UserPlus size={16} color="var(--accent-orange)" />
                      </button>
                      <button className="icon-btn" title="Edit Course" onClick={() => openEdit(course)}>
                        <Edit2 size={16} color="#6366f1" />
                      </button>
                      <button
                        className="icon-btn"
                        title="Delete Course"
                        onClick={async () => {
                          await dispatch(deleteCourse(course._id));
                          dispatch(fetchCourses({ page: pagination?.page || 1, limit: 6 }));
                          dispatch(fetchCourses({ all: true }));
                        }}
                      >
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
        limit={6}
        onPageChange={(page) => dispatch(fetchCourses({ page, limit: 6 }))}
      />

      {/* CREATE COURSE MODAL */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '520px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>Create New Course</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
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
                  {teacherList.map((t) => (
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
          <div className="glass-card modal-content" style={{ maxWidth: '520px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>Edit Course</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
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
                  {teacherList.map((t) => (
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
          <div className="glass-card modal-content" style={{ maxWidth: '480px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>Assign Teacher</h3>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
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
                  {teacherList.map((t) => (
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

      {/* ENROLL STUDENT MODAL (MULTI-SELECT CHECKBOXES) */}
      {showEnrollModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '540px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>Enroll Student</h3>
              <button
                type="button"
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedCourse(null);
                  setSelectedStudentIds([]);
                  setSelectedEnrolledIds([]);
                  setEnrollError('');
                  setEnrollSuccess('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Admin has full unrestricted access to enroll students into any course.
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
                <label className="form-label">Target Course</label>
                {selectedCourse ? (
                  <div style={{ padding: '0.6rem 0.8rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 600 }}>
                    {selectedCourse.title}
                  </div>
                ) : (
                  <select
                    className="form-input"
                    value={enrollCourseId}
                    onChange={(e) => {
                      setEnrollCourseId(e.target.value);
                      setSelectedStudentIds([]);
                      setSelectedEnrolledIds([]);
                    }}
                    required
                  >
                    <option value="">-- Select Course --</option>
                    {courseList.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} {c.teacherId ? `(Teacher: ${c.teacherId.name})` : '(No teacher)'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Select Students ({selectedStudentIds.length} selected)
                  </label>
                  {availableStudents.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleSelectAllAvailable}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {selectedStudentIds.length === availableStudents.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>

                <div
                  style={{
                    maxHeight: '220px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    background: 'var(--bg-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  {availableStudents.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      All registered students are already enrolled in this course.
                    </div>
                  ) : (
                    availableStudents.map((s) => {
                      const isChecked = selectedStudentIds.includes(s._id);
                      return (
                        <label
                          key={s._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem 0.65rem',
                            borderRadius: '6px',
                            background: isChecked ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectStudent(s._id)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>{s.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowEnrollModal(false);
                    setSelectedCourse(null);
                    setSelectedStudentIds([]);
                    setSelectedEnrolledIds([]);
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
                  disabled={isEnrolling || selectedStudentIds.length === 0}
                >
                  {isEnrolling ? 'Enrolling...' : `Enroll Selected (${selectedStudentIds.length})`}
                </button>
              </div>
            </form>

            {/* Currently Enrolled Students in this Course with Multi-Select Bulk Unenroll */}
            {activeEnrollCourse && activeEnrollCourse.enrolledStudents && activeEnrollCourse.enrolledStudents.length > 0 && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                    Currently Enrolled Students ({activeEnrollCourse.enrolledStudents.length})
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => toggleSelectAllEnrolled(activeEnrollCourse.enrolledStudents)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {selectedEnrolledIds.length === activeEnrollCourse.enrolledStudents.length ? 'Deselect All' : 'Select All'}
                    </button>
                    {selectedEnrolledIds.length > 0 && (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{
                          color: '#ef4444',
                          borderColor: 'rgba(239, 68, 68, 0.4)',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                        onClick={() => {
                          const names = selectedEnrolledIds.map((id) => {
                            const found = activeEnrollCourse.enrolledStudents.find((s) => (s._id || s).toString() === id);
                            return typeof found === 'object' && found.name ? found.name : 'Student';
                          });
                          setUnenrollTarget({
                            courseId: activeEnrollCourse._id,
                            courseTitle: activeEnrollCourse.title,
                            studentIds: selectedEnrolledIds,
                            studentNames: names.join(', '),
                          });
                        }}
                      >
                        <UserMinus size={13} /> Unenroll Selected ({selectedEnrolledIds.length})
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {activeEnrollCourse.enrolledStudents.map((s) => {
                    const studentObj = typeof s === 'object' ? s : studentList.find((st) => st._id === s) || { _id: s, name: 'Student', email: '' };
                    const isChecked = selectedEnrolledIds.includes(studentObj._id.toString());
                    return (
                      <div
                        key={studentObj._id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.45rem 0.65rem',
                          background: isChecked ? 'rgba(239, 68, 68, 0.06)' : 'var(--bg-main)',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flex: 1, minWidth: 0 }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectEnrolled(studentObj._id)}
                            style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#ef4444' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{studentObj.name}</div>
                            {studentObj.email && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{studentObj.email}</div>}
                          </div>
                        </label>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{
                            color: '#ef4444',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            padding: '0.2rem 0.45rem',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                          onClick={() =>
                            setUnenrollTarget({
                              studentIds: [studentObj._id],
                              studentNames: studentObj.name,
                              courseId: activeEnrollCourse._id,
                              courseTitle: activeEnrollCourse.title,
                            })
                          }
                        >
                          <UserMinus size={12} /> Unenroll
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UNENROLL CONFIRMATION MODAL */}
      {unenrollTarget && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }}>
          <div className="glass-card modal-content" style={{ maxWidth: '440px', width: '90%', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
              <button
                type="button"
                onClick={() => setUnenrollTarget(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <h3 style={{ color: '#ef4444', marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: 700 }}>
              Confirm Unenrollment
            </h3>
            <p style={{ color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Are you sure you want to unenroll <strong>{unenrollTarget.studentNames}</strong> from{' '}
              <strong>{unenrollTarget.courseTitle}</strong>?
            </p>
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
                {isUnenrolling ? 'Unenrolling...' : 'Confirm Unenroll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesAdmin;

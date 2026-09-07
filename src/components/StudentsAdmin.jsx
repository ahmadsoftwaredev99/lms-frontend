import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../features/students/studentsSlice';
import { fetchCourses, enrollStudent, unenrollStudent } from '../features/courses/coursesSlice';
import { Plus, Edit2, Trash2, Mail, Phone, BookPlus, UserMinus, X } from 'lucide-react';
import Pagination from './Pagination';
import StudentRegistrationForm from './StudentRegistrationForm';

const StudentsAdmin = () => {
  const dispatch = useDispatch();
  const { students, pagination, isLoading, isError, message } = useSelector((state) => state.students);
  const { courses, allCourses } = useSelector((state) => state.courses);

  const courseList = allCourses && allCourses.length > 0 ? allCourses : courses;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [selectedEnrolledCourseIds, setSelectedEnrolledCourseIds] = useState([]);

  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [unenrollCourseTarget, setUnenrollCourseTarget] = useState(null);
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    dispatch(fetchStudents({ page: 1, limit: 6 }));
    dispatch(fetchCourses({ all: true }));
  }, [dispatch]);

  const enrolledCourseList = selectedStudent
    ? courseList.filter((c) =>
        c.enrolledStudents?.some(
          (s) => (s._id || s).toString() === selectedStudent._id.toString()
        )
      )
    : [];

  const availableCourses = selectedStudent
    ? courseList.filter(
        (c) =>
          !c.enrolledStudents?.some(
            (s) => (s._id || s).toString() === selectedStudent._id.toString()
          )
      )
    : [];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (selectedStudent) {
      const res = await dispatch(
        updateStudent({
          id: selectedStudent._id,
          studentData: {
            name: formData.name,
            email: formData.email,
            profile: { phone: formData.phone, bio: formData.bio },
          },
        })
      );
      if (!res.error) {
        setShowEditModal(false);
        setSelectedStudent(null);
        dispatch(fetchStudents({ page: pagination?.page || 1, limit: 6 }));
      }
    }
  };

  const handleConfirmUnenroll = async () => {
    if (!unenrollCourseTarget || !selectedStudent) return;
    setIsUnenrolling(true);
    setEnrollError('');
    setEnrollSuccess('');
    try {
      const results = await Promise.all(
        unenrollCourseTarget.courseIds.map((cId) =>
          dispatch(unenrollStudent({ courseId: cId, studentIds: [selectedStudent._id] }))
        )
      );
      setIsUnenrolling(false);
      const failed = results.find((r) => r.error);
      if (failed) {
        setEnrollError(failed.payload || 'Failed to unenroll student');
      } else {
        setSelectedEnrolledCourseIds([]);
        setUnenrollCourseTarget(null);
        dispatch(fetchCourses({ all: true }));
      }
    } catch (err) {
      setIsUnenrolling(false);
      setEnrollError(err.message || 'Failed to unenroll student');
      setUnenrollCourseTarget(null);
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || selectedCourseIds.length === 0) return;
    setEnrollError('');
    setEnrollSuccess('');
    setIsEnrolling(true);

    try {
      const results = await Promise.all(
        selectedCourseIds.map((cId) =>
          dispatch(enrollStudent({ courseId: cId, studentIds: [selectedStudent._id] }))
        )
      );
      setIsEnrolling(false);
      const failed = results.find((r) => r.error);
      if (failed) {
        setEnrollError(failed.payload || 'Failed to enroll student in selected courses');
      } else {
        setSelectedCourseIds([]);
        setShowEnrollModal(false);
        dispatch(fetchCourses({ all: true }));
      }
    } catch (err) {
      setIsEnrolling(false);
      setEnrollError(err.message || 'Error enrolling student');
    }
  };

  const toggleSelectAllAvailableCourses = () => {
    if (selectedCourseIds.length === availableCourses.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(availableCourses.map((c) => c._id));
    }
  };

  const toggleSelectCourse = (id) => {
    if (selectedCourseIds.includes(id)) {
      setSelectedCourseIds(selectedCourseIds.filter((cId) => cId !== id));
    } else {
      setSelectedCourseIds([...selectedCourseIds, id]);
    }
  };

  const toggleSelectAllEnrolledCourses = () => {
    if (selectedEnrolledCourseIds.length === enrolledCourseList.length) {
      setSelectedEnrolledCourseIds([]);
    } else {
      setSelectedEnrolledCourseIds(enrolledCourseList.map((c) => c._id));
    }
  };

  const toggleSelectEnrolledCourse = (id) => {
    if (selectedEnrolledCourseIds.includes(id)) {
      setSelectedEnrolledCourseIds(selectedEnrolledCourseIds.filter((cId) => cId !== id));
    } else {
      setSelectedEnrolledCourseIds([...selectedEnrolledCourseIds, id]);
    }
  };

  const openEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.profile?.phone || '',
      bio: student.profile?.bio || '',
    });
    setShowEditModal(true);
  };

  const openEnroll = (student) => {
    setSelectedStudent(student);
    setSelectedCourseIds([]);
    setSelectedEnrolledCourseIds([]);
    setEnrollError('');
    setEnrollSuccess('');
    setShowEnrollModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Students Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Add, update, and manage student accounts and enrollments</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Student
        </button>
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
              <th>Student Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Bio</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No students registered yet.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{student.name}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)' }}>
                      <Mail size={14} /> {student.email}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {student.profile?.phone ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={14} /> {student.profile.phone}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: '240px' }}>
                    {student.profile?.bio || 'No bio provided'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="icon-btn" title="Enroll in Course" onClick={() => openEnroll(student)}>
                        <BookPlus size={16} color="var(--accent-primary)" />
                      </button>
                      <button className="icon-btn" title="Edit Student" onClick={() => openEdit(student)}>
                        <Edit2 size={16} color="#6366f1" />
                      </button>
                      <button
                        className="icon-btn"
                        title="Delete Student"
                        onClick={async () => {
                          await dispatch(deleteStudent(student._id));
                          dispatch(fetchStudents({ page: pagination?.page || 1, limit: 6 }));
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
        limit={pagination?.limit || 6}
        onPageChange={(page) => dispatch(fetchStudents({ page, limit: 6 }))}
      />

      {/* CREATE STUDENT MODAL */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '520px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Create Student Account</h3>
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
            <StudentRegistrationForm
              mode="admin"
              onSubmit={async (studentData) => {
                const res = await dispatch(createStudent(studentData));
                if (!res.error) {
                  setShowAddModal(false);
                  dispatch(fetchStudents({ page: 1, limit: 6 }));
                }
              }}
              isLoading={isLoading}
              isError={isError}
              errorMessage={message}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {showEditModal && selectedStudent && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '520px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>Edit Student Account</h3>
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
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">Biography / Notes</label>
                <textarea
                  name="bio"
                  className="form-input"
                  rows="2"
                  placeholder="Enter student biography / notes..."
                  value={formData.bio}
                  onChange={handleChange}
                ></textarea>
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

      {/* ENROLL STUDENT IN COURSE MODAL (MULTI-SELECT CHECKBOXES) */}
      {showEnrollModal && selectedStudent && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '540px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>Enroll Student in Courses</h3>
              <button
                type="button"
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedCourseIds([]);
                  setSelectedEnrolledCourseIds([]);
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
              Student: <strong>{selectedStudent.name}</strong> ({selectedStudent.email})
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Select Available Courses ({selectedCourseIds.length} selected)
                  </label>
                  {availableCourses.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleSelectAllAvailableCourses}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {selectedCourseIds.length === availableCourses.length ? 'Deselect All' : 'Select All'}
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
                  {availableCourses.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Student is already enrolled in all available courses.
                    </div>
                  ) : (
                    availableCourses.map((c) => {
                      const isChecked = selectedCourseIds.includes(c._id);
                      return (
                        <label
                          key={c._id}
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
                            onChange={() => toggleSelectCourse(c._id)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>{c.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {c.teacherId ? `Teacher: ${c.teacherId.name}` : 'No teacher assigned'}
                            </div>
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
                    setSelectedCourseIds([]);
                    setSelectedEnrolledCourseIds([]);
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
                  disabled={isEnrolling || selectedCourseIds.length === 0}
                >
                  {isEnrolling ? 'Enrolling...' : `Enroll in Selected (${selectedCourseIds.length})`}
                </button>
              </div>
            </form>

            {/* Currently Enrolled Courses for this Student with Bulk Unenroll */}
            {enrolledCourseList.length > 0 && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                    Currently Enrolled Courses ({enrolledCourseList.length})
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={toggleSelectAllEnrolledCourses}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {selectedEnrolledCourseIds.length === enrolledCourseList.length ? 'Deselect All' : 'Select All'}
                    </button>
                    {selectedEnrolledCourseIds.length > 0 && (
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
                          const titles = selectedEnrolledCourseIds.map((id) => {
                            const found = enrolledCourseList.find((c) => c._id === id);
                            return found ? found.title : 'Course';
                          });
                          setUnenrollCourseTarget({
                            courseIds: selectedEnrolledCourseIds,
                            courseTitles: titles.join(', '),
                          });
                        }}
                      >
                        <UserMinus size={13} /> Unenroll Selected ({selectedEnrolledCourseIds.length})
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {enrolledCourseList.map((c) => {
                    const isChecked = selectedEnrolledCourseIds.includes(c._id);
                    return (
                      <div
                        key={c._id}
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
                            onChange={() => toggleSelectEnrolledCourse(c._id)}
                            style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#ef4444' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.title}</div>
                            {c.teacherId && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Teacher: {c.teacherId.name}
                              </div>
                            )}
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
                            setUnenrollCourseTarget({
                              courseIds: [c._id],
                              courseTitles: c.title,
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
      {unenrollCourseTarget && selectedStudent && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }}>
          <div className="glass-card modal-content" style={{ maxWidth: '440px', width: '90%', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
              <button
                type="button"
                onClick={() => setUnenrollCourseTarget(null)}
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
              Are you sure you want to unenroll <strong>{selectedStudent.name}</strong> from{' '}
              <strong>{unenrollCourseTarget.courseTitles}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setUnenrollCourseTarget(null)}
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

export default StudentsAdmin;

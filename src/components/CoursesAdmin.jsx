import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  assignTeacher,
  enrollStudent,
} from '../features/courses/coursesSlice';
import { fetchTeachers } from '../features/teachers/teachersSlice';
import { fetchStudents } from '../features/students/studentsSlice';
import { Plus, Edit2, Trash2, UserPlus, UserCheck, BookOpen } from 'lucide-react';
import Pagination from './Pagination';

const CoursesAdmin = () => {
  const dispatch = useDispatch();
  const { courses, pagination, isLoading, isError, message } = useSelector((state) => state.courses);
  const { teachers } = useSelector((state) => state.teachers);
  const { students } = useSelector((state) => state.students);

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
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchTeachers());
    dispatch(fetchStudents());
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

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    if (selectedCourse && studentId) {
      dispatch(enrollStudent({ courseId: selectedCourse._id, studentId }));
      setShowEnrollModal(false);
      setSelectedCourse(null);
      setStudentId('');
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

  const openEnroll = (course) => {
    setSelectedCourse(course);
    setStudentId('');
    setShowEnrollModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Courses Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Create, manage, assign teachers, and enroll students</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add New Course
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
                    <span className="badge badge-student">
                      {course.enrolledStudents?.length || 0} Students
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="icon-btn" title="Assign Teacher" onClick={() => openAssign(course)}>
                        <UserPlus size={16} color="var(--accent-orange)" />
                      </button>
                      <button className="icon-btn" title="Enroll Student" onClick={() => openEnroll(course)}>
                        <UserCheck size={16} color="var(--accent-primary)" />
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

      {/* ENROLL STUDENT MODAL */}
      {showEnrollModal && selectedCourse && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Enroll Student</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Course: <strong>{selectedCourse.title}</strong>
            </p>
            <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <button type="button" className="btn-secondary" onClick={() => setShowEnrollModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesAdmin;

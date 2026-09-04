import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../features/students/studentsSlice';
import { fetchCourses, enrollStudent } from '../features/courses/coursesSlice';
import { Plus, Edit2, Trash2, Mail, Phone, BookPlus } from 'lucide-react';
import Pagination from './Pagination';
import StudentRegistrationForm from './StudentRegistrationForm';

const StudentsAdmin = () => {
  const dispatch = useDispatch();
  const { students, pagination, isLoading, isError, message } = useSelector((state) => state.students);
  const { courses } = useSelector((state) => state.courses);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (selectedStudent) {
      dispatch(
        updateStudent({
          id: selectedStudent._id,
          studentData: {
            name: formData.name,
            email: formData.email,
            profile: { phone: formData.phone, bio: formData.bio },
          },
        })
      );
      setShowEditModal(false);
      setSelectedStudent(null);
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (selectedStudent && selectedCourseId) {
      setEnrollError('');
      setEnrollSuccess('');
      const res = await dispatch(
        enrollStudent({ courseId: selectedCourseId, studentId: selectedStudent._id })
      );
      if (enrollStudent.fulfilled.match(res)) {
        setEnrollSuccess('Student enrolled successfully!');
        setTimeout(() => {
          setShowEnrollModal(false);
          setSelectedStudent(null);
          setSelectedCourseId('');
          setEnrollSuccess('');
        }, 1000);
      } else {
        setEnrollError(res.payload || 'Failed to enroll student');
      }
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
    setSelectedCourseId('');
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
                      <button className="icon-btn" title="Delete Student" onClick={() => dispatch(deleteStudent(student._id))}>
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
        onPageChange={(page) => dispatch(fetchStudents({ page, limit: 10 }))}
      />

      {/* CREATE STUDENT MODAL (REUSES SHARED STUDENT REGISTRATION FORM) */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '520px', width: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Create Student Account</h3>
            <StudentRegistrationForm
              mode="admin"
              onSubmit={(studentData) => {
                dispatch(createStudent(studentData));
                setShowAddModal(false);
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
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Edit Student Account</h3>
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

      {/* ENROLL STUDENT IN COURSE MODAL */}
      {showEnrollModal && selectedStudent && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Enroll Student in Course</h3>
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
                <label className="form-label">Select Target Course</label>
                <select
                  className="form-input"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  required
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
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

export default StudentsAdmin;

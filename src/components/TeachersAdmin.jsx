import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../features/teachers/teachersSlice';
import { Plus, Edit2, Trash2, Mail, Phone, X } from 'lucide-react';
import Pagination from './Pagination';
import TeacherRegistrationForm from './TeacherRegistrationForm';

const TeachersAdmin = () => {
  const dispatch = useDispatch();
  const { teachers, pagination, isLoading, isError, message } = useSelector((state) => state.teachers);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    dispatch(fetchTeachers({ page: 1, limit: 6 }));
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (selectedTeacher) {
      const res = await dispatch(
        updateTeacher({
          id: selectedTeacher._id,
          teacherData: {
            name: formData.name,
            email: formData.email,
            profile: { phone: formData.phone, bio: formData.bio },
          },
        })
      );
      if (!res.error) {
        setShowEditModal(false);
        setSelectedTeacher(null);
        dispatch(fetchTeachers({ page: pagination?.page || 1, limit: 6 }));
      }
    }
  };

  const openEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.profile?.phone || '',
      bio: teacher.profile?.bio || '',
    });
    setShowEditModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Teachers Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Add, update, and manage teacher user accounts</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Teacher
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
              <th>Teacher Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Bio</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No teachers registered yet.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{teacher.name}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)' }}>
                      <Mail size={14} /> {teacher.email}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {teacher.profile?.phone ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={14} /> {teacher.profile.phone}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: '240px' }}>
                    {teacher.profile?.bio || 'No bio provided'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="icon-btn" title="Edit Teacher" onClick={() => openEdit(teacher)}>
                        <Edit2 size={16} color="#6366f1" />
                      </button>
                      <button className="icon-btn" title="Delete Teacher" onClick={async () => {
                        await dispatch(deleteTeacher(teacher._id));
                        dispatch(fetchTeachers({ page: pagination?.page || 1, limit: 6 }));
                      }}>
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
        onPageChange={(page) => dispatch(fetchTeachers({ page, limit: 6 }))}
      />

      {/* CREATE TEACHER MODAL (REUSES SHARED TEACHER REGISTRATION FORM) */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '520px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Create Teacher Account</h3>
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
            <TeacherRegistrationForm
              mode="admin"
              onSubmit={async (teacherData) => {
                const res = await dispatch(createTeacher(teacherData));
                if (!res.error) {
                  setShowAddModal(false);
                  dispatch(fetchTeachers({ page: 1, limit: 6 }));
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

      {/* EDIT TEACHER MODAL */}
      {showEditModal && selectedTeacher && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '520px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>Edit Teacher Account</h3>
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
                <label className="form-label">Teaching Department / Bio</label>
                <textarea
                  name="bio"
                  className="form-input"
                  rows="2"
                  placeholder="Enter teaching department or bio..."
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
    </div>
  );
};

export default TeachersAdmin;

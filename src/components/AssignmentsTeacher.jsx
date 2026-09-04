import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTeacherAssignments,
  createAssignment,
  fetchSubmissions,
  approveReopenRequest,
  clearSubmissions,
} from '../features/assignments/assignmentsSlice';
import { fetchTeacherCourses } from '../features/attendance/attendanceSlice';
import { Plus, FileText, Eye, Clock, Download, Unlock } from 'lucide-react';
import Pagination from './Pagination';

const AssignmentsTeacher = () => {
  const dispatch = useDispatch();
  const { assignments, submissions, pagination, submissionsPagination, isLoading, isError, message } = useSelector(
    (state) => state.assignments
  );
  const { teacherCourses } = useSelector((state) => state.attendance);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    type: 'assignment',
    dueDate: '',
    materialFile: '',
  });

  useEffect(() => {
    dispatch(fetchTeacherAssignments());
    dispatch(fetchTeacherCourses());
  }, [dispatch]);

  useEffect(() => {
    if (teacherCourses.length > 0 && !formData.courseId) {
      setFormData((prev) => ({ ...prev, courseId: teacherCourses[0]._id }));
    }
  }, [teacherCourses]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    dispatch(
      createAssignment({
        courseId: formData.courseId,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        dueDate: formData.dueDate,
        materialFiles: formData.materialFile ? [formData.materialFile] : [],
      })
    );
    setShowAddModal(false);
    setFormData({
      courseId: teacherCourses[0]?._id || '',
      title: '',
      description: '',
      type: 'assignment',
      dueDate: '',
      materialFile: '',
    });
  };

  const openSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    dispatch(fetchSubmissions(assignment._id));
    setShowSubmissionsModal(true);
  };

  const handleApproveReopen = (submissionId) => {
    dispatch(approveReopenRequest(submissionId));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Assignments & Quizzes</h2>
          <p style={{ color: 'var(--text-muted)' }}>Publish coursework, evaluate student uploads, and approve reopen requests</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Create Assignment / Quiz
        </button>
      </div>

      {isError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px' }}>
          {message}
        </div>
      )}

      {/* ASSIGNMENTS LIST GRID */}
      <div className="grid-cols-3">
        {assignments.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2.5rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No assignments or quizzes created yet. Click "Create Assignment / Quiz" to add one.</p>
          </div>
        ) : (
          assignments.map((asgn) => {
            const isQuiz = asgn.type === 'quiz';
            const isPastDue = new Date() > new Date(asgn.dueDate);
            return (
              <div key={asgn._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span className={`badge ${isQuiz ? 'badge-teacher' : 'badge-student'}`}>
                      {asgn.type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: isPastDue ? 'var(--danger)' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <Clock size={12} /> {new Date(asgn.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    {asgn.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', minHeight: '40px' }}>
                    {asgn.description}
                  </p>

                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '1rem', fontWeight: 600 }}>
                    Course: <strong>{asgn.courseId?.title || 'N/A'}</strong>
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => openSubmissions(asgn)}
                >
                  <Eye size={16} /> View Submissions
                </button>
              </div>
            );
          })
        )}
      </div>

      <Pagination
        currentPage={pagination?.page || 1}
        totalPages={pagination?.totalPages || 1}
        total={pagination?.total || 0}
        limit={pagination?.limit || 10}
        onPageChange={(page) => dispatch(fetchTeacherAssignments({ page, limit: 10 }))}
      />

      {/* CREATE ASSIGNMENT / QUIZ MODAL */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Create Assignment or Quiz</h3>
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Course</label>
                <select
                  name="courseId"
                  className="form-input"
                  value={formData.courseId}
                  onChange={handleChange}
                  required
                >
                  {teacherCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="e.g. Midterm Project - Database Architecture"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Type</label>
                <select
                  name="type"
                  className="form-input"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="assignment">Assignment</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>

              <div>
                <label className="form-label">Due Date & Time</label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Description / Instructions</label>
                <textarea
                  name="description"
                  className="form-input"
                  rows="3"
                  placeholder="Provide assignment guidelines, rubric, or quiz requirements..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div>
                <label className="form-label">Material File URL (Optional)</label>
                <input
                  type="text"
                  name="materialFile"
                  className="form-input"
                  placeholder="https://example.com/question-sheet.pdf or /uploads/sheet.pdf"
                  value={formData.materialFile}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMISSIONS MODAL */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '750px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ color: 'var(--accent-primary)' }}>Submissions for {selectedAssignment.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Due Date: {new Date(selectedAssignment.dueDate).toLocaleString()}
                </p>
              </div>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowSubmissionsModal(false);
                  dispatch(clearSubmissions());
                }}
              >
                Close
              </button>
            </div>

            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>File Link</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Reopen Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No student submissions received yet for this task.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{sub.studentId?.name || 'Student'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.studentId?.email}</div>
                      </td>
                      <td>
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}
                        >
                          <Download size={14} /> Download File
                        </a>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            sub.status === 'reopened'
                              ? 'badge-teacher'
                              : sub.status === 'locked'
                              ? 'badge-admin'
                              : 'badge-student'
                          }`}
                        >
                          {sub.status}
                        </span>
                        {sub.reopenRequested && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--accent-orange)', marginTop: '0.2rem', fontWeight: 600 }}>
                            Reopen Requested!
                          </div>
                        )}
                      </td>
                      <td>
                        {sub.status === 'reopened' ? (
                          <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                            <Unlock size={14} /> Reopened for student
                          </span>
                        ) : (
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => handleApproveReopen(sub._id)}
                          >
                            <Unlock size={12} /> Approve Reopen
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <Pagination
              currentPage={submissionsPagination?.page || 1}
              totalPages={submissionsPagination?.totalPages || 1}
              total={submissionsPagination?.total || 0}
              limit={submissionsPagination?.limit || 10}
              onPageChange={(page) =>
                dispatch(fetchSubmissions({ assignmentId: selectedAssignment._id, page, limit: 10 }))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsTeacher;

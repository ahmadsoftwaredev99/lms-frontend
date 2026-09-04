import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchStudentAssignments,
  uploadSubmission,
  editSubmission,
  requestReopenSubmission,
  downloadSubmission,
  resetStudentAssignmentsState,
} from '../features/assignments/studentAssignmentsSlice';
import {
  FileText,
  Clock,
  Lock,
  Unlock,
  Upload,
  Download,
  Edit,
  Send,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import Pagination from './Pagination';

const StudentAssignments = () => {
  const dispatch = useDispatch();
  const { assignments, pagination, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.studentAssignments
  );

  const [selectedType, setSelectedType] = useState('all'); // all, assignment, quiz
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [fileInput, setFileInput] = useState(null);
  const [fileUrlInput, setFileUrlInput] = useState('');
  const [reopenFeedback, setReopenFeedback] = useState({});

  useEffect(() => {
    dispatch(fetchStudentAssignments({ page: 1, limit: 10 }));
  }, [dispatch]);

  const filteredAssignments = (assignments || []).filter((item) => {
    if (selectedType === 'all') return true;
    return item.type === selectedType;
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileInput(e.target.files[0]);
    }
  };

  const handleOpenSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setFileInput(null);
    setFileUrlInput(assignment.submission?.fileUrl || '');
    dispatch(resetStudentAssignmentsState());
  };

  const handleSubmitOrEdit = (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    const submission = selectedAssignment.submission;
    const isEdit = !!submission?._id;

    if (fileInput) {
      const formData = new FormData();
      formData.append('assignmentId', selectedAssignment._id);
      formData.append('file', fileInput);

      if (isEdit) {
        dispatch(editSubmission({ submissionId: submission._id, formData }));
      } else {
        dispatch(uploadSubmission(formData));
      }
    } else if (fileUrlInput) {
      const payload = {
        assignmentId: selectedAssignment._id,
        fileUrl: fileUrlInput,
      };

      if (isEdit) {
        dispatch(editSubmission({ submissionId: submission._id, formData: payload }));
      } else {
        dispatch(uploadSubmission(payload));
      }
    }
  };

  const handleRequestReopen = (assignment) => {
    const submissionId = assignment.submission?._id;
    const assignmentId = assignment._id;

    dispatch(requestReopenSubmission({ submissionId, assignmentId }))
      .unwrap()
      .then((res) => {
        setReopenFeedback((prev) => ({
          ...prev,
          [assignmentId]: 'Reopen request submitted to teacher successfully!',
        }));
      })
      .catch((err) => {
        setReopenFeedback((prev) => ({
          ...prev,
          [assignmentId]: err || 'Failed to submit reopen request',
        }));
      });
  };

  const handleDownload = (submissionId) => {
    if (submissionId) {
      dispatch(downloadSubmission(submissionId));
    }
  };

  useEffect(() => {
    if (isSuccess && selectedAssignment) {
      setSelectedAssignment(null);
      setFileInput(null);
      setFileUrlInput('');
    }
  }, [isSuccess]);

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--accent-primary)' }}>Assignments & Quizzes</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Submit coursework, track due dates, view status, or request reopens
          </p>
        </div>

        {/* TYPE FILTER PILLS */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#F1F5F9', padding: '0.3rem', borderRadius: '10px' }}>
          <button
            className={`btn-secondary ${selectedType === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setSelectedType('all')}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
          >
            All Work
          </button>
          <button
            className={`btn-secondary ${selectedType === 'assignment' ? 'btn-primary' : ''}`}
            onClick={() => setSelectedType('assignment')}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
          >
            Assignments
          </button>
          <button
            className={`btn-secondary ${selectedType === 'quiz' ? 'btn-primary' : ''}`}
            onClick={() => setSelectedType('quiz')}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
          >
            Quizzes
          </button>
        </div>
      </div>

      {isError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {isLoading && !selectedAssignment ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          Loading your assignments & quizzes...
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No Coursework Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are currently no assignments or quizzes posted for your enrolled courses.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredAssignments.map((assignment) => {
            const submission = assignment.submission;
            const dueDate = new Date(assignment.dueDate);
            const now = new Date();
            const isPastDue = now > dueDate;
            
            // Phase 3 Lock Logic: Locked if past due date AND status is NOT 'reopened'
            const isSubmissionLocked = isPastDue && (!submission || submission.status !== 'reopened');
            const isReopened = submission?.status === 'reopened';
            const isSubmitted = submission?.status === 'submitted' || submission?.status === 'locked';
            const isReopenRequested = submission?.reopenRequested;

            return (
              <div
                key={assignment._id}
                className="glass-card"
                style={{
                  borderLeft: `4px solid ${
                    isReopened
                      ? 'var(--accent-primary)'
                      : isSubmissionLocked
                      ? 'var(--danger)'
                      : isSubmitted
                      ? 'var(--accent-primary)'
                      : 'var(--accent-orange)'
                  }`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  
                  {/* LEFT DETAILS */}
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span className={`badge ${assignment.type === 'quiz' ? 'badge-teacher' : 'badge-student'}`} style={{ textTransform: 'capitalize' }}>
                        {assignment.type}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        {assignment.courseId?.title || 'Subject Course'}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        • Instructor: {assignment.teacherId?.name || 'Teacher'}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                      {assignment.title}
                    </h2>

                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                      {assignment.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isPastDue ? 'var(--danger)' : 'var(--text-muted)', fontWeight: isPastDue ? 600 : 400 }}>
                        <Clock size={16} color={isPastDue ? 'var(--danger)' : 'var(--accent-primary)'} />
                        Due: {dueDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>

                      {isPastDue && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)', fontWeight: 600 }}>
                          <Lock size={14} /> Submission Deadline Passed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RIGHT SUBMISSION STATUS & ACTIONS */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', minWidth: '220px' }}>
                    
                    {/* STATUS BADGES */}
                    {submission ? (
                      <div>
                        {isReopened ? (
                          <span className="badge badge-teacher" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Unlock size={14} /> Submission Reopened
                          </span>
                        ) : isSubmissionLocked ? (
                          <span className="badge badge-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Lock size={14} /> Locked Submission
                          </span>
                        ) : (
                          <span className="badge badge-student" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <FileCheck size={14} /> Submitted
                          </span>
                        )}
                      </div>
                    ) : isSubmissionLocked ? (
                      <span className="badge badge-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Lock size={14} /> Locked (Missing Submission)
                      </span>
                    ) : (
                      <span className="badge badge-teacher" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} /> Pending Submission
                      </span>
                    )}

                    {/* ACTION BUTTONS */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      
                      {/* DOWNLOAD SUBMITTED FILE BUTTON */}
                      {submission?.fileUrl && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={() => handleDownload(submission._id)}
                        >
                          <Download size={15} /> Download Submission
                        </button>
                      )}

                      {/* UPLOAD / EDIT BUTTON (Allowed if NOT locked or if reopened) */}
                      {(!isSubmissionLocked || isReopened) && (
                        <button
                          className="btn-primary"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={() => handleOpenSubmitModal(assignment)}
                        >
                          {submission ? <Edit size={15} /> : <Upload size={15} />}
                          {submission ? 'Edit / Re-upload' : 'Upload Submission'}
                        </button>
                      )}

                      {/* REQUEST REOPEN BUTTON — SHOWN ONLY WHEN LOCKED! */}
                      {isSubmissionLocked && !isReopened && (
                        <button
                          className="btn-secondary"
                          disabled={isReopenRequested}
                          style={{
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: isReopenRequested ? 'var(--text-muted)' : 'var(--danger)',
                          }}
                          onClick={() => handleRequestReopen(assignment)}
                        >
                          <Send size={14} />
                          {isReopenRequested ? 'Reopen Requested' : 'Request Reopen'}
                        </button>
                      )}

                    </div>

                    {/* REOPEN FEEDBACK NOTIFICATION */}
                    {reopenFeedback[assignment._id] && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textAlign: 'right', marginTop: '0.25rem', fontWeight: 600 }}>
                        {reopenFeedback[assignment._id]}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        currentPage={pagination?.page || 1}
        totalPages={pagination?.totalPages || 1}
        total={pagination?.total || 0}
        limit={pagination?.limit || 10}
        onPageChange={(page) => dispatch(fetchStudentAssignments({ page, limit: 10 }))}
      />

      {/* UPLOAD / EDIT SUBMISSION MODAL */}
      {selectedAssignment && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '540px', width: '90%' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
              {selectedAssignment.submission ? 'Edit Submission' : 'Submit Coursework'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {selectedAssignment.title} ({selectedAssignment.courseId?.title})
            </p>

            {isError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmitOrEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Upload File Attachment</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label className="form-label">Or Provide Online File / Project Link (URL)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. https://drive.google.com/... or https://github.com/..."
                  value={fileUrlInput}
                  onChange={(e) => setFileUrlInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedAssignment(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading || (!fileInput && !fileUrlInput)}
                >
                  {isLoading ? 'Submitting...' : selectedAssignment.submission ? 'Save Re-upload' : 'Submit File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;

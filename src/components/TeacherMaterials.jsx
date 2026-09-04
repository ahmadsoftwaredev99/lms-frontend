import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTeacherMaterials,
  uploadMaterial,
  deleteMaterial,
} from '../features/material/materialSlice';
import { fetchTeacherCourses } from '../features/attendance/attendanceSlice';
import { FolderDown, Plus, Trash2, ExternalLink, Download, Book, FileText, File, AlertCircle, Link2, UploadCloud } from 'lucide-react';
import Pagination from './Pagination';

const TeacherMaterials = () => {
  const dispatch = useDispatch();
  const { materials, pagination, isLoading, isError, message } = useSelector((state) => state.material);
  const { teacherCourses } = useSelector((state) => state.attendance);

  const [showAddModal, setShowAddModal] = useState(false);
  const [materialMode, setMaterialMode] = useState('file'); // 'file' | 'link'
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    fileUrl: '',
    type: 'note',
  });
  const [fileInput, setFileInput] = useState(null);

  useEffect(() => {
    dispatch(fetchTeacherMaterials({ page: 1, limit: 10 }));
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileInput(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (materialMode === 'file') {
      if (fileInput) {
        const data = new FormData();
        data.append('courseId', formData.courseId);
        data.append('title', formData.title);
        data.append('type', formData.type);
        data.append('materialType', 'file');
        data.append('file', fileInput);
        dispatch(uploadMaterial(data));
      } else if (formData.fileUrl) {
        dispatch(
          uploadMaterial({
            courseId: formData.courseId,
            title: formData.title,
            type: formData.type,
            materialType: 'file',
            fileUrl: formData.fileUrl,
          })
        );
      }
    } else {
      // Link mode
      dispatch(
        uploadMaterial({
          courseId: formData.courseId,
          title: formData.title,
          type: formData.type,
          materialType: 'link',
          fileUrl: formData.fileUrl,
        })
      );
    }

    setShowAddModal(false);
    setFileInput(null);
    setFormData({
      courseId: teacherCourses[0]?._id || '',
      title: '',
      fileUrl: '',
      type: 'note',
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this study material?')) {
      dispatch(deleteMaterial(id));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'book':
        return <Book size={20} color="var(--accent-orange)" />;
      case 'note':
        return <FileText size={20} color="var(--accent-primary)" />;
      default:
        return <File size={20} color="var(--accent-orange)" />;
    }
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--accent-primary)' }}>Teacher Study Materials</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Upload lecture notes, textbooks, and resource links for your enrolled students
          </p>
        </div>

        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add Study Material
        </button>
      </div>

      {isError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {isLoading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          Loading uploaded study materials...
        </div>
      ) : materials.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FolderDown size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No Materials Uploaded Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Click "Add Study Material" above to post study resources or links for your students.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {materials.map((item) => {
              const isLink = item.materialType === 'link';
              return (
                <div key={item._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ background: '#F1F5F9', padding: '0.6rem', borderRadius: '10px' }}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <span className={`badge ${isLink ? 'badge-admin' : 'badge-teacher'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                          {isLink ? 'Link' : 'File'}
                        </span>
                        <span className="badge badge-teacher" style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
                          {item.type}
                        </span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, margin: '0 0 1rem 0' }}>
                      Course: {item.courseId?.title || 'Taught Course'}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Uploaded: {new Date(item.uploadedAt || item.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {isLink ? (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', padding: '0.45rem', fontSize: '0.85rem', textDecoration: 'none' }}
                        >
                          <ExternalLink size={15} /> Open Link
                        </a>
                      ) : (
                        <a
                          href={item.fileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', padding: '0.45rem', fontSize: '0.85rem', textDecoration: 'none' }}
                        >
                          <Download size={15} /> Download File
                        </a>
                      )}

                      <button
                        className="btn-secondary"
                        style={{ padding: '0.45rem 0.75rem', color: 'var(--danger)' }}
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={pagination?.page || 1}
            totalPages={pagination?.totalPages || 1}
            total={pagination?.total || 0}
            limit={pagination?.limit || 10}
            onPageChange={(page) => dispatch(fetchTeacherMaterials({ page, limit: 10 }))}
          />
        </>
      )}

      {/* UPLOAD / ADD LINK MATERIAL MODAL */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="glass-card modal-content" style={{ maxWidth: '540px', width: '90%' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-primary)' }}>Add Study Material</h2>

            {/* TAB TOGGLE: UPLOAD FILE VS ADD LINK */}
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '10px', padding: '0.25rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setMaterialMode('file')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: materialMode === 'file' ? 'var(--accent-primary)' : 'transparent',
                  color: materialMode === 'file' ? 'white' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <UploadCloud size={16} /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setMaterialMode('link')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: materialMode === 'link' ? 'var(--accent-primary)' : 'transparent',
                  color: materialMode === 'link' ? 'white' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <Link2 size={16} /> Add Resource Link
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Target Course</label>
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
                <label className="form-label">Material Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder={materialMode === 'file' ? 'e.g. Chapter 4 Lecture Notes PDF' : 'e.g. Documentation Website URL'}
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Resource Type</label>
                <select
                  name="type"
                  className="form-input"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="note">Lecture Note</option>
                  <option value="book">Reference Book</option>
                  <option value="other">Other Resource</option>
                </select>
              </div>

              {materialMode === 'file' ? (
                <div>
                  <label className="form-label">Upload File Attachment</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}
                    required={!formData.fileUrl}
                  />
                </div>
              ) : (
                <div>
                  <label className="form-label">Resource Web Link (URL)</label>
                  <input
                    type="url"
                    name="fileUrl"
                    className="form-input"
                    placeholder="https://example.com/resource-link"
                    value={formData.fileUrl}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={materialMode === 'file' ? (!fileInput && !formData.fileUrl) : !formData.fileUrl}
                >
                  {materialMode === 'file' ? 'Upload File' : 'Save Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMaterials;

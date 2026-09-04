import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStudentMaterials } from '../features/material/materialSlice';
import { FolderDown, FileText, Book, File, Download, ExternalLink, Search, User } from 'lucide-react';
import Pagination from './Pagination';

const StudentMaterial = () => {
  const dispatch = useDispatch();
  const { studentMaterials, studentPagination, isLoading, isError, message } = useSelector(
    (state) => state.material
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchStudentMaterials({ page: 1, limit: 10 }));
  }, [dispatch]);

  const filteredMaterials = (studentMaterials || []).filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypeFilter === 'all' || item.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

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

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'book':
        return 'badge-teacher';
      case 'note':
        return 'badge-student';
      default:
        return 'badge-teacher';
    }
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--accent-primary)' }}>Course Study Materials</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Access notes, textbooks, slides, and reference materials provided by your instructors
          </p>
        </div>

        {/* SEARCH AND FILTERS */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search materials or courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <select
            className="form-input"
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Types</option>
            <option value="note">Notes</option>
            <option value="book">Books</option>
            <option value="other">Other Resources</option>
          </select>
        </div>
      </div>

      {isError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {message || 'Failed to fetch study materials'}
        </div>
      )}

      {isLoading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          Loading course study materials...
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FolderDown size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            {searchTerm || selectedTypeFilter !== 'all' ? 'No materials match your search filters' : 'No Study Materials Uploaded'}
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Your course instructors haven't uploaded study materials yet.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredMaterials.map((item) => {
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
                        <span className={`badge ${getTypeBadgeClass(item.type)}`} style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
                          {item.type}
                        </span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, margin: '0 0 1rem 0' }}>
                      Course: {item.courseId?.title || 'Enrolled Course'}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <User size={14} /> {item.teacherId?.name || 'Instructor'}
                      </span>
                      <span>{new Date(item.uploadedAt || item.createdAt).toLocaleDateString()}</span>
                    </div>

                    {isLink ? (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}
                      >
                        <ExternalLink size={16} /> Open Link
                      </a>
                    ) : (
                      <a
                        href={item.fileUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}
                      >
                        <Download size={16} /> Download File
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={studentPagination?.page || 1}
            totalPages={studentPagination?.totalPages || 1}
            total={studentPagination?.total || 0}
            limit={studentPagination?.limit || 10}
            onPageChange={(page) => dispatch(fetchStudentMaterials({ page, limit: 10 }))}
          />
        </>
      )}
    </div>
  );
};

export default StudentMaterial;

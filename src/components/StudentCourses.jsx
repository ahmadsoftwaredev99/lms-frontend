import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStudentCourses } from '../features/courses/coursesSlice';
import { BookOpen, User, Search, Users, CheckCircle, GraduationCap } from 'lucide-react';
import Pagination from './Pagination';

const StudentCourses = () => {
  const dispatch = useDispatch();
  const { studentCourses, studentPagination, isLoading, isError, message } = useSelector(
    (state) => state.courses
  );

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchStudentCourses({ page: 1, limit: 10 }));
  }, [dispatch]);

  const filteredCourses = (studentCourses || []).filter(
    (c) =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--accent-primary)' }}>My Enrolled Courses</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            View your active subjects, assigned teachers, and course details
          </p>
        </div>

        {/* SEARCH BAR */}
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search enrolled courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {isError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {message || 'Failed to fetch enrolled courses'}
        </div>
      )}

      {isLoading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          Loading your enrolled courses...
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            {searchTerm ? 'No courses match your search filter' : 'No Enrolled Courses Found'}
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {searchTerm ? 'Try adjusting your search query' : 'You are currently not enrolled in any courses. Please contact your system admin.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredCourses.map((course) => {
            const teacherName = course.teacherId?.name || 'Unassigned';
            const teacherEmail = course.teacherId?.email || '';
            const enrolledCount = course.enrolledStudents?.length || 0;

            return (
              <div key={course._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ background: '#F1F5F9', padding: '0.6rem', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                      <GraduationCap size={24} />
                    </div>
                    <span className="badge badge-student" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                      <CheckCircle size={12} /> Enrolled
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    {course.title}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem', minHeight: '42px' }}>
                    {course.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <User size={16} color="var(--accent-primary)" />
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', color: 'var(--text-main)' }}>
                        Instructor: {teacherName}
                      </span>
                      {teacherEmail && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{teacherEmail}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={14} /> {enrolledCount} Peers Enrolled
                    </span>
                    <span>Course ID: ...{course._id?.slice(-6)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        currentPage={studentPagination?.page || 1}
        totalPages={studentPagination?.totalPages || 1}
        total={studentPagination?.total || 0}
        limit={studentPagination?.limit || 10}
        onPageChange={(page) => dispatch(fetchStudentCourses({ page, limit: 10 }))}
      />
    </div>
  );
};

export default StudentCourses;

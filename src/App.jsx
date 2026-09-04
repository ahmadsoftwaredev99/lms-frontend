import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { logout } from './features/auth/authSlice';

import ProtectedRoute from './components/ProtectedRoute';
import LoginRegister from './components/LoginRegister';
import TeacherRegister from './components/TeacherRegister';

// Admin Components
import Sidebar from './components/Sidebar';
import StatsOverview from './components/StatsOverview';
import CoursesAdmin from './components/CoursesAdmin';
import TeachersAdmin from './components/TeachersAdmin';
import StudentsAdmin from './components/StudentsAdmin';

// Teacher Components
import TeacherDashboard from './components/TeacherDashboard';

// Student Components
import StudentSidebar from './components/StudentSidebar';
import StudentProfile from './components/StudentProfile';
import StudentCourses from './components/StudentCourses';
import StudentAttendance from './components/StudentAttendance';
import StudentAssignments from './components/StudentAssignments';
import StudentMaterial from './components/StudentMaterial';

import { GraduationCap, LogOut } from 'lucide-react';

/* ADMIN DASHBOARD CONTAINER */
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div className="admin-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {activeTab === 'overview' && <StatsOverview />}
        {activeTab === 'courses' && <CoursesAdmin />}
        {activeTab === 'teachers' && <TeachersAdmin />}
        {activeTab === 'students' && <StudentsAdmin />}
      </main>
    </div>
  );
};

/* STUDENT DASHBOARD CONTAINER */
const StudentDashboard = () => {
  const [studentTab, setStudentTab] = useState('profile');
  return (
    <div className="admin-layout">
      <StudentSidebar activeTab={studentTab} setActiveTab={setStudentTab} />
      <main>
        {studentTab === 'profile' && <StudentProfile />}
        {studentTab === 'courses' && <StudentCourses />}
        {studentTab === 'attendance' && <StudentAttendance />}
        {studentTab === 'assignments' && <StudentAssignments />}
        {studentTab === 'materials' && <StudentMaterial />}
      </main>
    </div>
  );
};

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register/teacher';

  return (
    <div className="app-container">
      {/* HEADER (Shown on authenticated pages) */}
      {!isAuthPage && user && (
        <header className="header-glass">
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <GraduationCap size={32} color="var(--accent-primary)" />
            <span>
              {user?.role === 'student'
                ? 'LMS Student Portal'
                : user?.role === 'teacher'
                ? 'LMS Teacher Portal'
                : 'LMS Admin Portal'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className={`badge badge-${user.role}`} style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {user.role}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img
                src={
                  user?.profile?.avatar ||
                  (user?.gender === 'female'
                    ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'
                    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300')
                }
                alt={user.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--accent-primary)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <span style={{ fontWeight: 600 }}>{user.name}</span>
            </div>
            <button
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem' }}
              onClick={handleLogout}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>
      )}

      {/* ROUTING SYSTEM */}
      <Routes>
        {/* PUBLIC AUTH ROUTES */}
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/register/teacher" element={<TeacherRegister />} />

        {/* ROLE PROTECTED DASHBOARD ROUTES */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* ROOT & FALLBACK REDIRECTS */}
        <Route
          path="/"
          element={
            user ? (
              user.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : user.role === 'teacher' ? (
                <Navigate to="/teacher" replace />
              ) : (
                <Navigate to="/student" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
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
import AdminProfile from './components/AdminProfile';

// Teacher Components
import TeacherDashboard from './components/TeacherDashboard';

// Student Components
import StudentSidebar from './components/StudentSidebar';
import StudentProfile from './components/StudentProfile';
import StudentCourses from './components/StudentCourses';
import StudentAttendance from './components/StudentAttendance';
import StudentAssignments from './components/StudentAssignments';
import StudentMaterial from './components/StudentMaterial';

// Shared Components
import TopBar from './components/TopBar';

/* ========================================================
   ADMIN DASHBOARD CONTAINER
   ======================================================== */
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const getInitialTab = () => {
    if (location.pathname.includes('/profile')) return 'profile';
    if (location.pathname.includes('/courses')) return 'courses';
    if (location.pathname.includes('/teachers')) return 'teachers';
    if (location.pathname.includes('/students')) return 'students';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    if (location.pathname.endsWith('/profile')) {
      setActiveTab('profile');
    }
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'profile') {
      navigate('/admin/profile');
    } else {
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'overview':
        return 'Executive Overview';
      case 'courses':
        return 'Course Management';
      case 'teachers':
        return 'Teacher & Faculty Management';
      case 'students':
        return 'Student Directory & Records';
      case 'profile':
        return 'Administrator Profile';
      default:
        return 'Admin Portal';
    }
  };

  return (
    <div className="nexus-app-layout" data-portal="admin">
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

      <div className="nexus-main-viewport">
        <TopBar
          title={getPageTitle(activeTab)}
          user={user}
          onProfileClick={() => handleTabChange('profile')}
          onLogout={handleLogout}
        />

        <main className="nexus-content-area">
          {activeTab === 'overview' && <StatsOverview />}
          {activeTab === 'courses' && <CoursesAdmin />}
          {activeTab === 'teachers' && <TeachersAdmin />}
          {activeTab === 'students' && <StudentsAdmin />}
          {activeTab === 'profile' && <AdminProfile />}
        </main>
      </div>
    </div>
  );
};

/* ========================================================
   STUDENT DASHBOARD CONTAINER
   ======================================================== */
const StudentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const getInitialTab = () => {
    if (location.pathname.includes('/courses')) return 'courses';
    if (location.pathname.includes('/attendance')) return 'attendance';
    if (location.pathname.includes('/assignments')) return 'assignments';
    if (location.pathname.includes('/materials')) return 'materials';
    return 'profile';
  };

  const [studentTab, setStudentTab] = useState(getInitialTab);

  useEffect(() => {
    if (location.pathname.endsWith('/profile')) {
      setStudentTab('profile');
    }
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setStudentTab(tabId);
    if (tabId === 'profile') {
      navigate('/student/profile');
    } else {
      navigate('/student');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'profile':
        return 'Student Profile';
      case 'courses':
        return 'Enrolled Courses';
      case 'attendance':
        return 'Attendance Tracker';
      case 'assignments':
        return 'Assignments & Quizzes';
      case 'materials':
        return 'Course Study Materials';
      default:
        return 'Student Portal';
    }
  };

  return (
    <div className="nexus-app-layout" data-portal="student">
      <StudentSidebar activeTab={studentTab} setActiveTab={handleTabChange} />

      <div className="nexus-main-viewport">
        <TopBar
          title={getPageTitle(studentTab)}
          user={user}
          onProfileClick={() => handleTabChange('profile')}
          onLogout={handleLogout}
        />

        <main className="nexus-content-area">
          {studentTab === 'profile' && <StudentProfile />}
          {studentTab === 'courses' && <StudentCourses />}
          {studentTab === 'attendance' && <StudentAttendance />}
          {studentTab === 'assignments' && <StudentAssignments />}
          {studentTab === 'materials' && <StudentMaterial />}
        </main>
      </div>
    </div>
  );
};

/* ========================================================
   MAIN APPLICATION ROUTER
   ======================================================== */
function App() {
  const { user } = useSelector((state) => state.auth);

  return (
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
  );
}

export default App;

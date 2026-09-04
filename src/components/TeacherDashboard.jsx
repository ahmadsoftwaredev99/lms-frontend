import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import TeacherSidebar from './TeacherSidebar';
import AttendanceTeacher from './AttendanceTeacher';
import TeacherCoursesRoster from './TeacherCoursesRoster';
import AssignmentsTeacher from './AssignmentsTeacher';
import TeacherMaterials from './TeacherMaterials';
import TeacherProfile from './TeacherProfile';
import TopBar from './TopBar';

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const getInitialTab = () => {
    if (location.pathname.includes('/profile')) return 'profile';
    if (location.pathname.includes('/roster') || location.pathname.includes('/courses')) return 'roster';
    if (location.pathname.includes('/assignments')) return 'assignments';
    if (location.pathname.includes('/material')) return 'material';
    return 'attendance';
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
      navigate('/teacher/profile');
    } else {
      navigate('/teacher');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'attendance':
        return 'Attendance Roster';
      case 'roster':
        return 'Course Rosters & Student Enrollment';
      case 'assignments':
        return 'Assignments & Quizzes';
      case 'material':
        return 'Study Materials';
      case 'profile':
        return 'Faculty Profile';
      default:
        return 'Teacher Dashboard';
    }
  };

  return (
    <div className="nexus-app-layout" data-portal="teacher">
      <TeacherSidebar activeTab={activeTab} setActiveTab={handleTabChange} />

      <div className="nexus-main-viewport">
        <TopBar
          title={getPageTitle(activeTab)}
          user={user}
          onProfileClick={() => handleTabChange('profile')}
          onLogout={handleLogout}
        />

        <main className="nexus-content-area">
          {activeTab === 'attendance' && <AttendanceTeacher />}
          {activeTab === 'roster' && <TeacherCoursesRoster />}
          {activeTab === 'assignments' && <AssignmentsTeacher />}
          {activeTab === 'material' && <TeacherMaterials />}
          {activeTab === 'profile' && <TeacherProfile />}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;

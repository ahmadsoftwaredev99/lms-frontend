import React from 'react';
import { CalendarCheck, FileText, FolderUp, User, GraduationCap, Users } from 'lucide-react';

const TeacherSidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'attendance', label: 'Attendance Roster', icon: CalendarCheck },
    { id: 'roster', label: 'Course Rosters & Enroll', icon: Users },
    { id: 'assignments', label: 'Assignments & Quizzes', icon: FileText },
    { id: 'material', label: 'Study Materials', icon: FolderUp },
    { id: 'profile', label: 'Teacher Profile', icon: User },
  ];

  return (
    <aside className="sidebar-container" data-portal="teacher">
      <div className="sidebar-header">
        <div style={{ background: 'rgba(124, 58, 237, 0.25)', padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GraduationCap size={24} color="#C4B5FD" />
        </div>
        <div>
          <div className="sidebar-brand-title">Nexus LMS</div>
          <div className="sidebar-brand-subtitle">Teacher Portal</div>
        </div>
      </div>

      <div className="sidebar-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default TeacherSidebar;

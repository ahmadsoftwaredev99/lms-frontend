import React from 'react';
import { User, BookOpen, Calendar, FileText, FolderDown, GraduationCap } from 'lucide-react';

const StudentSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'attendance', label: 'Attendance View', icon: Calendar },
    { id: 'assignments', label: 'Assignments & Quizzes', icon: FileText },
    { id: 'materials', label: 'Study Material', icon: FolderDown },
  ];

  return (
    <aside className="sidebar-container" data-portal="student">
      <div className="sidebar-header">
        <div style={{ background: 'rgba(20, 184, 166, 0.25)', padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GraduationCap size={24} color="#5EEAD4" />
        </div>
        <div>
          <div className="sidebar-brand-title">Nexus LMS</div>
          <div className="sidebar-brand-subtitle">Student Portal</div>
        </div>
      </div>
      <nav className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default StudentSidebar;

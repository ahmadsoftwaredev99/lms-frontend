import React from 'react';
import { User, BookOpen, Calendar, FileText, FolderDown } from 'lucide-react';

const StudentSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'attendance', label: 'Attendance View', icon: Calendar },
    { id: 'assignments', label: 'Assignments & Quizzes', icon: FileText },
    { id: 'materials', label: 'Study Material', icon: FolderDown },
  ];

  return (
    <aside className="sidebar-glass">
      <div style={{ padding: '0 0.5rem 1rem 0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.5px' }}>
          STUDENT PORTAL
        </h3>
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

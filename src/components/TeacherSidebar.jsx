import React from 'react';
import { CalendarCheck, FileText, FolderUp, BookOpen } from 'lucide-react';

const TeacherSidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'attendance', label: 'Attendance Roster', icon: CalendarCheck },
    { id: 'assignments', label: 'Assignments & Quizzes', icon: FileText },
    { id: 'material', label: 'Study Materials', icon: FolderUp },
  ];

  return (
    <aside className="sidebar-container">
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
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default TeacherSidebar;

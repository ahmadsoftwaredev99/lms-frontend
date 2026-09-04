import React from 'react';
import { LayoutDashboard, BookOpen, Users, UserCheck } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses Management', icon: BookOpen },
    { id: 'teachers', label: 'Teachers Management', icon: Users },
    { id: 'students', label: 'Students Management', icon: UserCheck },
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

export default Sidebar;

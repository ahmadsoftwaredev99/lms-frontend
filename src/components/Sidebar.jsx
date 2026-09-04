import React from 'react';
import { LayoutDashboard, BookOpen, Users, UserCheck, User, GraduationCap } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses Management', icon: BookOpen },
    { id: 'teachers', label: 'Teachers Management', icon: Users },
    { id: 'students', label: 'Students Management', icon: UserCheck },
    { id: 'profile', label: 'Admin Profile', icon: User },
  ];

  return (
    <aside className="sidebar-container" data-portal="admin">
      <div className="sidebar-header">
        <div style={{ background: 'rgba(79, 70, 229, 0.25)', padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GraduationCap size={24} color="#A78BFA" />
        </div>
        <div>
          <div className="sidebar-brand-title">Nexus LMS</div>
          <div className="sidebar-brand-subtitle">Admin Portal</div>
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

export default Sidebar;

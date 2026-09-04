import React from 'react';
import { Bell, LogOut } from 'lucide-react';

const TopBar = ({ title, user, onProfileClick, onLogout }) => {
  const defaultAvatar =
    user?.gender === 'female'
      ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300';

  const avatarSrc = user?.profile?.avatar || defaultAvatar;

  return (
    <header className="nexus-topbar">
      <h1 className="nexus-page-title">{title || 'Dashboard'}</h1>

      <div className="nexus-topbar-actions">
        {/* NOTIFICATION BELL */}
        <button
          type="button"
          className="nexus-icon-button"
          title="Notifications"
          aria-label="View notifications"
        >
          <Bell size={20} />
          <span className="nexus-notification-badge" />
        </button>

        {/* ROLE BADGE */}
        <span className={`badge badge-${user?.role || 'student'}`}>
          {user?.role}
        </span>

        {/* CLICKABLE PROFILE PILL */}
        <div
          className="nexus-profile-pill"
          onClick={onProfileClick}
          role="button"
          tabIndex={0}
          title="Open Profile Settings"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onProfileClick();
            }
          }}
        >
          <img
            src={avatarSrc}
            alt={user?.name || 'User Profile'}
            className="nexus-avatar-img"
          />
          <span className="nexus-user-name">{user?.name}</span>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          type="button"
          className="btn-secondary"
          onClick={onLogout}
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.88rem' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
};

export default TopBar;

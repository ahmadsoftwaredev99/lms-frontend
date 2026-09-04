import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  resetProfileState,
} from '../features/profile/profileSlice';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Camera,
  Shield,
  CheckCircle,
  AlertCircle,
  Users,
  UserCheck,
  BookOpen,
  Save,
  KeyRound,
} from 'lucide-react';
import './AdminProfile.css';

const AdminProfile = () => {
  const dispatch = useDispatch();
  const {
    profile,
    stats,
    isLoading,
    isError,
    isSuccess,
    message,
    passwordLoading,
    passwordError,
    passwordSuccess,
    passwordMessage,
  } = useSelector((state) => state.profile);
  const { user } = useSelector((state) => state.auth);

  const DEFAULT_AVATAR =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: 'male',
    phone: '',
    bio: '',
    avatarUrl: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordValidationErr, setPasswordValidationErr] = useState('');

  useEffect(() => {
    dispatch(fetchAdminProfile());
  }, [dispatch]);

  useEffect(() => {
    const current = profile || user;
    if (current) {
      setFormData({
        name: current.name || '',
        email: current.email || '',
        gender: current.gender || 'male',
        phone: current.profile?.phone || '',
        bio: current.profile?.bio || '',
        avatarUrl: current.profile?.avatar || '',
      });
    }
  }, [profile, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordValidationErr('');
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    dispatch(resetProfileState());

    if (avatarFile) {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('gender', formData.gender);
      data.append('phone', formData.phone);
      data.append('bio', formData.bio);
      data.append('avatar', avatarFile);
      dispatch(updateAdminProfile(data));
    } else {
      dispatch(
        updateAdminProfile({
          name: formData.name,
          email: formData.email,
          gender: formData.gender,
          phone: formData.phone,
          bio: formData.bio,
          avatar: formData.avatarUrl,
        })
      );
    }
  };

  const handleCancelProfile = () => {
    dispatch(resetProfileState());
    const current = profile || user;
    if (current) {
      setFormData({
        name: current.name || '',
        email: current.email || '',
        gender: current.gender || 'male',
        phone: current.profile?.phone || '',
        bio: current.profile?.bio || '',
        avatarUrl: current.profile?.avatar || '',
      });
      setAvatarFile(null);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordValidationErr('');

    if (passwordData.newPassword.length < 6) {
      setPasswordValidationErr('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordValidationErr('New password and confirm password do not match.');
      return;
    }

    dispatch(
      changeAdminPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
    );
  };

  useEffect(() => {
    if (passwordSuccess) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [passwordSuccess]);

  const currentProfile = profile || user;
  const avatarSrc = currentProfile?.profile?.avatar || DEFAULT_AVATAR;
  const joinDate = currentProfile?.createdAt
    ? new Date(currentProfile.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'System Initialized';

  return (
    <div className="admin-profile-container">
      {/* HEADER BANNER */}
      <div className="admin-profile-header-banner">
        <div className="admin-profile-title-group">
          <h1 className="admin-profile-title">Administrator Profile</h1>
          <p className="admin-profile-subtitle">
            Manage your executive account credentials, personal information, and security
          </p>
        </div>
        <span className="admin-role-badge">
          <Shield size={14} /> System Administrator
        </span>
      </div>

      <div className="admin-profile-grid">
        {/* LEFT COLUMN: IDENTITY & READ-ONLY SUMMARY STATS */}
        <div className="admin-profile-left-col">
          <div className="admin-identity-card">
            <div className="admin-avatar-container">
              <img
                src={avatarSrc}
                alt={currentProfile?.name || 'Administrator'}
                className="admin-avatar-img"
              />
              <div className="admin-avatar-badge">
                <Shield size={16} />
              </div>
            </div>

            <h2 className="admin-name">{currentProfile?.name || 'Admin User'}</h2>
            <div className="admin-email-text">{currentProfile?.email || 'admin@lms.com'}</div>
            <span className="admin-role-badge">Super Admin</span>

            <div className="admin-meta-list">
              <div className="admin-meta-item">
                <span className="admin-meta-icon"><Mail size={16} /></span>
                <span>Email: <strong className="admin-meta-val">{currentProfile?.email}</strong></span>
              </div>
              <div className="admin-meta-item">
                <span className="admin-meta-icon"><Phone size={16} /></span>
                <span>Phone: <strong className="admin-meta-val">{currentProfile?.profile?.phone || 'Not specified'}</strong></span>
              </div>
              <div className="admin-meta-item">
                <span className="admin-meta-icon"><Calendar size={16} /></span>
                <span>Joined: <strong className="admin-meta-val">{joinDate}</strong></span>
              </div>
            </div>
          </div>

          {/* SUMMARY STATS (Read-only for Admin Profile) */}
          <div className="admin-stats-summary-card">
            <div className="admin-stats-card-title">
              <BookOpen size={16} color="var(--primary)" /> Managed Resources
            </div>

            <div className="admin-stats-boxes-grid">
              <div className="admin-stat-box-lavender">
                <div className="admin-stat-number">{stats?.totalTeachers ?? '...'}</div>
                <div className="admin-stat-desc">Teachers</div>
              </div>

              <div className="admin-stat-box-white">
                <div className="admin-stat-number">{stats?.totalStudents ?? '...'}</div>
                <div className="admin-stat-desc">Students</div>
              </div>

              <div className="admin-stat-box-white">
                <div className="admin-stat-number">{stats?.totalCourses ?? '...'}</div>
                <div className="admin-stat-desc">Courses</div>
              </div>

              <div className="admin-stat-box-lavender">
                <div className="admin-stat-number">Active</div>
                <div className="admin-stat-desc">Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EDIT PROFILE & CHANGE PASSWORD */}
        <div className="admin-profile-right-col">
          {/* EDIT DETAILS CARD */}
          <div className="admin-edit-card">
            <div className="admin-card-header">
              <h2 className="admin-card-header-title">
                <User size={20} color="var(--primary)" /> Personal Details
              </h2>
            </div>

            {isSuccess && (
              <div className="admin-alert-success">
                <CheckCircle size={18} />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {isError && (
              <div className="admin-alert-error">
                <AlertCircle size={18} />
                <span>{message || 'Failed to update profile'}</span>
              </div>
            )}

            <form className="admin-form" onSubmit={handleProfileSubmit}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Full Name</label>
                  <div className="admin-input-wrapper">
                    <span className="admin-input-icon"><User size={16} /></span>
                    <input
                      type="text"
                      name="name"
                      className="admin-input"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Email Address</label>
                  <div className="admin-input-wrapper">
                    <span className="admin-input-icon"><Mail size={16} /></span>
                    <input
                      type="email"
                      name="email"
                      className="admin-input"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Phone Number</label>
                  <div className="admin-input-wrapper">
                    <span className="admin-input-icon"><Phone size={16} /></span>
                    <input
                      type="text"
                      name="phone"
                      className="admin-input"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +1 555-0199"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Gender</label>
                  <select
                    name="gender"
                    className="admin-input"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group-full">
                <label className="admin-label">Bio / Profile Notes</label>
                <textarea
                  name="bio"
                  className="admin-textarea"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about your role, responsibilities, or notes..."
                />
              </div>

              <div className="admin-form-group-full">
                <label className="admin-label">Profile Avatar</label>
                <div className="admin-avatar-upload-box">
                  <div>
                    <div className="admin-upload-subtext">Upload Image File:</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="admin-file-input"
                    />
                  </div>
                  <div>
                    <div className="admin-upload-subtext">Or Avatar Image URL:</div>
                    <input
                      type="text"
                      name="avatarUrl"
                      className="admin-input"
                      value={formData.avatarUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-btn-cancel"
                  onClick={handleCancelProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-save"
                  disabled={isLoading}
                >
                  <Save size={16} />
                  {isLoading ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* CHANGE PASSWORD CARD */}
          <div className="admin-password-card">
            <div className="admin-card-header">
              <h2 className="admin-card-header-title">
                <KeyRound size={20} color="var(--primary)" /> Change Password
              </h2>
            </div>

            {passwordSuccess && (
              <div className="admin-alert-success">
                <CheckCircle size={18} />
                <span>{passwordMessage || 'Password updated successfully!'}</span>
              </div>
            )}

            {(passwordError || passwordValidationErr) && (
              <div className="admin-alert-error">
                <AlertCircle size={18} />
                <span>{passwordValidationErr || passwordMessage || 'Failed to update password'}</span>
              </div>
            )}

            <form className="admin-form" onSubmit={handlePasswordSubmit}>
              <div className="admin-form-group-full">
                <label className="admin-label">Current Password</label>
                <div className="admin-input-wrapper">
                  <span className="admin-input-icon"><Lock size={16} /></span>
                  <input
                    type="password"
                    name="currentPassword"
                    className="admin-input"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">New Password</label>
                  <div className="admin-input-wrapper">
                    <span className="admin-input-icon"><Lock size={16} /></span>
                    <input
                      type="password"
                      name="newPassword"
                      className="admin-input"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Confirm New Password</label>
                  <div className="admin-input-wrapper">
                    <span className="admin-input-icon"><Lock size={16} /></span>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="admin-input"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-actions">
                <button
                  type="submit"
                  className="admin-btn-save"
                  disabled={passwordLoading}
                >
                  <KeyRound size={16} />
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

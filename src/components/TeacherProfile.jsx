import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTeacherProfile,
  updateTeacherProfile,
  changeTeacherPassword,
  resetProfileState,
} from '../features/profile/profileSlice';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Lock,
  Camera,
  CheckCircle,
  AlertCircle,
  Building,
  GraduationCap,
  Save,
  KeyRound,
  Users,
} from 'lucide-react';
import './TeacherProfile.css';

const TeacherProfile = () => {
  const dispatch = useDispatch();
  const {
    profile,
    assignedCourses,
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
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300';

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: 'female',
    phone: '',
    department: '',
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
    dispatch(fetchTeacherProfile());
  }, [dispatch]);

  useEffect(() => {
    const current = profile || user;
    if (current) {
      setFormData({
        name: current.name || '',
        email: current.email || '',
        gender: current.gender || 'female',
        phone: current.profile?.phone || '',
        department: current.profile?.department || '',
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
      data.append('department', formData.department);
      data.append('bio', formData.bio);
      data.append('avatar', avatarFile);
      dispatch(updateTeacherProfile(data));
    } else {
      dispatch(
        updateTeacherProfile({
          name: formData.name,
          email: formData.email,
          gender: formData.gender,
          phone: formData.phone,
          department: formData.department,
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
        gender: current.gender || 'female',
        phone: current.profile?.phone || '',
        department: current.profile?.department || '',
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
      changeTeacherPassword({
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

  return (
    <div className="teacher-profile-container">
      {/* HEADER BANNER */}
      <div className="teacher-profile-header-banner">
        <div className="teacher-profile-title-group">
          <h1 className="teacher-profile-title">Faculty Profile</h1>
          <p className="teacher-profile-subtitle">
            Manage your instructor details, academic department, and login security
          </p>
        </div>
        <span className="teacher-role-badge">
          <GraduationCap size={15} /> Instructor
        </span>
      </div>

      <div className="teacher-profile-grid">
        {/* LEFT COLUMN: IDENTITY & ASSIGNED SUBJECTS/COURSES */}
        <div className="teacher-profile-left-col">
          <div className="teacher-identity-card">
            <div className="teacher-avatar-container">
              <img
                src={avatarSrc}
                alt={currentProfile?.name || 'Instructor'}
                className="teacher-avatar-img"
              />
              <div className="teacher-avatar-badge">
                <GraduationCap size={16} />
              </div>
            </div>

            <h2 className="teacher-name">{currentProfile?.name || 'Faculty Member'}</h2>
            <div className="teacher-email-text">{currentProfile?.email || 'teacher@lms.com'}</div>
            <span className="teacher-role-badge">Instructor</span>

            {formData.department && (
              <div className="teacher-department-pill">
                Dept: {formData.department}
              </div>
            )}

            <div className="teacher-meta-list">
              <div className="teacher-meta-item">
                <span className="teacher-meta-icon"><Mail size={16} /></span>
                <span>Email: <strong className="teacher-meta-val">{currentProfile?.email}</strong></span>
              </div>
              <div className="teacher-meta-item">
                <span className="teacher-meta-icon"><Phone size={16} /></span>
                <span>Phone: <strong className="teacher-meta-val">{currentProfile?.profile?.phone || 'Not specified'}</strong></span>
              </div>
              <div className="teacher-meta-item">
                <span className="teacher-meta-icon"><Building size={16} /></span>
                <span>Department: <strong className="teacher-meta-val">{formData.department || 'General Faculty'}</strong></span>
              </div>
            </div>
          </div>

          {/* ASSIGNED SUBJECTS / COURSES CARD */}
          <div className="teacher-courses-card">
            <div className="teacher-courses-card-header">
              <div className="teacher-courses-card-title">
                <BookOpen size={16} color="#7C3AED" /> Assigned Courses
              </div>
              <span className="teacher-courses-badge">
                {assignedCourses?.length || 0} Subjects
              </span>
            </div>

            {(!assignedCourses || assignedCourses.length === 0) ? (
              <div className="teacher-courses-empty">
                No courses assigned yet. Contact your administrator.
              </div>
            ) : (
              <div className="teacher-courses-list">
                {assignedCourses.map((course) => (
                  <div key={course._id} className="teacher-course-item">
                    <div>
                      <div className="teacher-course-title">{course.title}</div>
                      <div className="teacher-course-desc">{course.description || 'Course Syllabus'}</div>
                    </div>
                    <div className="teacher-course-students-count">
                      <Users size={12} /> {course.enrolledStudents?.length || 0} Enrolled
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: EDIT PROFILE & CHANGE PASSWORD */}
        <div className="teacher-profile-right-col">
          {/* EDIT DETAILS CARD */}
          <div className="teacher-edit-card">
            <div className="teacher-card-header">
              <h2 className="teacher-card-header-title">
                <User size={20} color="#7C3AED" /> Instructor Information
              </h2>
            </div>

            {isSuccess && (
              <div className="teacher-alert-success">
                <CheckCircle size={18} />
                <span>Faculty profile updated successfully!</span>
              </div>
            )}

            {isError && (
              <div className="teacher-alert-error">
                <AlertCircle size={18} />
                <span>{message || 'Failed to update profile'}</span>
              </div>
            )}

            <form className="teacher-form" onSubmit={handleProfileSubmit}>
              <div className="teacher-form-row">
                <div className="teacher-form-group">
                  <label className="teacher-label">Full Name</label>
                  <div className="teacher-input-wrapper">
                    <span className="teacher-input-icon"><User size={16} /></span>
                    <input
                      type="text"
                      name="name"
                      className="teacher-input"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                <div className="teacher-form-group">
                  <label className="teacher-label">Email Address</label>
                  <div className="teacher-input-wrapper">
                    <span className="teacher-input-icon"><Mail size={16} /></span>
                    <input
                      type="email"
                      name="email"
                      className="teacher-input"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="teacher-form-row">
                <div className="teacher-form-group">
                  <label className="teacher-label">Academic Department</label>
                  <div className="teacher-input-wrapper">
                    <span className="teacher-input-icon"><Building size={16} /></span>
                    <input
                      type="text"
                      name="department"
                      className="teacher-input"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science & Engineering"
                    />
                  </div>
                </div>

                <div className="teacher-form-group">
                  <label className="teacher-label">Phone Number</label>
                  <div className="teacher-input-wrapper">
                    <span className="teacher-input-icon"><Phone size={16} /></span>
                    <input
                      type="text"
                      name="phone"
                      className="teacher-input"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +1 555-0199"
                    />
                  </div>
                </div>
              </div>

              <div className="teacher-form-row">
                <div className="teacher-form-group">
                  <label className="teacher-label">Gender</label>
                  <select
                    name="gender"
                    className="teacher-input"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>

              <div className="teacher-form-group-full">
                <label className="teacher-label">Faculty Bio / Office Hours</label>
                <textarea
                  name="bio"
                  className="teacher-textarea"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell students about your research areas, office hours, or course guidance..."
                />
              </div>

              <div className="teacher-form-group-full">
                <label className="teacher-label">Profile Avatar</label>
                <div className="teacher-avatar-upload-box">
                  <div>
                    <div className="teacher-upload-subtext">Upload Image File:</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="teacher-file-input"
                    />
                  </div>
                  <div>
                    <div className="teacher-upload-subtext">Or Avatar Image URL:</div>
                    <input
                      type="text"
                      name="avatarUrl"
                      className="teacher-input"
                      value={formData.avatarUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
              </div>

              <div className="teacher-form-actions">
                <button
                  type="button"
                  className="teacher-btn-cancel"
                  onClick={handleCancelProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="teacher-btn-save"
                  disabled={isLoading}
                >
                  <Save size={16} />
                  {isLoading ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* CHANGE PASSWORD CARD */}
          <div className="teacher-password-card">
            <div className="teacher-card-header">
              <h2 className="teacher-card-header-title">
                <KeyRound size={20} color="#7C3AED" /> Change Password
              </h2>
            </div>

            {passwordSuccess && (
              <div className="teacher-alert-success">
                <CheckCircle size={18} />
                <span>{passwordMessage || 'Password updated successfully!'}</span>
              </div>
            )}

            {(passwordError || passwordValidationErr) && (
              <div className="teacher-alert-error">
                <AlertCircle size={18} />
                <span>{passwordValidationErr || passwordMessage || 'Failed to update password'}</span>
              </div>
            )}

            <form className="teacher-form" onSubmit={handlePasswordSubmit}>
              <div className="teacher-form-group-full">
                <label className="teacher-label">Current Password</label>
                <div className="teacher-input-wrapper">
                  <span className="teacher-input-icon"><Lock size={16} /></span>
                  <input
                    type="password"
                    name="currentPassword"
                    className="teacher-input"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />
                </div>
              </div>

              <div className="teacher-form-row">
                <div className="teacher-form-group">
                  <label className="teacher-label">New Password</label>
                  <div className="teacher-input-wrapper">
                    <span className="teacher-input-icon"><Lock size={16} /></span>
                    <input
                      type="password"
                      name="newPassword"
                      className="teacher-input"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>
                </div>

                <div className="teacher-form-group">
                  <label className="teacher-label">Confirm New Password</label>
                  <div className="teacher-input-wrapper">
                    <span className="teacher-input-icon"><Lock size={16} /></span>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="teacher-input"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="teacher-form-actions">
                <button
                  type="submit"
                  className="teacher-btn-save"
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

export default TeacherProfile;

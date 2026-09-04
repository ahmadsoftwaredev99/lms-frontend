import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStudentProfile, updateStudentProfile, resetProfileState } from '../features/profile/profileSlice';
import { Phone, Mail, FileText, Camera, Edit3, CheckCircle, AlertCircle, Shield } from 'lucide-react';

const StudentProfile = () => {
  const dispatch = useDispatch();
  const { profile, isLoading, isError, isSuccess, message } = useSelector((state) => state.profile);
  const { user } = useSelector((state) => state.auth);

  const DEFAULT_MALE = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300';
  const DEFAULT_FEMALE = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300';

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    phone: '',
    bio: '',
    avatarUrlInput: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  useEffect(() => {
    const current = profile || user;
    if (current) {
      setFormData({
        name: current.name || '',
        gender: current.gender || 'male',
        phone: current.profile?.phone || '',
        bio: current.profile?.bio || '',
        avatarUrlInput: current.profile?.avatar || '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(resetProfileState());

    if (avatarFile) {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('gender', formData.gender);
      data.append('phone', formData.phone);
      data.append('bio', formData.bio);
      data.append('avatar', avatarFile);
      dispatch(updateStudentProfile(data));
    } else {
      dispatch(
        updateStudentProfile({
          name: formData.name,
          gender: formData.gender,
          phone: formData.phone,
          bio: formData.bio,
          avatar: formData.avatarUrlInput,
        })
      );
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarTimestamp(Date.now());
    }
  }, [isSuccess]);

  const currentProfile = profile || user;
  const genderDefault = currentProfile?.gender === 'female' ? DEFAULT_FEMALE : DEFAULT_MALE;
  let rawAvatar = currentProfile?.profile?.avatar || genderDefault;

  // Add cache buster if custom uploaded image from server
  const avatarSrc = rawAvatar.startsWith('/uploads/')
    ? `${rawAvatar}?t=${avatarTimestamp}`
    : rawAvatar;

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--accent-primary)' }}>Student Profile</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Manage your personal information and contact details
          </p>
        </div>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => {
            dispatch(resetProfileState());
            setIsEditing(!isEditing);
          }}
        >
          <Edit3 size={18} />
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      {isSuccess && (
        <div style={{ background: 'rgba(90, 155, 74, 0.15)', border: '1px solid rgba(90, 155, 74, 0.3)', color: 'var(--accent-primary)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <CheckCircle size={18} />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {isError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{message || 'Failed to update profile'}</span>
        </div>
      )}

      {isLoading && !isEditing ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          Loading profile details...
        </div>
      ) : isEditing ? (
        /* EDIT PROFILE FORM */
        <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', color: 'var(--accent-primary)' }}>
            Edit Profile Details
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="form-label">Gender</label>
              <select
                name="gender"
                className="form-input"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                placeholder="Enter phone number (e.g. +1 555-0199)"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">Biography / About Me</label>
              <textarea
                name="bio"
                className="form-input"
                rows="4"
                placeholder="Tell your teachers and peers a bit about yourself..."
                value={formData.bio}
                onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px dashed var(--border-color)' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                <Camera size={16} /> Profile Picture / Avatar
              </label>
              
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Upload Image File:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Or enter Image URL:
                </label>
                <input
                  type="text"
                  name="avatarUrlInput"
                  className="form-input"
                  placeholder="https://example.com/avatar.jpg or /uploads/my-pic.jpg"
                  value={formData.avatarUrlInput}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* PROFILE DISPLAY VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
          {/* LEFT AVATAR CARD */}
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 1.25rem' }}>
              <img
                src={avatarSrc}
                alt={currentProfile?.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--accent-primary)',
                  boxShadow: '0 8px 24px rgba(90, 155, 74, 0.25)',
                }}
                onError={(e) => {
                  e.target.src = currentProfile?.gender === 'female' ? DEFAULT_FEMALE : DEFAULT_MALE;
                }}
              />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>{currentProfile?.name}</h2>
            <span className="badge badge-student" style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
              Student Account
            </span>

            <div style={{ marginTop: '1.5rem', textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Mail size={16} color="var(--accent-primary)" />
                <span>{currentProfile?.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Phone size={16} color="var(--accent-primary)" />
                <span>{currentProfile?.profile?.phone || 'No phone provided'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Shield size={16} color="var(--accent-primary)" />
                <span>Role Scoped: Student</span>
              </div>
            </div>
          </div>

          {/* RIGHT DETAILS CARD */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', color: 'var(--accent-primary)' }}>
              Personal Overview
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0.25rem 0 0 0', color: 'var(--text-main)' }}>{currentProfile?.name}</p>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered Email</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0.25rem 0 0 0', color: 'var(--text-main)' }}>{currentProfile?.email}</p>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                <FileText size={14} /> Student Biography / Notes
              </span>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: currentProfile?.profile?.bio ? 'var(--text-main)' : 'var(--text-muted)', margin: '0.5rem 0 0 0', fontStyle: currentProfile?.profile?.bio ? 'normal' : 'italic' }}>
                {currentProfile?.profile?.bio || 'No biography added yet. Click "Edit Profile" above to share your background, academic interests, or contact preferences.'}
              </p>
            </div>

            <div style={{ background: 'rgba(90, 155, 74, 0.08)', border: '1px solid rgba(90, 155, 74, 0.2)', padding: '1rem 1.25rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700 }}>Account Security Status</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.1rem 0 0 0' }}>Authenticated via JWT token & scoped student role permissions</p>
              </div>
              <span style={{ background: '#DCFCE7', color: '#16A34A', border: '1px solid #86EFAC', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                Active & Verified
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;

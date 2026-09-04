import React, { useState } from 'react';
import { User, Lock, Mail, Phone } from 'lucide-react';

const StudentRegistrationForm = ({
  mode = 'public', // 'public' | 'admin'
  onSubmit,
  isLoading = false,
  isError = false,
  errorMessage = '',
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'male',
    phone: '',
    bio: '',
    avatarUrlInput: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        name: formData.name,
        email: formData.email,
        password: formData.password || (mode === 'admin' ? 'TempPass123!' : ''),
        gender: formData.gender,
        profile: {
          phone: formData.phone,
          bio: formData.bio,
          avatar: formData.avatarUrlInput,
        },
      });
    }
  };

  return (
    <div>
      {isError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#dc2626',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            textAlign: 'center',
          }}
        >
          {errorMessage || 'An error occurred. Please check the entered details.'}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <label className="form-label">Full Name</label>
          <div style={{ position: 'relative' }}>
            <User
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Enter full name (e.g. John Doe)"
              value={formData.name}
              onChange={handleChange}
              style={{ paddingLeft: '2.5rem' }}
              required
            />
          </div>
        </div>

        <div>
          <label className="form-label">Gender</label>
          <select
            name="gender"
            className="form-input"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="form-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter email address (e.g. user@example.com)"
              value={formData.email}
              onChange={handleChange}
              style={{ paddingLeft: '2.5rem' }}
              required
            />
          </div>
        </div>

        <div>
          <label className="form-label">
            {mode === 'admin' ? 'Password (Default: TempPass123!)' : 'Password'}
          </label>
          <div style={{ position: 'relative' }}>
            <Lock
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder={mode === 'admin' ? 'Enter password (leave blank for TempPass123!)' : 'Enter your password'}
              value={formData.password}
              onChange={handleChange}
              style={{ paddingLeft: '2.5rem' }}
              required={mode === 'public'}
            />
          </div>
        </div>

        <div>
          <label className="form-label">Phone Number (Optional)</label>
          <div style={{ position: 'relative' }}>
            <Phone
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              name="phone"
              className="form-input"
              placeholder="Enter phone number (e.g. +1 555-0199)"
              value={formData.phone}
              onChange={handleChange}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div>
          <label className="form-label">Biography / Notes (Optional)</label>
          <textarea
            name="bio"
            className="form-input"
            rows="2"
            placeholder="Enter short bio, academic background, or notes..."
            value={formData.bio}
            onChange={handleChange}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div>
          <label className="form-label">Avatar Image URL (Optional)</label>
          <input
            type="text"
            name="avatarUrlInput"
            className="form-input"
            placeholder="Enter avatar image URL (e.g. https://example.com/avatar.jpg)"
            value={formData.avatarUrlInput}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: mode === 'admin' ? 'flex-end' : 'stretch', marginTop: '0.5rem' }}>
          {onCancel && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: mode === 'public' ? '100%' : 'auto', padding: '0.75rem 1.5rem', fontSize: '1rem' }}
          >
            {isLoading
              ? 'Creating Student...'
              : mode === 'admin'
              ? 'Create Student'
              : 'Create Student Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentRegistrationForm;
